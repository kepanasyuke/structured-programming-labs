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
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/balance.csv");

        if (!TryReadSeries(path, out List<SeriesPoint> series))
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать данные из {path}");
            return 1;
        }

        if (series.Count < WindowSize)
        {
            Console.Error.WriteLine($"Ошибка: для сглаживания нужно минимум {WindowSize} точки");
            return 1;
        }

        double[] values = series.Select(point => point.Value).ToArray();
        double[] averages = MovingAverage(values, WindowSize);
        Dictionary<int, double> outliers = FindOutliers(values, ZThreshold);

        PrintSeries(series, values, averages, outliers);

        return 0;
    }

    private static bool TryReadSeries(string path, out List<SeriesPoint> series)
    {
        series = new List<SeriesPoint>();

        if (!File.Exists(path))
        {
            return false;
        }

        string[] lines = File.ReadAllLines(path);

        foreach (string line in lines.Skip(1))
        {
            SeriesPoint? point = ParsePoint(line);
            if (point.HasValue)
            {
                series.Add(point.Value);
            }
        }

        return series.Count > 0;
    }

    private static SeriesPoint? ParsePoint(string line)
    {
        SeriesPoint? point = null;

        if (line.Trim().Length > 0)
        {
            string[] parts = line.Split(Delimiter);

            if (parts.Length >= 2 && TryParseValue(parts[1], out double value))
            {
                point = new SeriesPoint(parts[0].Trim(), value);
            }
        }

        return point;
    }

    private static bool TryParseValue(string raw, out double value) =>
        double.TryParse(raw.Trim().Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out value);

    private static double[] MovingAverage(double[] values, int window)
    {
        double[] result = new double[values.Length];

        for (int i = 0; i < values.Length; i++)
        {
            int from = Math.Max(0, i - window + 1);
            int size = i - from + 1;
            double sum = 0;

            for (int j = from; j <= i; j++)
            {
                sum += values[j];
            }

            result[i] = sum / size;
        }

        return result;
    }

    private static double Mean(double[] values) => values.Length == 0 ? 0 : values.Average();

    private static double StandardDeviation(double[] values)
    {
        if (values.Length < 2)
        {
            return 0;
        }

        double average = Mean(values);
        double sumOfSquares = values.Sum(value => Math.Pow(value - average, 2));

        return Math.Sqrt(sumOfSquares / (values.Length - 1));
    }

    private static double ZScore(double value, double average, double deviation) =>
        deviation == 0 ? 0 : (value - average) / deviation;

    private static Dictionary<int, double> FindOutliers(double[] values, double threshold)
    {
        double average = Mean(values);
        double deviation = StandardDeviation(values);
        Dictionary<int, double> outliers = new();

        for (int i = 0; i < values.Length; i++)
        {
            double score = ZScore(values[i], average, deviation);

            if (Math.Abs(score) > threshold)
            {
                outliers[i] = score;
            }
        }

        return outliers;
    }

    private static string BuildBar(double value, double maximum) =>
        maximum <= 0 ? string.Empty : new string('#', (int)Math.Round(BarWidth * value / maximum));

    private static void PrintSeries(List<SeriesPoint> series, double[] values, double[] averages, Dictionary<int, double> outliers)
    {
        double maximum = values.Max();
        double averageAll = Mean(values);
        double deviation = StandardDeviation(values);

        Console.WriteLine($"Окно сглаживания: {WindowSize}, порог z-score: {ZThreshold.ToString("F1", CultureInfo.InvariantCulture)}");
        Console.WriteLine();
        Console.WriteLine($"{"ПЕРИОД",-12} {"ЗНАЧЕНИЕ",12} {"СРЕДНЕЕ",12} {"Z",8} {"ДИНАМИКА",-26}");
        Console.WriteLine(new string('-', 74));

        for (int i = 0; i < series.Count; i++)
        {
            double score = ZScore(values[i], averageAll, deviation);
            string mark = outliers.ContainsKey(i) ? "  <-- ВЫБРОС" : string.Empty;

            Console.WriteLine(
                $"{series[i].Period,-12} {values[i],12:F0} {averages[i],12:F0} {score,8:F2} {BuildBar(values[i], maximum),-26}{mark}");
        }

        Console.WriteLine();
        Console.WriteLine($"Выбросов найдено: {outliers.Count}");
    }

    private readonly record struct SeriesPoint(string Period, double Value);
}
