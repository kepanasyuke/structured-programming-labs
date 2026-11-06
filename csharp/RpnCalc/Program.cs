using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RpnCalc;

internal static class Program
{
    private static readonly Dictionary<string, int> Precedence = Weight("*", 2, Weight("/", 2, Weight("+", 1, Weight("-", 1, new Dictionary<string, int>()))));

    private static readonly Regex TokenPattern = new(@"\d+[.,]?\d*|[+\-*/()]", RegexOptions.Compiled);

    private static int Main(string[] args)
    {
        string expression = args.Length > 0 ? args[0] : "(1240+8940)*2-1500/3";
        bool converted = TryToRpn(Tokenize(expression), out List<string> rpn, out string error);
        bool evaluated = converted && TryEvaluate(rpn, out double value, out error);
        bool printed = evaluated && PrintResult(expression, rpn, value);

        PrintError(converted, evaluated, error);

        return printed ? 0 : 1;
    }

    private static Dictionary<string, int> Weight(string token, int value, Dictionary<string, int> table)
    {
        table[token] = value;

        return table;
    }

    private static void PrintError(bool converted, bool evaluated, string error)
    {
        if (!converted || !evaluated)
        {
            Console.Error.WriteLine($"Ошибка: {error}");
        }
    }

    private static List<string> Tokenize(string expression) => CollectTokens(TokenPattern.Matches(expression.Replace(" ", string.Empty)), 0);

    private static List<string> CollectTokens(MatchCollection matches, int index)
    {
        List<string> tokens = new();

        for (int i = index; i < matches.Count; i++)
        {
            tokens.Add(matches[i].Value);
        }

        return tokens;
    }

    private static bool IsNumber(string token) => double.TryParse(token.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out _);

    private static double ToDouble(string token) => double.Parse(token.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture);

    private static bool TryToRpn(List<string> tokens, out List<string> rpn, out string error)
    {
        rpn = new List<string>();
        error = string.Empty;

        return TryToRpnAt(tokens, 0, new Stack<string>(), rpn, new string[] { string.Empty });
    }

    private static bool TryToRpnAt(List<string> tokens, int index, Stack<string> stack, List<string> rpn, string[] error)
    {
        bool valid = index < tokens.Count || FlushStack(stack, rpn, error);

        if (index < tokens.Count)
        {
            valid = IsTokenAccepted(tokens[index], stack, rpn, error) && TryToRpnAt(tokens, index + 1, stack, rpn, error);
        }

        return valid;
    }

    private static bool IsTokenAccepted(string token, Stack<string> stack, List<string> rpn, string[] error) =>
        IsNumber(token) ? AcceptNumber(token, rpn) : IsBracketOpen(token) ? AcceptOpen(token, stack) : IsBracketClose(token) ? PopUntilBracket(stack, rpn) : IsOperator(token) ? AcceptOperator(token, stack, rpn) : Reject(token, error);

    private static bool AcceptNumber(string token, List<string> rpn)
    {
        rpn.Add(token);

        return true;
    }

    private static bool AcceptOpen(string token, Stack<string> stack)
    {
        stack.Push(token);

        return true;
    }

    private static bool IsBracketOpen(string token) => token == "(";

    private static bool IsBracketClose(string token) => token == ")";

    private static bool IsOperator(string token) => Precedence.ContainsKey(token);

    private static bool AcceptOperator(string token, Stack<string> stack, List<string> rpn)
    {
        PushOperator(token, stack, rpn);

        return true;
    }

    private static bool Reject(string token, string[] error)
    {
        error[0] = $"неизвестный токен: {token}";

        return false;
    }

    private static bool PopUntilBracket(Stack<string> stack, List<string> rpn)
    {
        bool found = false;

        while (stack.Count > 0 && !found)
        {
            found = PopOne(stack, rpn);
        }

        return found;
    }

