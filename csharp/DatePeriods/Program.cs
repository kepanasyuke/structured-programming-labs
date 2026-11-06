using System;
using System.Collections.Generic;
using System.Globalization;

namespace DatePeriods;

internal static class Program
{
    private const string Month = "month";
    private const string Quarter = "quarter";
    private const string Year = "year";

    private static int Main(string[] args)
    {
        string fromText = args.Length > 0 ? args[0] : "2025-11-15";
        string toText = args.Length > 1 ? args[1] : "2026-06-30";
        string granularity = args.Length > 2 ? args[2] : Quarter;

        if (!TryParse(fromText, out DateOnly from) || !TryParse(toText, out DateOnly to))
        {
            Console.Error.WriteLine("Ошибка: некорректная дата, ожидается формат yyyy-MM-dd");
            return 1;
        }

        if (!IsKnownGranularity(granularity))
        {
            Console.Error.WriteLine($"Ошибка: неизвестная гранулярность {granularity}");
            return 1;
        }

        if (from > to)
        {
            Console.Error.WriteLine("Ошибка: начало диапазона позже его конца");
            return 1;
        }

        List<Period> periods = GeneratePeriods(from, to, granularity);
        List<string> problems = new();
        problems.AddRange(FindIntersections(periods));
        problems.AddRange(FindGaps(periods));

        PrintPeriods(periods, problems, granularity);

        return problems.Count == 0 ? 0 : 1;
    }

    private static bool TryParse(string value, out DateOnly date) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

    private static bool IsKnownGranularity(string granularity) => granularity is Month or Quarter or Year;

    private static DateOnly AlignStart(DateOnly date, string granularity) => granularity switch
    {
        Month => new DateOnly(date.Year, date.Month, 1),
        Quarter => QuarterStart(date),
        Year => new DateOnly(date.Year, 1, 1),
        _ => date,
    };

    private static DateOnly QuarterStart(DateOnly date)
    {
        int firstMonth = ((date.Month - 1) / 3 * 3) + 1;

        return new DateOnly(date.Year, firstMonth, 1);
    }

    private static DateOnly NextStart(DateOnly start, string granularity) => granularity switch
    {
        Month => start.AddMonths(1),
        Quarter => start.AddMonths(3),
        Year => start.AddYears(1),
        _ => start,
    };

    private static List<Period> GeneratePeriods(DateOnly from, DateOnly to, string granularity)
    {
        List<Period> periods = new();
        DateOnly cursor = AlignStart(from, granularity);

        while (cursor <= to)
        {
            DateOnly next = NextStart(cursor, granularity);
            DateOnly end = next.AddDays(-1);

            periods.Add(new Period(cursor, end > to ? to : end));
            cursor = next;
        }

        return periods;
    }

    private static List<string> FindIntersections(List<Period> periods)
    {
        List<string> problems = new();

        for (int i = 1; i < periods.Count; i++)
        {
            Period previous = periods[i - 1];
            Period current = periods[i];

            if (current.Start <= previous.End)
            {
                problems.Add($"пересечение: {Format(previous.Start)} — {Format(previous.End)} и {Format(current.Start)} — {Format(current.End)}");
            }
        }

        return problems;
    }

    private static List<string> FindGaps(List<Period> periods)
    {
        List<string> problems = new();

        for (int i = 1; i < periods.Count; i++)
        {
            DateOnly expected = periods[i - 1].End.AddDays(1);

            if (periods[i].Start != expected)
            {
                problems.Add($"разрыв между {Format(periods[i - 1].End)} и {Format(periods[i].Start)}");
            }
        }

        return problems;
    }

    private static string Format(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static int TotalDays(List<Period> periods)
    {
        int days = 0;

        foreach (Period period in periods)
        {
            days += period.End.DayNumber - period.Start.DayNumber + 1;
        }

        return days;
    }

    private static void PrintPeriods(List<Period> periods, List<string> problems, string granularity)
    {
        Console.WriteLine($"Гранулярность: {granularity}, периодов: {periods.Count}, дней всего: {TotalDays(periods)}");
        Console.WriteLine();
        Console.WriteLine($"{"№",-4} {"НАЧАЛО",-12} {"КОНЕЦ",-12} {"ДНЕЙ",6}");
        Console.WriteLine(new string('-', 40));

        for (int i = 0; i < periods.Count; i++)
        {
            Period period = periods[i];
            int days = period.End.DayNumber - period.Start.DayNumber + 1;
            Console.WriteLine($"{i + 1,-4} {Format(period.Start),-12} {Format(period.End),-12} {days,6}");
        }

        Console.WriteLine();

        if (problems.Count == 0)
        {
            Console.WriteLine("Периоды непрерывны и не пересекаются.");
            return;
        }

        foreach (string problem in problems)
        {
            Console.WriteLine($"Проблема: {problem}");
        }
    }

    private readonly record struct Period(DateOnly Start, DateOnly End);
}
