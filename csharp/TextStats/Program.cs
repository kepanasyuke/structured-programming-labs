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
        string path = ResolvePath(args);
        bool loaded = TryReadText(path, out string text);
        List<string> words = new();
        bool filtered = loaded && TryFilterWords(text, path, out words);
        bool printed = filtered && PrintReport(path, text, words);

        return printed ? Report(path, loaded, filtered) : 1;
    }

    private static int Report(string path, bool loaded, bool filtered)
    {
        PrintFileError(path, loaded);
        PrintWordsError(filtered);

        return 0;
    }

    private static void PrintFileError(string path, bool loaded)
    {
        if (!loaded)
        {
            Console.Error.WriteLine($"Ошибка: не удалось прочитать файл {path}");
        }
    }

    private static void PrintWordsError(bool filtered)
    {
        if (!filtered)
        {
            Console.Error.WriteLine("Ошибка: в тексте не найдено ни одного слова");
        }
    }

    private static string ResolvePath(string[] args) =>
        args.Length > 0 ? args[0] : Path.Combine(AppContext.BaseDirectory, "../../../../data/sample.txt");

    private static string ResolveStopPath(string path) =>
        Path.Combine(Path.GetDirectoryName(path) ?? ".", "stopwords.txt");

    private static string ReadOrEmpty(string path) => File.Exists(path) ? File.ReadAllText(path) : string.Empty;

    private static bool TryReadText(string path, out string text)
    {
        text = ReadOrEmpty(path);

        return File.Exists(path);
    }

    private static bool TryFilterWords(string text, string path, out List<string> words)
    {
        List<string> parts = SplitWords(text, LoadStopWords(ResolveStopPath(path)));
        words = parts;

        return parts.Count > 0;
    }

    private static string[] ReadStopItems(string path) =>
        File.ReadAllText(path).ToLowerInvariant().Split(StopWordSeparators, StringSplitOptions.RemoveEmptyEntries);

    private static HashSet<string> LoadStopWords(string path)
    {
        HashSet<string> stopWords = new(StringComparer.OrdinalIgnoreCase);

        AddStopWords(stopWords, File.Exists(path) ? ReadStopItems(path) : Array.Empty<string>());

        return stopWords;
    }

    private static void AddStopWords(HashSet<string> stopWords, string[] items) => ForEach(items, stopWords);

    private static void ForEach(string[] items, HashSet<string> stopWords) => ForEachAt(items, 0, stopWords);

    private static void ForEachAt(string[] items, int index, HashSet<string> stopWords)
    {
        if (index < items.Length)
        {
            stopWords.Add(items[index].Trim());
            ForEachAt(items, index + 1, stopWords);
        }
    }

    private static List<string> SplitWords(string text, HashSet<string> stopWords)
    {
        List<string> words = new();

        foreach (Match match in WordPattern.Matches(text.ToLowerInvariant()))
        {
            AddIfSignificant(words, match.Value, stopWords);
        }

        return words;
    }

    private static void AddIfSignificant(List<string> words, string word, HashSet<string> stopWords)
    {
        if (IsSignificant(word, stopWords))
        {
            words.Add(word);
        }
    }

    private static bool IsSignificant(string word, HashSet<string> stopWords) =>
        word.Length >= MinWordLength && !stopWords.Contains(word);

    private static Dictionary<string, int> CountWords(List<string> words)
    {
        Dictionary<string, int> counts = new();

        foreach (string word in words)
        {
            Increment(counts, word);
        }

        return counts;
    }

    private static void Increment(Dictionary<string, int> counts, string word)
    {
        counts.TryGetValue(word, out int current);
        counts[word] = current + 1;
    }

    private static List<KeyValuePair<string, int>> SelectTop(Dictionary<string, int> counts, int limit)
    {
        List<KeyValuePair<string, int>> ordered = new(counts);
        ordered.Sort(CompareByFrequency);

        return TakeFirst(ordered, Math.Min(limit, ordered.Count));
    }

    private static List<KeyValuePair<string, int>> TakeFirst(List<KeyValuePair<string, int>> ordered, int size) =>
        CollectFirst(ordered, size, 0, new List<KeyValuePair<string, int>>(size));

    private static List<KeyValuePair<string, int>> CollectFirst(
        List<KeyValuePair<string, int>> ordered,
        int size,
        int index,
        List<KeyValuePair<string, int>> top)
    {
        List<KeyValuePair<string, int>> result = top;

        if (index < size)
        {
            top.Add(ordered[index]);
            result = CollectFirst(ordered, size, index + 1, top);
        }

        return result;
    }

    private static int CompareByFrequency(KeyValuePair<string, int> left, KeyValuePair<string, int> right)
    {
        int byCount = right.Value.CompareTo(left.Value);

        return byCount != 0 ? byCount : string.CompareOrdinal(left.Key, right.Key);
    }

    private static bool PrintReport(string path, string text, List<string> words)
    {
        PrintHeader(path, text, words);
        PrintTop(SelectTop(CountWords(words), TopSize));

        return true;
    }

    private static void PrintHeader(string path, string text, List<string> words)
    {
        Console.WriteLine($"Файл: {path}");
        Console.WriteLine($"Символов: {text.Length}");
        Console.WriteLine($"Слов после фильтрации: {words.Count}");
        Console.WriteLine($"Уникальных: {CountWords(words).Count}");
        Console.WriteLine();
    }

    private static void PrintTop(List<KeyValuePair<string, int>> top)
    {
        PrintColumns();
        Console.WriteLine(new string('-', 34));
        ForEachTop(top);
    }

    private static void PrintColumns() => Console.WriteLine($"{"СЛОВО",-24} {"ЧАСТОТА",8}");

    private static void ForEachTop(List<KeyValuePair<string, int>> top) => ForEachTopAt(top, 0);

    private static void ForEachTopAt(List<KeyValuePair<string, int>> top, int index)
    {
        if (index < top.Count)
        {
            PrintWord(top[index]);
            ForEachTopAt(top, index + 1);
        }
    }

    private static void PrintWord(KeyValuePair<string, int> pair) => Console.WriteLine($"{pair.Key,-24} {pair.Value,8}");
}
