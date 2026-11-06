using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace CsvProfiler;

internal static class Program
{
    private const char Delimiter = ';';
    private const int MaxSampleValues = 3;
    private const string EmptyType = "empty";
    private const string IntType = "int";
    private const string FloatType = "float";
    private const string DateType = "date";
    private const string StringType = "string";

    private static int Main(string[] args)
    {
        string path = ResolvePath(args);
        bool loaded = TryReadCsv(path, out string[] header, out List<string[]> rows);
        bool usable = loaded && rows.Count > 0;
        bool printed = usable && PrintReport(path, header, rows);

        PrintReadError(path, loaded, rows.Count);

        return printed ? 0 : 1;
    }

    private static string ResolvePath(string[] args) =>
        args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/clients.csv");

    private static void PrintReadError(string path, bool loaded, int rowCount)
    {
        if (!loaded)
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
        }

        if (loaded && rowCount == 0)
        {
            Console.Error.WriteLine("Ошибка: в файле нет строк с данными");
        }
    }

    private static bool PrintReport(string path, string[] header, List<string[]> rows)
    {
        PrintProfiles(path, BuildProfiles(header, rows));

        return true;
    }

    private static bool TryReadCsv(string path, out string[] header, out List<string[]> rows)
    {
        string[] lines = File.Exists(path) ? File.ReadAllLines(path) : Array.Empty<string>();

        header = lines.Length > 0 ? SplitLine(lines[0]) : Array.Empty<string>();
        rows = CollectRows(lines);

        return lines.Length > 0;
    }

    private static List<string[]> CollectRows(string[] lines)
    {
        List<string[]> rows = new();

        for (int i = 1; i < lines.Length; i++)
        {
            AddRow(rows, lines[i]);
        }

        return rows;
    }

    private static void AddRow(List<string[]> rows, string line)
    {
        if (line.Trim().Length > 0)
        {
            rows.Add(SplitLine(line));
        }
    }

    private static string[] SplitLine(string line) => TrimParts(line.Split(Delimiter));

    private static string[] TrimParts(string[] parts) => TrimPartsFrom(parts, 0, new string[parts.Length]);

    private static string[] TrimPartsFrom(string[] parts, int index, string[] trimmed)
    {
        string[] result = trimmed;

        if (index < parts.Length)
        {
            trimmed[index] = parts[index].Trim();
            result = TrimPartsFrom(parts, index + 1, trimmed);
        }

        return result;
    }

    private static List<ColumnProfile> BuildProfiles(string[] header, List<string[]> rows) => BuildProfilesTo(header, rows, 0);

    private static List<ColumnProfile> BuildProfilesTo(string[] header, List<string[]> rows, int column) =>
        column >= header.Length ? new List<ColumnProfile>() : BuildProfilesFrom(header, rows, column);

    private static List<ColumnProfile> BuildProfilesFrom(string[] header, List<string[]> rows, int column) => Proceed(header, rows, column, new List<ColumnProfile>());

    private static List<ColumnProfile> Proceed(string[] header, List<string[]> rows, int column, List<ColumnProfile> profiles)
    {
        profiles.Add(ProfileColumn(header[column], SelectColumn(rows, column)));

        return column + 1 >= header.Length ? profiles : Proceed(header, rows, column + 1, profiles);
    }

    private static List<string> SelectColumn(List<string[]> rows, int column) => CollectColumn(rows, column, 0);

    private static List<string> CollectColumn(List<string[]> rows, int column, int index) =>
        index >= rows.Count ? new List<string>() : CollectColumnFrom(rows, column, index);

    private static List<string> CollectColumnFrom(List<string[]> rows, int column, int index) => AppendColumn(rows, column, index, new List<string>());

    private static List<string> AppendColumn(List<string[]> rows, int column, int index, List<string> values)
    {
        values.Add(column < rows[index].Length ? rows[index][column] : string.Empty);

        return index + 1 >= rows.Count ? values : AppendColumn(rows, column, index + 1, values);
    }

    private static List<string> SelectFilled(List<string> values) => CollectFilled(values, 0);

    private static List<string> CollectFilled(List<string> values, int index) =>
        index >= values.Count ? new List<string>() : CollectFilledFrom(values, index);

    private static List<string> CollectFilledFrom(List<string> values, int index) => AppendFilled(values, index, new List<string>());

    private static List<string> AppendFilled(List<string> values, int index, List<string> filled)
    {
        if (values[index].Length > 0)
        {
            filled.Add(values[index]);
        }

        return index + 1 >= values.Count ? filled : AppendFilled(values, index + 1, filled);
    }

    private static ColumnProfile ProfileColumn(string name, List<string> values) =>
        FillRange(Describe(name, values), SelectFilled(values), DetectType(SelectFilled(values)));

    private static ColumnProfile Describe(string name, List<string> values)
    {
        List<string> filled = SelectFilled(values);

        return DescribeWith(name, values, filled);
    }

    private static ColumnProfile DescribeWith(string name, List<string> values, List<string> filled)
    {
        ColumnProfile profile = new(name, DetectType(filled), values.Count, values.Count - filled.Count, CountDistinct(filled));

        profile.Sample = string.Join(", ", TakeDistinct(filled, MaxSampleValues));

        return profile;
    }

    private static int CountDistinct(List<string> values) => BuildDistinct(values).Count;

    private static List<string> TakeDistinct(List<string> values, int limit)
    {
        List<string> distinct = BuildDistinct(values);

        return TakeFirst(distinct, Math.Min(limit, distinct.Count));
    }

    private static List<string> TakeFirst(List<string> values, int size) => CollectFirst(values, size, 0);

    private static List<string> CollectFirst(List<string> values, int size, int index) =>
        index >= size ? new List<string>() : CollectFirstFrom(values, size, index);

    private static List<string> CollectFirstFrom(List<string> values, int size, int index) => AppendFirst(values, size, index, new List<string>());

    private static List<string> AppendFirst(List<string> values, int size, int index, List<string> head)
    {
        head.Add(values[index]);

        return index + 1 >= size ? head : AppendFirst(values, size, index + 1, head);
    }

    private static List<string> BuildDistinct(List<string> values)
    {
        List<string> distinct = new();

        foreach (string value in values)
        {
            AddDistinct(distinct, value);
        }

        return distinct;
    }

    private static void AddDistinct(List<string> distinct, string value)
    {
        if (!distinct.Contains(value))
        {
            distinct.Add(value);
        }
    }

    private static string DetectType(List<string> filled) => IsEmptyColumn(filled) ? EmptyType : DetectFilledType(filled);

    private static bool IsEmptyColumn(List<string> filled) => filled.Count == 0;

    private static string DetectFilledType(List<string> filled) =>
        AllMatch(filled, IsInteger) ? IntType : DetectNumericType(filled);

    private static string DetectNumericType(List<string> filled) =>
        AllMatch(filled, IsNumeric) ? FloatType : DetectDateType(filled);

    private static string DetectDateType(List<string> filled) => AllMatch(filled, IsIsoDate) ? DateType : StringType;

    private static bool AllMatch(List<string> values, Func<string, bool> predicate) => !values.Exists(value => !predicate(value));

    private static bool IsNumeric(string value) => IsInteger(value) || IsDecimal(value);

    private static bool IsInteger(string value) => int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out _);

    private static string NormalizeNumber(string value) => value.Replace(',', '.');

    private static bool IsDecimal(string value) =>
        decimal.TryParse(NormalizeNumber(value), NumberStyles.Float, CultureInfo.InvariantCulture, out _);

    private static bool IsIsoDate(string value) => DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _);

    private static decimal ToNumber(string value) => decimal.Parse(NormalizeNumber(value), NumberStyles.Float, CultureInfo.InvariantCulture);

    private static DateOnly ToDate(string value) => DateOnly.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static ColumnProfile FillRange(ColumnProfile profile, List<string> filled, string type)
    {
        bool ready = filled.Count > 0;

        if (ready && (type == IntType || type == FloatType))
        {
            FillNumericRange(profile, filled);
        }

        if (ready && type == DateType)
        {
            FillDateRange(profile, filled);
        }

        return profile;
    }

    private static void FillNumericRange(ColumnProfile profile, List<string> filled)
    {
        List<decimal> numbers = filled.ConvertAll(ToNumber);

        profile.Min = Invariant(numbers.Min());
        profile.Max = Invariant(numbers.Max());
    }

    private static void FillDateRange(ColumnProfile profile, List<string> filled)
    {
        List<DateOnly> dates = filled.ConvertAll(ToDate);

        profile.Min = dates.Min().ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        profile.Max = dates.Max().ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static string Invariant(decimal value) => value.ToString(CultureInfo.InvariantCulture);

    private static void PrintProfiles(string path, List<ColumnProfile> profiles)
    {
        PrintHeader(path, profiles.Count);
        profiles.ForEach(PrintProfile);
    }

    private static void PrintHeader(string path, int count)
    {
        Console.WriteLine($"Профиль файла: {path}");
        Console.WriteLine($"Колонок: {count}");
        Console.WriteLine();
        PrintTableHead();
    }

    private static void PrintTableHead()
    {
        Console.WriteLine($"{"КОЛОНКА",-14} {"ТИП",-8} {"ПУСТО",6} {"ДОЛЯ",8} {"УНИК.",8} {"MIN",-12} {"MAX",-12}");
        Console.WriteLine(new string('-', 76));
    }

    private static void PrintProfile(ColumnProfile profile)
    {
        Console.WriteLine(FormatRow(profile));
        Console.WriteLine($"  примеры: {profile.Sample}");
    }

    private static string FormatRow(ColumnProfile profile)
    {
        double share = profile.Rows == 0 ? 0 : 100.0 * profile.EmptyCount / profile.Rows;

        return $"{profile.Name,-14} {profile.Type,-8} {profile.EmptyCount,6} {share,7:F1}% {profile.UniqueCount,8} {profile.Min,-12} {profile.Max,-12}";
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
