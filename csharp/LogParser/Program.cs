using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace LogParser;

internal static class Program
{
    private const char FieldSeparator = '|';
    private const int TopSize = 5;
    private static readonly int[] Percentiles = { 50, 95 };

    private static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/queries.log");

        if (!TryReadLines(path, out List<string> lines))
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
            return 1;
        }

        List<LogRecord> records = ParseLog(lines);
        if (records.Count == 0)
        {
            Console.Error.WriteLine("Ошибка: не удалось разобрать ни одной записи");
            return 1;
        }

        List<TaskSummary> summaries = Aggregate(records);
        PrintReport(path, records, summaries);

        return 0;
    }

    private static bool TryReadLines(string path, out List<string> lines)
    {
        lines = new List<string>();

        if (!File.Exists(path))
        {
            return false;
        }

        foreach (string line in File.ReadAllLines(path))
        {
            if (line.Trim().Length > 0)
            {
                lines.Add(line);
            }
        }

        return true;
    }

    private static List<LogRecord> ParseLog(List<string> lines)
    {
        List<LogRecord> records = new();

        foreach (string line in lines)
        {
            LogRecord? record = ParseLine(line);
            if (record != null)
            {
                records.Add(record);
            }
        }

        return records;
    }

    private static LogRecord? ParseLine(string line)
    {
        string[] parts = line.Split(FieldSeparator);
        LogRecord? record = null;

        if (parts.Length >= 4)
        {
            string rawDuration = new(parts[2].Where(char.IsDigit).ToArray());

            if (int.TryParse(rawDuration, NumberStyles.Integer, CultureInfo.InvariantCulture, out int duration))
            {
                record = new LogRecord(parts[1].Trim(), duration, parts[3].Trim().ToUpperInvariant());
            }
        }

        return record;
    }

    private static List<TaskSummary> Aggregate(List<LogRecord> records)
    {
        Dictionary<string, List<LogRecord>> grouped = new(StringComparer.Ordinal);

        foreach (LogRecord record in records)
        {
            if (!grouped.ContainsKey(record.Task))
            {
                grouped[record.Task] = new List<LogRecord>();
            }

            grouped[record.Task].Add(record);
        }

        List<TaskSummary> summaries = new(grouped.Count);

        foreach (KeyValuePair<string, List<LogRecord>> group in grouped)
        {
            summaries.Add(Summarize(group.Key, group.Value));
        }

        return summaries;
    }

    private static TaskSummary Summarize(string task, List<LogRecord> records)
    {
        List<int> durations = records.Select(record => record.Duration).OrderBy(value => value).ToList();
        TaskSummary summary = new(task, durations.Count, (int)Math.Round(durations.Average()), durations[^1])
        {
            Failures = records.Count(record => record.Status == "FAIL"),
        };

        foreach (int percent in Percentiles)
        {
            summary.SetPercentile(percent, (int)Math.Round(Percentile(durations, percent)));
        }

        return summary;
    }

    private static double Percentile(List<int> sortedValues, int percent)
    {
        if (sortedValues.Count == 0)
        {
            return 0;
        }

        double position = percent / 100.0 * (sortedValues.Count - 1);
        int lower = (int)Math.Floor(position);
        int upper = (int)Math.Ceiling(position);

        return lower == upper
            ? sortedValues[lower]
            : (sortedValues[lower] * (1 - (position - lower))) + (sortedValues[upper] * (position - lower));
    }

    private static void PrintReport(string path, List<LogRecord> records, List<TaskSummary> summaries)
    {
        Console.WriteLine($"Лог: {path}");
        Console.WriteLine($"Записей: {records.Count}, задач: {summaries.Count}");
        Console.WriteLine();
        Console.WriteLine($"{"ЗАДАЧА",-22} {"ЗАП.",6} {"СРЕДН.",8} {"P50",8} {"P95",8} {"MAX",8} {"FAIL",6}");
        Console.WriteLine(new string('-', 78));

        List<TaskSummary> top = summaries.OrderByDescending(summary => summary.P95).ThenBy(summary => summary.Task, StringComparer.Ordinal).Take(TopSize).ToList();

        foreach (TaskSummary summary in top)
        {
            Console.WriteLine(
                $"{summary.Task,-22} {summary.Runs,6} {summary.Average,8} {summary.P50,8} {summary.P95,8} {summary.Max,8} {summary.Failures,6}");
        }

        Console.WriteLine();
        Console.WriteLine($"Отсортировано по p95, показаны первые {TopSize}");
    }

    private sealed class LogRecord
    {
        public LogRecord(string task, int duration, string status)
        {
            Task = task;
            Duration = duration;
            Status = status;
        }

        public string Task { get; }

        public int Duration { get; }

        public string Status { get; }
    }

    private sealed class TaskSummary
    {
        private readonly Dictionary<int, int> percentiles = new();

        public TaskSummary(string task, int runs, int average, int max)
        {
            Task = task;
            Runs = runs;
            Average = average;
            Max = max;
        }

        public string Task { get; }

        public int Runs { get; }

        public int Average { get; }

        public int Max { get; }

        public int Failures { get; init; }

        public int P50 => percentiles.TryGetValue(50, out int value) ? value : 0;

        public int P95 => percentiles.TryGetValue(95, out int value) ? value : 0;

        public void SetPercentile(int percent, int value) => percentiles[percent] = value;
    }
}
