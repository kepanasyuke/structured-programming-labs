using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;

namespace SortBench;

internal static class Program
{
    private const int DefaultSize = 2000;
    private const int DefaultSeed = 42;

    private static int Main(string[] args)
    {
        int size = args.Length > 0 && int.TryParse(args[0], out int parsed) ? parsed : DefaultSize;

        if (size < 2)
        {
            Console.Error.WriteLine("Ошибка: размер массива должен быть не меньше 2");
            return 1;
        }

        int[] values = BuildRandomArray(size, DefaultSeed);
        int[] reference = (int[])values.Clone();
        Array.Sort(reference);

        List<Measurement> measurements = new()
        {
            Measure("вставки", insertionSort, values, reference),
            Measure("слияние", mergeSort, values, reference),
            Measure("быстрая", quickSort, values, reference),
            Measure("Array.Sort", BuiltInSort, values, reference),
        };

        PrintReport(measurements, size);

        return IsSorted(reference) ? 0 : 1;
    }

    private static int[] BuildRandomArray(int size, int seed)
    {
        Random random = new(seed);
        int[] values = new int[size];

        for (int i = 0; i < size; i++)
        {
            values[i] = random.Next(0, size * 10);
        }

        return values;
    }

    private static int[] insertionSort(int[] values)
    {
        int[] result = (int[])values.Clone();

        for (int i = 1; i < result.Length; i++)
        {
            int current = result[i];
            int j = i - 1;

            while (j >= 0 && result[j] > current)
            {
                result[j + 1] = result[j];
                j--;
            }

            result[j + 1] = current;
        }

        return result;
    }

    private static int[] mergeSort(int[] values) => values.Length < 2 ? values : SortHalves(values);

    private static int[] SortHalves(int[] values)
    {
        int middle = values.Length / 2;
        int[] left = mergeSort(values[..middle]);
        int[] right = mergeSort(values[middle..]);

        return Merge(left, right);
    }

    private static int[] Merge(int[] left, int[] right)
    {
        int[] result = new int[left.Length + right.Length];
        int i = 0;
        int j = 0;
        int k = 0;

        while (i < left.Length && j < right.Length)
        {
            if (left[i] <= right[j])
            {
                result[k++] = left[i++];
            }
            else
            {
                result[k++] = right[j++];
            }
        }

        while (i < left.Length)
        {
            result[k++] = left[i++];
        }

        while (j < right.Length)
        {
            result[k++] = right[j++];
        }

        return result;
    }

    private static int[] quickSort(int[] values)
    {
        int[] result = (int[])values.Clone();
        SortRange(result, 0, result.Length - 1);

        return result;
    }

    private static void SortRange(int[] values, int low, int high)
    {
        if (low >= high)
        {
            return;
        }

        int pivot = Partition(values, low, high);
        SortRange(values, low, pivot - 1);
        SortRange(values, pivot + 1, high);
    }

    private static int Partition(int[] values, int low, int high)
    {
        int pivotValue = values[high];
        int i = low - 1;

        for (int j = low; j < high; j++)
        {
            if (values[j] <= pivotValue)
            {
                i++;
                (values[i], values[j]) = (values[j], values[i]);
            }
        }

        (values[i + 1], values[high]) = (values[high], values[i + 1]);

        return i + 1;
    }

    private static int[] BuiltInSort(int[] values)
    {
        int[] result = (int[])values.Clone();
        Array.Sort(result);

        return result;
    }

    private static bool IsSorted(int[] values)
    {
        bool sorted = true;

        for (int i = 1; i < values.Length; i++)
        {
            if (values[i - 1] > values[i])
            {
                sorted = false;
            }
        }

        return sorted;
    }

    private static Measurement Measure(string name, Func<int[], int[]> algorithm, int[] values, int[] reference)
    {
        Stopwatch stopwatch = Stopwatch.StartNew();
        int[] result = algorithm(values);
        stopwatch.Stop();

        return new Measurement(name, stopwatch.Elapsed.TotalMilliseconds, AreEqual(result, reference));
    }

    private static bool AreEqual(int[] left, int[] right)
    {
        bool equal = left.Length == right.Length;
        int i = 0;

        while (equal && i < left.Length)
        {
            equal = left[i] == right[i];
            i++;
        }

        return equal;
    }

    private static void PrintReport(List<Measurement> measurements, int size)
    {
        Console.WriteLine($"Размер массива: {size} элементов");
        Console.WriteLine();
        Console.WriteLine($"{"АЛГОРИТМ",-16} {"ВРЕМЯ, МС",12} {"КОРРЕКТНО",10}");
        Console.WriteLine(new string('-', 42));

        foreach (Measurement measurement in measurements)
        {
            Console.WriteLine(
                $"{measurement.Name,-16} {measurement.Milliseconds.ToString("F2", CultureInfo.InvariantCulture),12} {(measurement.IsCorrect ? "да" : "НЕТ"),10}");
        }
    }

    private sealed class Measurement
    {
        public Measurement(string name, double milliseconds, bool isCorrect)
        {
            Name = name;
            Milliseconds = milliseconds;
            IsCorrect = isCorrect;
        }

        public string Name { get; }

        public double Milliseconds { get; }

        public bool IsCorrect { get; }
    }
}
