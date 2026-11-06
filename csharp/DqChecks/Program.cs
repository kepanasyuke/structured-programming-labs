using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;

namespace DqChecks;

internal static class Program
{
    private const char Delimiter = ';';
    private const int ViolationExitCode = 1;
    private const int ReadErrorExitCode = 2;
    private const string EmptyMessage = "значение пустое";
    private const string InnColumn = "inn";
    private const string InnFormatRule = "format";

    private static readonly Regex InnPattern = new(@"^(\d{10}|\d{12})$", RegexOptions.Compiled);
    private static readonly Regex DatePattern = new(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.Compiled);
    private static readonly string[] Statuses = { "active", "blocked", "closed" };

    private static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/clients.csv");
        bool loaded = TryReadCsv(path, out string[] header, out List<Dictionary<string, string>> rows);

        PrintReadError(path, loaded);

        return loaded ? Execute(rows) : ReadErrorExitCode;
    }

    private static void PrintReadError(string path, bool loaded)
    {
        if (!loaded)
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
        }
    }

    private static int Execute(List<Dictionary<string, string>> rows)
    {
        List<Violation> violations = RunChecks(rows, BuildRules(), new[] { "client_id" });

        PrintViolations(violations, rows.Count);

        return violations.Count == 0 ? 0 : ViolationExitCode;
    }

    private static bool TryReadCsv(string path, out string[] header, out List<Dictionary<string, string>> rows)
    {
        string[] lines = File.Exists(path) ? File.ReadAllLines(path) : Array.Empty<string>();

        header = lines.Length > 0 ? lines[0].Split(Delimiter) : Array.Empty<string>();
        rows = CollectRows(header, lines, 1, new List<Dictionary<string, string>>());

        return lines.Length > 0;
    }

    private static List<Dictionary<string, string>> CollectRows(string[] header, string[] lines, int index, List<Dictionary<string, string>> rows)
    {
        List<Dictionary<string, string>> result = rows;

        if (index < lines.Length)
        {
            AddRecord(rows, header, lines[index]);
            result = CollectRows(header, lines, index + 1, rows);
        }

        return result;
    }

    private static void AddRecord(List<Dictionary<string, string>> rows, string[] header, string line)
    {
        if (line.Trim().Length > 0)
        {
            rows.Add(ToRecord(header, line));
        }
    }

    private static Dictionary<string, string> ToRecord(string[] header, string line) =>
        MapCells(header, line.Split(Delimiter), 0, new Dictionary<string, string>(StringComparer.Ordinal));

    private static Dictionary<string, string> MapCells(string[] header, string[] values, int index, Dictionary<string, string> record)
    {
        Dictionary<string, string> result = record;

        if (index < header.Length)
        {
            record[header[index].Trim()] = index < values.Length ? values[index].Trim() : string.Empty;
            result = MapCells(header, values, index + 1, record);
        }

        return result;
    }

    private static List<Rule> BuildRules() => AddCommon(new List<Rule>(), 0);

    private static List<Rule> AddCommon(List<Rule> rules, int index)
    {
        List<Rule> result = rules;

        if (index < RuleColumns().Length)
        {
            AddRule(rules, index);
            result = AddCommon(rules, index + 1);
        }

        return result;
    }

    private static void AddRule(List<Rule> rules, int index) =>
        rules.Add(new Rule(RuleColumns()[index], RuleNames()[index], RuleChecks()[index], null));

    private static string[] RuleColumns() => new[] { "client_id", InnColumn, "balance_rub", "status", "open_date" };

    private static string[] RuleNames() => new[] { "not_null", InnFormatRule, "positive_number", "allowed_values", "not_future_date" };

    private static RuleCheck[] RuleChecks() => new RuleCheck[] { CheckNotNull, CheckInn, CheckNonNegative, CheckStatus, CheckNotFutureDate };

    private static string? CheckNotNull(string value) => IsEmpty(value) ? EmptyMessage : null;

    private static bool IsEmpty(string value) => value.Length == 0;

    private static bool IsInnLength(string value) => InnPattern.IsMatch(value);

    private static string? CheckInn(string value)
    {
        bool hasLength = IsInnLength(value);
        bool hasChecksum = hasLength && HasValidInnChecksum(value);

        return IsEmpty(value) ? EmptyMessage : !hasLength ? "неверная длина ИНН" : hasChecksum ? null : "контрольное число ИНН не сходится";
    }

    private static bool HasValidInnChecksum(string inn) =>
        inn.Length == 10 ? MatchesTenDigitChecksum(ToDigits(inn)) : MatchesTwelveDigitChecksum(ToDigits(inn));

    private static int[] ToDigits(string inn) => ConvertDigits(inn, 0, new int[inn.Length]);

    private static int[] ConvertDigits(string inn, int index, int[] digits)
    {
        int[] result = digits;

        if (index < inn.Length)
        {
            digits[index] = inn[index] - '0';
            result = ConvertDigits(inn, index + 1, digits);
        }

        return result;
    }

    private static int WeightedSum(int[] digits, int[] weights) => SumUp(digits, weights, 0);

    private static int SumUp(int[] digits, int[] weights, int index)
    {
        int sum = 0;

        if (index < weights.Length)
        {
            sum = (weights[index] * digits[index]) + SumUp(digits, weights, index + 1);
        }

        return sum;
    }

    private static int CheckDigit(int sum) => sum % 11 % 10;

    private static bool MatchesTenDigitChecksum(int[] digits) => CheckDigit(WeightedSum(digits, new[] { 2, 4, 10, 3, 5, 9, 4, 6, 8 })) == digits[9];

    private static bool MatchesTwelveDigitChecksum(int[] digits) =>
        CheckDigit(WeightedSum(digits, new[] { 7, 2, 4, 10, 3, 5, 9, 4, 6, 8 })) == digits[10]
        && CheckDigit(WeightedSum(digits, new[] { 3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8 })) == digits[11];

    private static string? CheckNonNegative(string value)
    {
        bool parsed = decimal.TryParse(Normalize(value), NumberStyles.Float, CultureInfo.InvariantCulture, out decimal number);

        return IsEmpty(value) ? EmptyMessage : !parsed ? "значение не является числом" : number >= 0 ? null : "отрицательный остаток";
    }

    private static string Normalize(string value) => value.Replace(',', '.');

    private static string? CheckStatus(string value) => Array.IndexOf(Statuses, value) >= 0 ? null : "значение вне справочника";

    private static bool IsDateShape(string value) => DatePattern.IsMatch(value);

    private static string? CheckNotFutureDate(string value)
    {
        bool shaped = IsDateShape(value);
        bool parsed = shaped && DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly date);

        return !shaped ? "значение не является датой" : !parsed ? "некорректная дата" : date <= Today() ? null : "дата в будущем";
    }

    private static DateOnly Today() => DateOnly.FromDateTime(DateTime.Today);

    private static List<Violation> RunChecks(List<Dictionary<string, string>> rows, List<Rule> rules, string[] uniqueColumns)
    {
        List<Violation> violations = new();

        CollectRows(rows, rules, 0, violations);
        CollectDuplicates(rows, uniqueColumns, 0, violations);

        return violations;
    }

    private static void CollectRows(List<Dictionary<string, string>> rows, List<Rule> rules, int index, List<Violation> violations)
    {
        if (index < rows.Count)
        {
            CollectRowViolations(rows[index], rules, index + 2, violations);
            CollectRows(rows, rules, index + 1, violations);
        }
    }

    private static void CollectDuplicates(List<Dictionary<string, string>> rows, string[] columns, int index, List<Violation> violations)
    {
        if (index < columns.Length)
        {
            CollectDuplicateViolations(rows, columns[index], violations);
            CollectDuplicates(rows, columns, index + 1, violations);
        }
    }

    private static void CollectRowViolations(Dictionary<string, string> row, List<Rule> rules, int lineNumber, List<Violation> violations) =>
        ForEachRule(row, rules, 0, lineNumber, violations);

    private static void ForEachRule(Dictionary<string, string> row, List<Rule> rules, int index, int lineNumber, List<Violation> violations)
    {
        if (index < rules.Count)
        {
            AddRuleViolation(row, rules[index], lineNumber, violations);
            ForEachRule(row, rules, index + 1, lineNumber, violations);
        }
    }

    private static void AddRuleViolation(Dictionary<string, string> row, Rule rule, int lineNumber, List<Violation> violations)
    {
        string? message = rule.Check(CellOf(row, rule.Column));

        if (message != null)
        {
            violations.Add(new Violation(lineNumber, rule.Column, rule.Name, message));
        }
    }

    private static string CellOf(Dictionary<string, string> row, string column)
    {
        row.TryGetValue(column, out string? raw);

        return raw ?? string.Empty;
    }

    private static void CollectDuplicateViolations(List<Dictionary<string, string>> rows, string column, List<Violation> violations) =>
        CheckDuplicates(rows, column, 0, new Dictionary<string, int>(StringComparer.Ordinal), violations);

    private static void CheckDuplicates(List<Dictionary<string, string>> rows, string column, int index, Dictionary<string, int> seen, List<Violation> violations)
    {
        if (index < rows.Count)
        {
            TrackValue(rows[index], column, index + 2, seen, violations);
            CheckDuplicates(rows, column, index + 1, seen, violations);
        }
    }

    private static void TrackValue(Dictionary<string, string> row, string column, int lineNumber, Dictionary<string, int> seen, List<Violation> violations)
    {
        string value = CellOf(row, column);
        bool isSeen = seen.TryGetValue(value, out int firstLine);

        if (isSeen)
        {
            violations.Add(new Violation(lineNumber, column, "unique", $"дубль значения {value}, впервые встретилось в строке {firstLine}"));
        }

        if (!isSeen)
        {
            seen[value] = lineNumber;
        }
    }

    private static void PrintViolations(List<Violation> violations, int rowCount)
    {
        Console.WriteLine($"Проверено строк: {rowCount}");
        Console.WriteLine($"Нарушений: {violations.Count}");
        Console.WriteLine();
        PrintTable(violations);
    }

    private static void PrintTable(List<Violation> violations)
    {
        if (violations.Count == 0)
        {
            Console.WriteLine("Все проверки пройдены.");
        }

        if (violations.Count > 0)
        {
            PrintRows(violations);
        }
    }

    private static void PrintRows(List<Violation> violations)
    {
        Console.WriteLine($"{"СТР.",-6} {"КОЛОНКА",-12} {"ПРАВИЛО",-16} ОПИСАНИЕ");
        Console.WriteLine(new string('-', 78));

        violations.ForEach(PrintViolation);
    }

    private static void PrintViolation(Violation violation) =>
        Console.WriteLine($"{violation.Row,-6} {violation.Column,-12} {violation.RuleName,-16} {violation.Message}");

    private delegate string? RuleCheck(string value);

    private sealed class Rule
    {
        public Rule(string column, string name, RuleCheck check, Dictionary<string, string>? parameters)
        {
            Column = column;
            Name = name;
            Check = check;
            Parameters = parameters;
        }

        public string Column { get; }

        public string Name { get; }

        public RuleCheck Check { get; }

        public Dictionary<string, string>? Parameters { get; }
    }

    private sealed class Violation
    {
        public Violation(int row, string column, string ruleName, string message)
        {
            Row = row;
            Column = column;
            RuleName = ruleName;
            Message = message;
        }

        public int Row { get; }

        public string Column { get; }

        public string RuleName { get; }

        public string Message { get; }
    }
}
