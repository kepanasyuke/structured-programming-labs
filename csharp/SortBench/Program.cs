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
        int size = ParseSize(args);
        bool accepted = size >= 2;

        if (accepted)
        {
            RunBenchmark(size);
        }

        PrintSizeError(accepted);

        return accepted ? 0 : 1;
    }

    private static int ParseSize(string[] args) => args.Length > 0 && int.TryParse(args[0], out int parsed) ? parsed : DefaultSize;

    private static void PrintSizeError(bool accepted)
    {
        if (!accepted)
        {
            Console.Error.WriteLine("Ошибка: размер массива должен быть не меньше 2");
        }
    }

    private static void RunBenchmark(int size)
    {
        int[] values = BuildRandomArray(size, DefaultSeed);
        List<Measurement> measurements = MeasureAll(values);

        PrintReport(measurements, size);
    }

    private static List<Measurement> MeasureAll(int[] values) => AddAll(new List<Measurement>(), values, SortCopy(values));

    private static List<Measurement> AddAll(List<Measurement> measurements, int[] values, int[] reference)
    {
        Add(measurements, "вставки", insertionSort, values, reference);
        Add(measurements, "слияние", mergeSort, values, reference);
        Add(measurements, "быстрая", quickSort, values, reference);
        Add(measurements, "Array.Sort", BuiltInSort, values, reference);

        return measurements;
    }

    private static void Add(List<Measurement> measurements, string name, Func<int[], int[]> algorithm, int[] values, int[] reference) =>
        measurements.Add(Measure(name, algorithm, values, reference));

    private static int[] SortCopy(int[] values)
    {
        int[] copy = (int[])values.Clone();

        Array.Sort(copy);

        return copy;
    }

    private static int[] BuildRandomArray(int size, int seed) => Fill(new Random(seed), new int[size], 0);

    private static int[] Fill(Random random, int[] values, int index)
    {
        if (index < values.Length)
        {
            values[index] = random.Next(0, values.Length * 10);
            Fill(random, values, index + 1);
        }

        return values;
    }

    private static int[] insertionSort(int[] values)
    {
        int[] result = (int[])values.Clone();

        SortByInsertion(result, 1);

        return result;
    }

    private static void SortByInsertion(int[] result, int index)
    {
        if (index < result.Length)
        {
            ShiftRight(result, index - 1, result[index]);
            SortByInsertion(result, index + 1);
        }
    }

    private static void ShiftRight(int[] result, int j, int current)
    {
        if (j >= 0 && result[j] > current)
        {
            result[j + 1] = result[j];
            ShiftRight(result, j - 1, current);
        }
        else
        {
            result[j + 1] = current;
        }
    }

    private static int[] mergeSort(int[] values) => values.Length < 2 ? values : Merge(mergeSort(LeftHalf(values)), mergeSort(RightHalf(values)));

    private static int[] LeftHalf(int[] values) => values[..(values.Length / 2)];

    private static int[] RightHalf(int[] values) => values[(values.Length / 2)..];

    private static int[] Merge(int[] left, int[] right) => MergeInto(left, right, new int[left.Length + right.Length], 0, 0, 0);

    private static int[] MergeInto(int[] left, int[] right, int[] result, int i, int j, int k)
    {
        int[] filled = CopyLeftovers(left, right, result, i, j, k);

        return filled;
    }

    private static int[] CopyLeftovers(int[] left, int[] right, int[] result, int i, int j, int k)
    {
        int[] merged = i < left.Length && j < right.Length ? TakeSmaller(left, right, result, i, j, k) : AppendTail(left, right, result, i, j, k);

        return merged;
    }

    private static int[] TakeSmaller(int[] left, int[] right, int[] result, int i, int j, int k)
    {
        int taken = left[i] <= right[j] ? 0 : 1;

        result[k] = taken == 0 ? left[i] : right[j];

        return taken == 0 ? MergeInto(left, right, result, i + 1, j, k + 1) : MergeInto(left, right, result, i, j + 1, k + 1);
    }

    private static int[] AppendTail(int[] left, int[] right, int[] result, int i, int j, int k) =>
        i < left.Length ? CopyFrom(left, result, i, k) : CopyFrom(right, result, j, k);

    private static int[] CopyFrom(int[] source, int[] result, int index, int k)
    {
        int[] filled = result;

        if (index < source.Length)
        {
            result[k] = source[index];
            filled = CopyFrom(source, result, index + 1, k + 1);
        }

        return filled;
    }

    private static int[] quickSort(int[] values)
    {
        int[] result = (int[])values.Clone();
        SortRange(result, 0, result.Length - 1);

        return result;
    }

    private static void SortRange(int[] values, int low, int high)
    {
        if (low < high)
        {
            int pivot = Partition(values, low, high);

            SortRange(values, low, pivot - 1);
            SortRange(values, pivot + 1, high);
        }
    }

    private static int Partition(int[] values, int low, int high)
    {
        int boundary = PlaceLeft(values, low, high, low - 1, values[high]);

        return SwapAndReturn(values, boundary + 1, high);
    }

    private static int PlaceLeft(int[] values, int low, int high, int boundary, int pivot)
    {
        int index = low;
        while (index < high)
        {
            boundary = StepLeft(values, index, boundary, pivot);
            index++;
        }

        return boundary;
    }

    private static int StepLeft(int[] values, int index, int boundary, int pivot)
    {
        bool move = values[index] <= pivot;
        int next = move ? boundary + 1 : boundary;
        if (move)
        {
            (values[next], values[index]) = (values[index], values[next]);
        }

        return next;
    }

    private static int Swap(int[] values, int first, int second)
    {
        (values[first], values[second]) = (values[second], values[first]);

        return first;
    }

    private static int SwapAndReturn(int[] values, int first, int second)
    {
        (values[first], values[second]) = (values[second], values[first]);

        return first;
    }

    private static int[] BuiltInSort(int[] values)
    {
        int[] result = (int[])values.Clone();
        Array.Sort(result);

        return result;
    }

    private static Measurement Measure(string name, Func<int[], int[]> algorithm, int[] values, int[] reference)
    {
        Stopwatch stopwatch = Stopwatch.StartNew();
        int[] result = algorithm(values);
        stopwatch.Stop();

        return new Measurement(name, stopwatch.Elapsed.TotalMilliseconds, AreEqual(result, reference));
    }

    private static bool AreEqual(int[] left, int[] right) => left.Length == right.Length && AreEqualFrom(left, right, 0);

    private static bool AreEqualFrom(int[] left, int[] right, int index) =>
        index >= left.Length || (left[index] == right[index] && AreEqualFrom(left, right, index + 1));

    private static void PrintReport(List<Measurement> measurements, int size)
    {
        Console.WriteLine($"Размер массива: {size} элементов");
        Console.WriteLine();
        Console.WriteLine($"{"АЛГОРИТМ",-16} {"ВРЕМЯ, МС",12} {"КОРРЕКТНО",10}");
        Console.WriteLine(new string('-', 42));

        measurements.ForEach(PrintMeasurement);
    }

    private static void PrintMeasurement(Measurement measurement)
    {
        Console.WriteLine(
            $"{measurement.Name,-16} {measurement.Milliseconds.ToString("F2", CultureInfo.InvariantCulture),12} {(measurement.IsCorrect ? "да" : "НЕТ"),10}");
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
