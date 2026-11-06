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

    private static readonly Regex InnPattern = new(@"^(\d{10}|\d{12})$", RegexOptions.Compiled);
    private static readonly Regex DatePattern = new(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.Compiled);
    private static readonly string[] Statuses = { "active", "blocked", "closed" };

    private static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/clients.csv");

        if (!TryReadCsv(path, out string[] header, out List<Dictionary<string, string>> rows))
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
            return 2;
        }

        List<Violation> violations = RunChecks(rows, BuildRules(), new[] { "client_id" });
        PrintViolations(violations, rows.Count);

        return violations.Count == 0 ? 0 : ViolationExitCode;
    }

    private static bool TryReadCsv(string path, out string[] header, out List<Dictionary<string, string>> rows)
    {
        header = Array.Empty<string>();
        rows = new List<Dictionary<string, string>>();

        if (!File.Exists(path))
        {
            return false;
        }

        string[] lines = File.ReadAllLines(path);
        if (lines.Length == 0)
        {
            return false;
        }

        header = lines[0].Split(Delimiter);

        for (int i = 1; i < lines.Length; i++)
        {
            if (lines[i].Trim().Length > 0)
            {
                rows.Add(ToRecord(header, lines[i]));
            }
        }

        return true;
    }

    private static Dictionary<string, string> ToRecord(string[] header, string line)
    {
        string[] values = line.Split(Delimiter);
        Dictionary<string, string> record = new(StringComparer.Ordinal);

        for (int i = 0; i < header.Length; i++)
        {
            record[header[i].Trim()] = i < values.Length ? values[i].Trim() : string.Empty;
        }

        return record;
    }

    private static List<Rule> BuildRules() => new()
    {
        new Rule("client_id", "not_null", CheckNotNull, null),
        new Rule("inn", "format", CheckInn, null),
        new Rule("balance_rub", "positive_number", CheckNonNegative, null),
        new Rule("status", "allowed_values", CheckStatus, null),
        new Rule("open_date", "not_future_date", CheckNotFutureDate, null),
    };

    private static string? CheckNotNull(string value) => value.Length == 0 ? "значение пустое" : null;

    private static string? CheckInn(string value)
    {
        if (value.Length == 0)
        {
            return "значение пустое";
        }

        if (InnPattern.IsMatch(value) == false)
        {
            return "неверная длина ИНН";
        }

        return HasValidInnChecksum(value) ? null : "контрольное число ИНН не сходится";
    }

    private static bool HasValidInnChecksum(string inn)
    {
        int[] digits = new int[inn.Length];
        for (int i = 0; i < inn.Length; i++)
        {
            digits[i] = inn[i] - '0';
        }

        return inn.Length == 10 ? MatchesTenDigitChecksum(digits) : MatchesTwelveDigitChecksum(digits);
    }

    private static bool MatchesTenDigitChecksum(int[] digits)
    {
        int[] weights = { 2, 4, 10, 3, 5, 9, 4, 6, 8 };
        int sum = 0;

        for (int i = 0; i < weights.Length; i++)
        {
            sum += weights[i] * digits[i];
        }

        return sum % 11 % 10 == digits[9];
    }

    private static bool MatchesTwelveDigitChecksum(int[] digits)
    {
        int[] weightsEleven = { 7, 2, 4, 10, 3, 5, 9, 4, 6, 8 };
        int[] weightsTwelve = { 3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8 };
        int sumEleven = 0;
        int sumTwelve = 0;

        for (int i = 0; i < weightsEleven.Length; i++)
        {
            sumEleven += weightsEleven[i] * digits[i];
        }

        for (int i = 0; i < weightsTwelve.Length; i++)
        {
            sumTwelve += weightsTwelve[i] * digits[i];
        }

        return sumEleven % 11 % 10 == digits[10] && sumTwelve % 11 % 10 == digits[11];
    }

    private static string? CheckNonNegative(string value)
    {
        if (value.Length == 0)
        {
            return "значение пустое";
        }

        string normalized = value.Replace(',', '.');

        if (!decimal.TryParse(normalized, NumberStyles.Float, CultureInfo.InvariantCulture, out decimal number))
        {
            return "значение не является числом";
        }

        return number >= 0 ? null : "отрицательный остаток";
    }

    private static string? CheckStatus(string value) => Array.IndexOf(Statuses, value) >= 0 ? null : "значение вне справочника";

    private static string? CheckNotFutureDate(string value)
    {
        if (!DatePattern.IsMatch(value))
        {
            return "значение не является датой";
        }

        if (!DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly date))
        {
            return "некорректная дата";
        }

        return date <= DateOnly.FromDateTime(DateTime.Today) ? null : "дата в будущем";
    }

    private static List<Violation> RunChecks(List<Dictionary<string, string>> rows, List<Rule> rules, string[] uniqueColumns)
    {
        List<Violation> violations = new();

        for (int i = 0; i < rows.Count; i++)
        {
            CollectRowViolations(rows[i], rules, i + 2, violations);
        }

        foreach (string column in uniqueColumns)
        {
            CollectDuplicateViolations(rows, column, violations);
        }

        return violations;
    }

    private static void CollectRowViolations(Dictionary<string, string> row, List<Rule> rules, int lineNumber, List<Violation> violations)
    {
        foreach (Rule rule in rules)
        {
            row.TryGetValue(rule.Column, out string? raw);
            string value = raw ?? string.Empty;
            string? message = rule.Check(value);

            if (message != null)
            {
                violations.Add(new Violation(lineNumber, rule.Column, rule.Name, message));
            }
        }
    }

    private static void CollectDuplicateViolations(List<Dictionary<string, string>> rows, string column, List<Violation> violations)
    {
        Dictionary<string, int> seen = new(StringComparer.Ordinal);

        for (int i = 0; i < rows.Count; i++)
        {
            rows[i].TryGetValue(column, out string? raw);
            string value = raw ?? string.Empty;
            int lineNumber = i + 2;

            if (seen.TryGetValue(value, out int firstLine))
            {
                violations.Add(new Violation(lineNumber, column, "unique", $"дубль значения {value}, впервые встретилось в строке {firstLine}"));
            }
            else
            {
                seen[value] = lineNumber;
            }
        }
    }

    private static void PrintViolations(List<Violation> violations, int rowCount)
    {
        Console.WriteLine($"Проверено строк: {rowCount}");
        Console.WriteLine($"Нарушений: {violations.Count}");
        Console.WriteLine();

        if (violations.Count == 0)
        {
            Console.WriteLine("Все проверки пройдены.");
            return;
        }

        Console.WriteLine($"{"СТР.",-6} {"КОЛОНКА",-12} {"ПРАВИЛО",-16} ОПИСАНИЕ");
        Console.WriteLine(new string('-', 78));

        foreach (Violation violation in violations)
        {
            Console.WriteLine($"{violation.Row,-6} {violation.Column,-12} {violation.RuleName,-16} {violation.Message}");
        }
    }

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
