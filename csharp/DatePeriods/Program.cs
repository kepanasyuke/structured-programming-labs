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
        string fromText = Arg(args, 0, "2025-11-15");
        string toText = Arg(args, 1, "2026-06-30");
        string granularity = Arg(args, 2, Quarter);

        return Report(fromText, toText, granularity);
    }

    private static string Arg(string[] args, int index, string fallback) => args.Length > index ? args[index] : fallback;

    private static int Report(string fromText, string toText, string granularity)
    {
        bool parsed = TryParseRange(fromText, toText, out DateOnly from, out DateOnly to);
        bool known = parsed && IsKnownGranularity(granularity);
        bool ordered = known && from <= to;
        bool printed = ordered && PrintReport(from, to, granularity);

        PrintInputError(parsed, known, ordered, granularity);

        return printed ? 0 : 1;
    }

    private static void PrintInputError(bool parsed, bool known, bool ordered, string granularity)
    {
        PrintParseError(parsed);
        PrintGranularityError(parsed && !known, granularity);
        PrintOrderError(known && !ordered);
    }

    private static bool TryParseRange(string fromText, string toText, out DateOnly from, out DateOnly to)
    {
        bool parsedFrom = TryParse(fromText, out from);
        DateOnly tail = DateOnly.MinValue;
        bool parsedTo = parsedFrom && TryParse(toText, out tail);
        to = tail;

        return parsedFrom && parsedTo;
    }

    private static void PrintParseError(bool parsed)
    {
        if (!parsed)
        {
            Console.Error.WriteLine("Ошибка: некорректная дата, ожидается формат yyyy-MM-dd");
        }
    }

    private static void PrintGranularityError(bool unknown, string granularity)
    {
        if (unknown)
        {
            Console.Error.WriteLine($"Ошибка: неизвестная гранулярность {granularity}");
        }
    }

    private static void PrintOrderError(bool reversed)
    {
        if (reversed)
        {
            Console.Error.WriteLine("Ошибка: начало диапазона позже его конца");
        }
    }

    private static bool PrintReport(DateOnly from, DateOnly to, string granularity)
    {
        List<Period> periods = GeneratePeriods(from, to, granularity);
        List<string> problems = new();

        problems.AddRange(FindIntersections(periods));
        problems.AddRange(FindGaps(periods));
        PrintPeriods(periods, problems, granularity);

        return problems.Count == 0;
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

    private static List<Period> GeneratePeriods(DateOnly from, DateOnly to, string granularity) =>
        FillPeriods(to, granularity, AlignStart(from, granularity), new List<Period>());

    private static List<Period> FillPeriods(DateOnly to, string granularity, DateOnly cursor, List<Period> periods)
    {
        List<Period> result = periods;

        if (cursor <= to)
        {
            DateOnly next = NextStart(cursor, granularity);

            periods.Add(new Period(cursor, Clamp(next.AddDays(-1), to)));
            result = FillPeriods(to, granularity, next, periods);
        }

        return result;
    }

    private static DateOnly Clamp(DateOnly end, DateOnly to) => end > to ? to : end;

    private static List<string> FindIntersections(List<Period> periods)
    {
        List<string> problems = new();

        for (int i = 1; i < periods.Count; i++)
        {
            AddIntersection(problems, periods[i - 1], periods[i]);
        }

        return problems;
    }

    private static void AddIntersection(List<string> problems, Period previous, Period current)
    {
        if (current.Start <= previous.End)
        {
            problems.Add($"пересечение: {Format(previous.Start)} — {Format(previous.End)} и {Format(current.Start)} — {Format(current.End)}");
        }
    }

    private static List<string> FindGaps(List<Period> periods)
    {
        List<string> problems = new();

        for (int i = 1; i < periods.Count; i++)
        {
            AddGap(problems, periods[i - 1], periods[i]);
        }

        return problems;
    }

    private static void AddGap(List<string> problems, Period previous, Period next)
    {
        if (next.Start != previous.End.AddDays(1))
        {
            problems.Add($"разрыв между {Format(previous.End)} и {Format(next.Start)}");
        }
    }

    private static string Format(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static int DaysIn(Period period) => period.End.DayNumber - period.Start.DayNumber + 1;

    private static int TotalDays(List<Period> periods)
    {
        int days = 0;

        foreach (Period period in periods)
        {
            days += DaysIn(period);
        }

        return days;
    }

    private static void PrintPeriods(List<Period> periods, List<string> problems, string granularity)
    {
        PrintHeader(granularity, periods);
        PrintRows(periods);
        Console.WriteLine();
        PrintProblems(problems);
    }

    private static void PrintHeader(string granularity, List<Period> periods)
    {
        Console.WriteLine($"Гранулярность: {granularity}, периодов: {periods.Count}, дней всего: {TotalDays(periods)}");
        Console.WriteLine();
        Console.WriteLine($"{"№",-4} {"НАЧАЛО",-12} {"КОНЕЦ",-12} {"ДНЕЙ",6}");
        Console.WriteLine(new string('-', 40));
    }

    private static void PrintRows(List<Period> periods)
    {
        for (int i = 0; i < periods.Count; i++)
        {
            Console.WriteLine(FormatLine(i + 1, periods[i]));
        }
    }

    private static string FormatLine(int number, Period period) =>
        $"{number,-4} {Format(period.Start),-12} {Format(period.End),-12} {DaysIn(period),6}";

    private static void PrintProblems(List<string> problems)
    {
        if (problems.Count == 0)
        {
            Console.WriteLine("Периоды непрерывны и не пересекаются.");
        }

        if (problems.Count > 0)
        {
            problems.ForEach(PrintProblem);
        }
    }

    private static void PrintProblem(string problem) => Console.WriteLine($"Проблема: {problem}");

    private readonly record struct Period(DateOnly Start, DateOnly End);
}
