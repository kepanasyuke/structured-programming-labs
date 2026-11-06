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
    private const string FailureStatus = "FAIL";
    private static readonly int[] Percentiles = new int[] { 50, 95 };

    private static int Main(string[] args)
    {
        string path = ResolvePath(args);
        bool loaded = TryReadLines(path, out List<string> lines);
        List<LogRecord> records = CollectRecords(loaded, lines);
        bool printed = loaded && records.Count > 0 && PrintReport(path, records, Aggregate(records));

        PrintErrors(path, loaded, loaded && records.Count > 0);
        return printed ? 0 : 1;
    }

    private static List<LogRecord> CollectRecords(bool loaded, List<string> lines) => loaded ? ParseLog(lines) : new List<LogRecord>();

    private static string ResolvePath(string[] args) =>
        args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/queries.log");

    private static void PrintErrors(string path, bool loaded, bool usable)
    {
        if (!loaded)
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
        }

        PrintRecordsError(loaded && !usable);
    }

    private static void PrintRecordsError(bool usable)
    {
        if (!usable)
        {
            Console.Error.WriteLine("Ошибка: не удалось разобрать ни одной записи");
        }
    }

    private static bool TryReadLines(string path, out List<string> lines)
    {
        lines = File.Exists(path) ? CollectLines(File.ReadAllLines(path)) : new List<string>();

        return File.Exists(path);
    }

    private static List<string> CollectLines(string[] source)
    {
        List<string> lines = new();

        foreach (string line in source)
        {
            AddLine(lines, line);
        }

        return lines;
    }

    private static void AddLine(List<string> lines, string line)
    {
        if (line.Trim().Length > 0)
        {
            lines.Add(line);
        }
    }

    private static List<LogRecord> ParseLog(List<string> lines)
    {
        List<LogRecord> records = new();

        foreach (string line in lines)
        {
            AddRecord(records, ParseLine(line));
        }

        return records;
    }

    private static void AddRecord(List<LogRecord> records, LogRecord? record)
    {
        if (record != null)
        {
            records.Add(record);
        }
    }

    private static LogRecord? ParseLine(string line)
    {
        string[] parts = line.Split(FieldSeparator);

        return parts.Length >= 4 ? BuildRecord(parts) : null;
    }

    private static LogRecord? BuildRecord(string[] parts) => TryBuildDuration(new string(parts[2].Where(char.IsDigit).ToArray()), parts);

    private static LogRecord? TryBuildDuration(string rawDuration, string[] parts) =>
        int.TryParse(rawDuration, NumberStyles.Integer, CultureInfo.InvariantCulture, out int duration) ? new LogRecord(parts[1].Trim(), duration, parts[3].Trim().ToUpperInvariant()) : null;

    private static List<TaskSummary> Aggregate(List<LogRecord> records)
    {
        Dictionary<string, List<LogRecord>> grouped = GroupByTask(records);
        List<TaskSummary> summaries = new();

        foreach (KeyValuePair<string, List<LogRecord>> group in grouped)
        {
            summaries.Add(Summarize(group.Key, group.Value));
        }

        return summaries;
    }

    private static Dictionary<string, List<LogRecord>> GroupByTask(List<LogRecord> records)
    {
        Dictionary<string, List<LogRecord>> grouped = new(StringComparer.Ordinal);

        foreach (LogRecord record in records)
        {
            AddToGroup(grouped, record);
        }

        return grouped;
    }

    private static void AddToGroup(Dictionary<string, List<LogRecord>> grouped, LogRecord record)
    {
        grouped.TryGetValue(record.Task, out List<LogRecord>? bucket);

        if (bucket == null)
        {
            grouped[record.Task] = new List<LogRecord>();
        }

        grouped[record.Task].Add(record);
    }

    private static TaskSummary Summarize(string task, List<LogRecord> records)
    {
        List<int> durations = SortedDurations(records);
        TaskSummary summary = new(task, durations.Count, Average(durations), durations[^1]);

        summary.Failures = CountFailures(records);

        return ApplyPercentiles(summary, durations, 0);
    }

    private static List<int> SortedDurations(List<LogRecord> records) => records.Select(record => record.Duration).OrderBy(value => value).ToList();

    private static int Average(List<int> durations) => (int)Math.Round(durations.Average());

    private static int CountFailures(List<LogRecord> records) => records.Count(record => record.Status == FailureStatus);

    private static TaskSummary ApplyPercentiles(TaskSummary summary, List<int> durations, int index)
    {
        if (index < Percentiles.Length)
        {
            summary.SetPercentile(Percentiles[index], (int)Math.Round(Percentile(durations, Percentiles[index])));
            ApplyPercentiles(summary, durations, index + 1);
        }

        return summary;
    }

    private static bool IsEmpty(List<int> sortedValues) => sortedValues.Count == 0;

    private static double Percentile(List<int> sortedValues, int percent)
    {
        bool empty = IsEmpty(sortedValues);

        return empty ? 0 : Interpolate(sortedValues, percent);
    }

    private static double Interpolate(List<int> sortedValues, int percent)
    {
        double position = percent / 100.0 * (sortedValues.Count - 1);
        int lower = (int)Math.Floor(position);
        int upper = (int)Math.Ceiling(position);

        return lower == upper ? sortedValues[lower] : Weighted(sortedValues, position, lower, upper);
    }

    private static double Weighted(List<int> sortedValues, double position, int lower, int upper) =>
        (sortedValues[lower] * (1 - (position - lower))) + (sortedValues[upper] * (position - lower));

    private static List<TaskSummary> SelectTop(List<TaskSummary> summaries) =>
        summaries.OrderByDescending(summary => summary.P95).ThenBy(summary => summary.Task, StringComparer.Ordinal).Take(TopSize).ToList();

    private static bool PrintReport(string path, List<LogRecord> records, List<TaskSummary> summaries)
    {
        PrintHeader(path, records.Count, summaries.Count);
        ForEachRow(SelectTop(summaries));
        PrintFooter();

        return true;
    }

    private static void PrintHeader(string path, int recordCount, int taskCount)
    {
        Console.WriteLine($"Лог: {path}");
        Console.WriteLine($"Записей: {recordCount}, задач: {taskCount}");
        Console.WriteLine();
        Console.WriteLine($"{"ЗАДАЧА",-22} {"ЗАП.",6} {"СРЕДН.",8} {"P50",8} {"P95",8} {"MAX",8} {"FAIL",6}");
        Console.WriteLine(new string('-', 78));
    }

    private static void ForEachRow(List<TaskSummary> top)
    {
        foreach (TaskSummary summary in top)
        {
            Console.WriteLine(FormatRow(summary));
        }
    }

    private static string FormatRow(TaskSummary summary) =>
        $"{summary.Task,-22} {summary.Runs,6} {summary.Average,8} {summary.P50,8} {summary.P95,8} {summary.Max,8} {summary.Failures,6}";

    private static void PrintFooter()
    {
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

        public int Failures { get; set; }

        public int P50 => Read(50);

        public int P95 => Read(95);

        private int Read(int percent) => percentiles.TryGetValue(percent, out int value) ? value : 0;

        public void SetPercentile(int percent, int value) => percentiles[percent] = value;
    }
}
