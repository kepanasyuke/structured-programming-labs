using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RpnCalc;

internal static class Program
{
    private static readonly Dictionary<string, int> Precedence = new()
    {
        ["+"] = 1,
        ["-"] = 1,
        ["*"] = 2,
        ["/"] = 2,
    };

    private static readonly Regex TokenPattern = new(@"\d+[.,]?\d*|[+\-*/()]", RegexOptions.Compiled);

    private static int Main(string[] args)
    {
        string expression = args.Length > 0 ? args[0] : "(1240+8940)*2-1500/3";

        if (!TryToRpn(Tokenize(expression), out List<string> rpn, out string error))
        {
            Console.Error.WriteLine($"Ошибка: {error}");
            return 1;
        }

        if (!TryEvaluate(rpn, out double value, out error))
        {
            Console.Error.WriteLine($"Ошибка: {error}");
            return 1;
        }

        PrintResult(expression, rpn, value);

        return 0;
    }

    private static List<string> Tokenize(string expression)
    {
        List<string> tokens = new();

        foreach (Match match in TokenPattern.Matches(expression.Replace(" ", string.Empty)))
        {
            tokens.Add(match.Value);
        }

        return tokens;
    }

    private static bool IsNumber(string token) => double.TryParse(token.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out _);

    private static bool TryToRpn(List<string> tokens, out List<string> rpn, out string error)
    {
        rpn = new List<string>();
        Stack<string> stack = new();
        error = string.Empty;
        bool balanced = true;

        foreach (string token in tokens)
        {
            if (!balanced)
            {
                break;
            }

            if (IsNumber(token))
            {
                rpn.Add(token);
            }
            else if (token == "(")
            {
                stack.Push(token);
            }
            else if (token == ")")
            {
                balanced = PopUntilBracket(stack, rpn);
            }
            else if (Precedence.ContainsKey(token))
            {
                PushOperator(token, stack, rpn);
            }
            else
            {
                error = $"неизвестный токен: {token}";
                balanced = false;
            }
        }

        if (balanced && !FlushStack(stack, rpn))
        {
            error = "несбалансированные скобки";
            balanced = false;
        }

        return balanced;
    }

    private static bool PopUntilBracket(Stack<string> stack, List<string> rpn)
    {
        bool found = false;

        while (stack.Count > 0 && !found)
        {
            string top = stack.Pop();
            if (top == "(")
            {
                found = true;
            }
            else
            {
                rpn.Add(top);
            }
        }

        return found;
    }

    private static void PushOperator(string token, Stack<string> stack, List<string> rpn)
    {
        bool ready = stack.Count == 0 || stack.Peek() == "(" || Precedence[stack.Peek()] < Precedence[token];

        while (!ready)
        {
            rpn.Add(stack.Pop());
            ready = stack.Count == 0 || stack.Peek() == "(" || Precedence[stack.Peek()] < Precedence[token];
        }

        stack.Push(token);
    }

    private static bool FlushStack(Stack<string> stack, List<string> rpn)
    {
        bool valid = true;

        while (stack.Count > 0)
        {
            string top = stack.Pop();
            if (top == "(")
            {
                valid = false;
            }
            else
            {
                rpn.Add(top);
            }
        }

        return valid;
    }

    private static bool TryEvaluate(List<string> rpn, out double value, out string error)
    {
        Stack<double> stack = new();
        value = 0;
        error = string.Empty;
        bool valid = true;

        foreach (string token in rpn)
        {
            if (!valid)
            {
                break;
            }

            if (IsNumber(token))
            {
                stack.Push(double.Parse(token.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture));
            }
            else if (stack.Count < 2)
            {
                error = $"недостаточно операндов для оператора {token}";
                valid = false;
            }
            else
            {
                valid = TryApply(token, stack, out error);
            }
        }

        if (valid && stack.Count != 1)
        {
            error = "выражение разобрано не полностью";
            valid = false;
        }

        if (valid)
        {
            value = stack.Pop();
        }

        return valid;
    }

    private static bool TryApply(string token, Stack<double> stack, out string error)
    {
        error = string.Empty;
        double right = stack.Pop();
        double left = stack.Pop();
        bool valid = true;

        switch (token)
        {
            case "+":
                stack.Push(left + right);
                break;
            case "-":
                stack.Push(left - right);
                break;
            case "*":
                stack.Push(left * right);
                break;
            case "/" when right != 0:
                stack.Push(left / right);
                break;
            case "/":
                error = "деление на ноль";
                valid = false;
                break;
            default:
                error = $"неизвестный оператор: {token}";
                valid = false;
                break;
        }

        return valid;
    }

    private static void PrintResult(string expression, List<string> rpn, double value)
    {
        Console.WriteLine($"Выражение: {expression}");
        Console.WriteLine($"ОПЗ: {string.Join(' ', rpn)}");
        Console.WriteLine($"Результат: {value.ToString("0.######", CultureInfo.InvariantCulture)}");
    }
}