    private static bool PopOne(Stack<string> stack, List<string> rpn)
    {
        string top = stack.Pop();
        bool isBracket = top == "(";

        if (!isBracket)
        {
            rpn.Add(top);
        }

        return isBracket;
    }

    private static bool IsReady(Stack<string> stack, string token) =>
        stack.Count == 0 || stack.Peek() == "(" || Precedence[stack.Peek()] < Precedence[token];

    private static void PushOperator(string token, Stack<string> stack, List<string> rpn)
    {
        while (!IsReady(stack, token))
        {
            rpn.Add(stack.Pop());
        }

        stack.Push(token);
    }

    private static bool FlushStack(Stack<string> stack, List<string> rpn, string[] error)
    {
        bool valid = true;

        while (stack.Count > 0)
        {
            valid = DrainOne(stack, rpn) && valid;
        }

        error[0] = valid ? error[0] : "несбалансированные скобки";

        return valid;
    }

    private static bool DrainOne(Stack<string> stack, List<string> rpn)
    {
        string top = stack.Pop();
        bool isBracket = top == "(";

        if (!isBracket)
        {
            rpn.Add(top);
        }

        return !isBracket;
    }

    private static bool TryEvaluate(List<string> rpn, out double value, out string error)
    {
        Stack<double> stack = new();
        string[] box = { string.Empty };
        bool valid = EvaluateAt(rpn, 0, stack, box);

        value = valid ? stack.Pop() : 0;
        error = box[0];

        return valid;
    }

    private static bool EvaluateAt(List<string> rpn, int index, Stack<double> stack, string[] error)
    {
        bool valid = true;

        if (index < rpn.Count)
        {
            valid = ApplyToken(rpn[index], stack, error) && EvaluateAt(rpn, index + 1, stack, error);
        }

        return valid && IsSingleResult(stack, error);
    }

    private static bool IsSingleResult(Stack<double> stack, string[] error)
    {
        bool single = stack.Count == 1;

        error[0] = single ? error[0] : "выражение разобрано не полностью";

        return single;
    }

    private static bool ApplyToken(string token, Stack<double> stack, string[] error) =>
        IsNumber(token) ? PushValue(token, stack) : HasTwoOperands(stack) ? TryApply(token, stack, error) : RejectOperand(token, error);

    private static bool PushValue(string token, Stack<double> stack)
    {
        stack.Push(ToDouble(token));

        return true;
    }

    private static bool HasTwoOperands(Stack<double> stack) => stack.Count >= 2;

    private static bool RejectOperand(string token, string[] error)
    {
        error[0] = $"недостаточно операндов для оператора {token}";

        return false;
    }

    private static bool TryApply(string token, Stack<double> stack, out string error)
    {
        string[] box = { string.Empty };
        double right = stack.Pop();
        double left = stack.Pop();
        bool valid = ApplyOperator(token, left, right, stack, box);

        error = box[0];

        return valid;
    }

    private static bool ApplyOperator(string token, double left, double right, Stack<double> stack, string[] error) =>
        token == "+" ? PushResult(left + right, stack) : token == "-" ? PushResult(left - right, stack) : token == "*" ? PushResult(left * right, stack) : ApplyDivision(left, right, stack, error);

    private static bool ApplyDivision(double left, double right, Stack<double> stack, string[] error) =>
        right != 0 ? PushResult(left / right, stack) : ReportDivisionError(error);

    private static bool PushResult(double value, Stack<double> stack)
    {
        stack.Push(value);

        return true;
    }

    private static bool ReportDivisionError(string[] error)
    {
        error[0] = "деление на ноль";

        return false;
    }

    private static bool PrintResult(string expression, List<string> rpn, double value)
    {
        Console.WriteLine($"Выражение: {expression}");
        Console.WriteLine($"ОПЗ: {string.Join(' ', rpn)}");
        Console.WriteLine($"Результат: {FormatValue(value)}");

        return true;
    }

    private static string FormatValue(double value) => value.ToString("0.######", CultureInfo.InvariantCulture);
}
