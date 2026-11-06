using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace CsvProfiler;

internal static class Program
{
    private const char Delimiter = ';';
    private const int MaxSampleValues = 3;

    private static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/clients.csv");

        if (!TryReadCsv(path, out string[] header, out List<string[]> rows))
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
            return 1;
        }

        if (rows.Count == 0)
        {
            Console.Error.WriteLine("Ошибка: в файле нет строк с данными");
            return 1;
        }

        List<ColumnProfile> profiles = BuildProfiles(header, rows);
        PrintProfiles(path, profiles);

        return 0;
    }

    private static bool TryReadCsv(string path, out string[] header, out List<string[]> rows)
    {
        header = Array.Empty<string>();
        rows = new List<string[]>();

        if (!File.Exists(path))
        {
            return false;
        }

        string[] lines = File.ReadAllLines(path);
        if (lines.Length == 0)
        {
            return false;
        }

        header = SplitLine(lines[0]);

        for (int i = 1; i < lines.Length; i++)
        {
            if (lines[i].Trim().Length == 0)
            {
                continue;
            }

            rows.Add(SplitLine(lines[i]));
        }

        return true;
    }

    private static string[] SplitLine(string line)
    {
        string[] parts = line.Split(Delimiter);
        string[] trimmed = new string[parts.Length];

        for (int i = 0; i < parts.Length; i++)
        {
            trimmed[i] = parts[i].Trim();
        }

        return trimmed;
    }

    private static List<ColumnProfile> BuildProfiles(string[] header, List<string[]> rows)
    {
        List<ColumnProfile> profiles = new(header.Length);

        for (int column = 0; column < header.Length; column++)
        {
            List<string> values = SelectColumn(rows, column);
            profiles.Add(ProfileColumn(header[column], values));
        }

        return profiles;
    }

    private static List<string> SelectColumn(List<string[]> rows, int column)
    {
        List<string> values = new(rows.Count);

        foreach (string[] row in rows)
        {
            values.Add(column < row.Length ? row[column] : string.Empty);
        }

        return values;
    }

    private static ColumnProfile ProfileColumn(string name, List<string> values)
    {
        List<string> filled = values.Where(HasValue).ToList();
        string type = DetectType(filled);
        ColumnProfile profile = new(name, type, values.Count, values.Count - filled.Count, filled.Distinct().Count());

        FillRange(profile, filled, type);
        profile.Sample = string.Join(", ", filled.Distinct().Take(MaxSampleValues));

        return profile;
    }

    private static bool HasValue(string value) => value.Length > 0;

    private static string DetectType(List<string> filled)
    {
        if (filled.Count == 0)
        {
            return "empty";
        }

        bool allInt = filled.All(IsInteger);
        if (allInt)
        {
            return "int";
        }

        bool allNumeric = filled.All(value => IsInteger(value) || IsDecimal(value));
        if (allNumeric)
        {
            return "float";
        }

        bool allDates = filled.All(IsIsoDate);

        return allDates ? "date" : "string";
    }

    private static bool IsInteger(string value) => int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out _);

    private static bool IsDecimal(string value)
    {
        string normalized = value.Replace(',', '.');

        return decimal.TryParse(normalized, NumberStyles.Float, CultureInfo.InvariantCulture, out _);
    }

    private static bool IsIsoDate(string value) => DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _);

    private static void FillRange(ColumnProfile profile, List<string> filled, string type)
    {
        if (filled.Count == 0)
        {
            return;
        }

        if (type is "int" or "float")
        {
            List<decimal> numbers = filled
                .Select(value => decimal.Parse(value.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture))
                .ToList();
            profile.Min = numbers.Min().ToString(CultureInfo.InvariantCulture);
            profile.Max = numbers.Max().ToString(CultureInfo.InvariantCulture);
            return;
        }

        if (type == "date")
        {
            List<DateOnly> dates = filled.Select(value => DateOnly.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture)).ToList();
            profile.Min = dates.Min().ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            profile.Max = dates.Max().ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
    }

    private static void PrintProfiles(string path, List<ColumnProfile> profiles)
    {
        Console.WriteLine($"Профиль файла: {path}");
        Console.WriteLine($"Колонок: {profiles.Count}");
        Console.WriteLine();
        Console.WriteLine($"{"КОЛОНКА",-14} {"ТИП",-8} {"ПУСТО",6} {"ДОЛЯ",8} {"УНИК.",8} {"MIN",-12} {"MAX",-12}");
        Console.WriteLine(new string('-', 76));

        foreach (ColumnProfile profile in profiles)
        {
            double share = profile.Rows == 0 ? 0 : 100.0 * profile.EmptyCount / profile.Rows;
            Console.WriteLine(
                $"{profile.Name,-14} {profile.Type,-8} {profile.EmptyCount,6} {share,7:F1}% {profile.UniqueCount,8} {profile.Min,-12} {profile.Max,-12}");
            Console.WriteLine($"  примеры: {profile.Sample}");
        }
    }

    private sealed class ColumnProfile
    {
        public ColumnProfile(string name, string type, int rows, int emptyCount, int uniqueCount)
        {
            Name = name;
            Type = type;
            Rows = rows;
            EmptyCount = emptyCount;
            UniqueCount = uniqueCount;
        }

        public string Name { get; }

        public string Type { get; }

        public int Rows { get; }

        public int EmptyCount { get; }

        public int UniqueCount { get; }

        public string Min { get; set; } = string.Empty;

        public string Max { get; set; } = string.Empty;

        public string Sample { get; set; } = string.Empty;
    }
}
