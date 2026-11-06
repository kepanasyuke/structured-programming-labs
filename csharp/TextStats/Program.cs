using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace TextStats;

internal static class Program
{
    private const int TopSize = 10;
    private const int MinWordLength = 2;

    private static readonly Regex WordPattern = new(@"[\p{L}\p{N}]+", RegexOptions.Compiled);
    private static readonly char[] StopWordSeparators = { ' ', '\t', '\r', '\n' };

    private static int Main(string[] args)
    {
        string path = args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/sample.txt");
        string stopPath = args.Length > 1 ? args[1] : Path.Combine(Path.GetDirectoryName(path) ?? ".", "stopwords.txt");

        if (!TryReadText(path, out string text))
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
            return 1;
        }

        HashSet<string> stopWords = LoadStopWords(stopPath);
        List<string> words = SplitWords(text, stopWords);

        if (words.Count == 0)
        {
            Console.Error.WriteLine("Ошибка: в тексте не найдено ни одного слова");
            return 1;
        }

        Dictionary<string, int> counts = CountWords(words);
        List<KeyValuePair<string, int>> top = SelectTop(counts, TopSize);

        PrintReport(path, text, words, counts, top);

        return 0;
    }

    private static bool TryReadText(string path, out string text)
    {
        text = string.Empty;
        bool exists = File.Exists(path);

        if (exists)
        {
            text = File.ReadAllText(path);
        }

        return exists;
    }

    private static HashSet<string> LoadStopWords(string path)
    {
        HashSet<string> stopWords = new(StringComparer.OrdinalIgnoreCase);

        if (!File.Exists(path))
        {
            return stopWords;
        }

        string[] items = File.ReadAllText(path).ToLowerInvariant().Split(StopWordSeparators, StringSplitOptions.RemoveEmptyEntries);

        foreach (string item in items)
        {
            stopWords.Add(item.Trim());
        }

        return stopWords;
    }

    private static List<string> SplitWords(string text, HashSet<string> stopWords)
    {
        List<string> words = new();

        foreach (Match match in WordPattern.Matches(text.ToLowerInvariant()))
        {
            string word = match.Value;
            bool isShort = word.Length < MinWordLength;

            if (!isShort && !stopWords.Contains(word))
            {
                words.Add(word);
            }
        }

        return words;
    }

    private static Dictionary<string, int> CountWords(List<string> words)
    {
        Dictionary<string, int> counts = new();

        foreach (string word in words)
        {
            counts.TryGetValue(word, out int current);
            counts[word] = current + 1;
        }

        return counts;
    }

    private static List<KeyValuePair<string, int>> SelectTop(Dictionary<string, int> counts, int limit)
    {
        List<KeyValuePair<string, int>> ordered = new(counts);
        ordered.Sort(CompareByFrequency);

        int size = Math.Min(limit, ordered.Count);
        List<KeyValuePair<string, int>> top = new(size);

        for (int i = 0; i < size; i++)
        {
            top.Add(ordered[i]);
        }

        return top;
    }

    private static int CompareByFrequency(KeyValuePair<string, int> left, KeyValuePair<string, int> right)
    {
        int byCount = right.Value.CompareTo(left.Value);

        return byCount != 0 ? byCount : string.CompareOrdinal(left.Key, right.Key);
    }

    private static void PrintReport(
        string path,
        string text,
        List<string> words,
        Dictionary<string, int> counts,
        List<KeyValuePair<string, int>> top)
    {
        Console.WriteLine($"Файл: {path}");
        Console.WriteLine($"Символов: {text.Length}");
        Console.WriteLine($"Слов после фильтрации: {words.Count}");
        Console.WriteLine($"Уникальных: {counts.Count}");
        Console.WriteLine();
        Console.WriteLine($"{"СЛОВО",-24} {"ЧАСТОТА",8}");
        Console.WriteLine(new string('-', 34));

        foreach (KeyValuePair<string, int> pair in top)
        {
            Console.WriteLine($"{pair.Key,-24} {pair.Value,8}");
        }
    }
}
