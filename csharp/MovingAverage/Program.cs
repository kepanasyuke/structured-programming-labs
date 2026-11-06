using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace MovingAverage;

internal static class Program
{
    private const char Delimiter = ';';
    private const int WindowSize = 3;
    private const double ZThreshold = 2.0;
    private const int BarWidth = 24;

    private static int Main(string[] args)
    {
        string path = ResolvePath(args);
        bool loaded = TryReadSeries(path, out List<SeriesPoint> series);
        bool printed = loaded && series.Count >= WindowSize && PrintReport(path, series);

        PrintReadError(path, loaded);
        PrintSizeError(loaded && series.Count < WindowSize);

        return printed ? 0 : 1;
    }

    private static string ResolvePath(string[] args) =>
        args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/balance.csv");

    private static void PrintReadError(string path, bool loaded)
    {
        if (!loaded)
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать данные из {path}");
        }
    }

    private static void PrintSizeError(bool tooShort)
    {
        if (tooShort)
        {
            Console.Error.WriteLine($"Ошибка: для сглаживания нужно минимум {WindowSize} точки");
        }
    }

    private static bool PrintReport(string path, List<SeriesPoint> series)
    {
        double[] values = Values(series);
        double[] averages = MovingAverage(values, WindowSize);

        PrintSeries(series, values, averages, FindOutliers(values, ZThreshold));

        return true;
    }

    private static double[] Values(List<SeriesPoint> series) => series.Select(point => point.Value).ToArray();

    private static bool TryReadSeries(string path, out List<SeriesPoint> series)
    {
        string[] lines = File.Exists(path) ? File.ReadAllLines(path) : Array.Empty<string>();

        series = CollectPoints(lines.Skip(1));

        return series.Count > 0;
    }

    private static List<SeriesPoint> CollectPoints(IEnumerable<string> lines)
    {
        List<SeriesPoint> series = new();

        foreach (string line in lines)
        {
            AddPoint(series, ParsePoint(line));
        }

        return series;
    }

    private static void AddPoint(List<SeriesPoint> series, SeriesPoint? point)
    {
        if (point.HasValue)
        {
            series.Add(point.Value);
        }
    }

    private static SeriesPoint? ParsePoint(string line) => NonBlank(line) ? ReadPoint(line.Split(Delimiter)) : null;

    private static SeriesPoint? ReadPoint(string[] parts) => HasValueAt(parts, 1) ? BuildPoint(parts[0].Trim(), parts[1]) : null;

    private static bool HasValueAt(string[] parts, int index) => parts.Length > index;

    private static SeriesPoint? BuildPoint(string period, string raw) => TryParseValue(raw, out double value) ? new SeriesPoint(period, value) : null;

    private static bool NonBlank(string line) => line.Trim().Length > 0;

    private static bool TryParseValue(string raw, out double value) =>
        double.TryParse(raw.Trim().Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out value);

    private static double[] MovingAverage(double[] values, int window) => FillAverages(values, window, 0, new double[values.Length]);

    private static double[] FillAverages(double[] values, int window, int index, double[] result)
    {
        double[] filled = result;

        if (index < values.Length)
        {
            int from = Math.Max(0, index - window + 1);

            result[index] = SumRange(values, from, index) / (index - from + 1);
            filled = FillAverages(values, window, index + 1, result);
        }

        return filled;
    }

    private static double SumRange(double[] values, int from, int to) => from > to ? 0 : values[from] + SumRange(values, from + 1, to);

    private static double Mean(double[] values) => values.Length == 0 ? 0 : values.Average();

    private static double StandardDeviation(double[] values) => values.Length < 2 ? 0 : Deviation(values, Mean(values));

    private static double Deviation(double[] values, double average) => Math.Sqrt(SquaredDeviation(values, average, 0) / (values.Length - 1));

    private static double SquaredDeviation(double[] values, double average, int index) =>
        index >= values.Length ? 0 : Math.Pow(values[index] - average, 2) + SquaredDeviation(values, average, index + 1);

    private static double ZScore(double value, double average, double deviation) =>
        deviation == 0 ? 0 : (value - average) / deviation;

    private static Dictionary<int, double> FindOutliers(double[] values, double threshold)
    {
        double average = Mean(values);
        double deviation = StandardDeviation(values);
        Dictionary<int, double> outliers = new();

        CollectOutliers(values, average, deviation, threshold, 0, outliers);

        return outliers;
    }

    private static void CollectOutliers(double[] values, double average, double deviation, double threshold, int index, Dictionary<int, double> outliers)
    {
        if (index < values.Length)
        {
            double score = ZScore(values[index], average, deviation);

            if (Math.Abs(score) > threshold)
            {
                outliers[index] = score;
            }

            CollectOutliers(values, average, deviation, threshold, index + 1, outliers);
        }
    }

    private static string BuildBar(double value, double maximum) =>
        maximum <= 0 ? string.Empty : new string('#', (int)Math.Round(BarWidth * value / maximum));

    private static void PrintSeries(List<SeriesPoint> series, double[] values, double[] averages, Dictionary<int, double> outliers)
    {
        double maximum = values.Max();
        double average = Mean(values);
        double deviation = StandardDeviation(values);

        PrintHeader();
        PrintRows(series, values, averages, outliers, new double[] { maximum, average, deviation });
        PrintFooter(outliers.Count);
    }

    private static void PrintHeader()
    {
        Console.WriteLine($"Окно сглаживания: {WindowSize}, порог z-score: {Format(ZThreshold)}");
        Console.WriteLine();
        Console.WriteLine($"{"ПЕРИОД",-12} {"ЗНАЧЕНИЕ",12} {"СРЕДНЕЕ",12} {"Z",8} {"ДИНАМИКА",-26}");
        Console.WriteLine(new string('-', 74));
    }

    private static string Format(double value) => value.ToString("F1", CultureInfo.InvariantCulture);

    private static void PrintRows(List<SeriesPoint> series, double[] values, double[] averages, Dictionary<int, double> outliers, double[] stats)
    {
        for (int i = 0; i < series.Count; i++)
        {
            Console.WriteLine(FormatRow(series[i], values[i], averages[i], ZScore(values[i], stats[1], stats[2]), outliers, i, stats[0]));
        }
    }

    private static string FormatRow(SeriesPoint point, double value, double average, double score, Dictionary<int, double> outliers, int index, double maximum)
    {
        string mark = outliers.ContainsKey(index) ? "  <-- ВЫБРОС" : string.Empty;

        return $"{point.Period,-12} {value,12:F0} {average,12:F0} {score,8:F2} {BuildBar(value, maximum),-26}{mark}";
    }

    private static void PrintFooter(int outlierCount)
    {
        Console.WriteLine();
        Console.WriteLine($"Выбросов найдено: {outlierCount}");
    }

    private readonly record struct SeriesPoint(string Period, double Value);
}
