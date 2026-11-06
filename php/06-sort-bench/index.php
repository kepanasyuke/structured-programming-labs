<?php

declare(strict_types=1);

const DEFAULT_SIZE = 2000;
const DEFAULT_SEED = 42;

function build_random_list(int $size, int $seed): array
{
    mt_srand($seed);
    $values = [];
    for ($i = 0; $i < $size; $i++) {
        $values[] = mt_rand(0, $size * 10);
    }

    return $values;
}

function insertion_sort(array $values): array
{
    $size = count($values);
    for ($i = 1; $i < $size; $i++) {
        $current = $values[$i];
        $j = $i - 1;
        while ($j >= 0 && $values[$j] > $current) {
            $values[$j + 1] = $values[$j];
            $j--;
        }
        $values[$j + 1] = $current;
    }

    return $values;
}

function merge(array $left, array $right): array
{
    $result = [];
    $i = 0;
    $j = 0;
    while ($i < count($left) && $j < count($right)) {
        if ($left[$i] <= $right[$j]) {
            $result[] = $left[$i];
            $i++;
        } else {
            $result[] = $right[$j];
            $j++;
        }
    }

    return array_merge($result, array_slice($left, $i), array_slice($right, $j));
}

function merge_sort(array $values): array
{
    if (count($values) < 2) {
        return $values;
    }

    $middle = intdiv(count($values), 2);
    $left = merge_sort(array_slice($values, 0, $middle));
    $right = merge_sort(array_slice($values, $middle));

    return merge($left, $right);
}

function quick_sort_partition(array $values, int $low, int $high): array
{
    $pivot = $values[$high];
    $i = $low - 1;
    for ($j = $low; $j < $high; $j++) {
        if ($values[$j] <= $pivot) {
            $i++;
            [$values[$i], $values[$j]] = [$values[$j], $values[$i]];
        }
    }
    [$values[$i + 1], $values[$high]] = [$values[$high], $values[$i + 1]];

    return [$values, $i + 1];
}

function quick_sort_range(array $values, int $low, int $high): array
{
    if ($low >= $high) {
        return $values;
    }

    [$values, $pivot] = quick_sort_partition($values, $low, $high);
    $values = quick_sort_range($values, $low, $pivot - 1);

    return quick_sort_range($values, $pivot + 1, $high);
}

function quick_sort(array $values): array
{
    return quick_sort_range($values, 0, count($values) - 1);
}

function is_sorted(array $values): bool
{
    $size = count($values);
    $sorted = true;
    for ($i = 1; $i < $size; $i++) {
        if ($values[$i - 1] > $values[$i]) {
            $sorted = false;
        }
    }

    return $sorted;
}

function measure(callable $algorithm, array $values): array
{
    $started = hrtime(true);
    $result = $algorithm($values);
    $elapsed = (hrtime(true) - $started) / 1_000_000;

    return ['result' => $result, 'ms' => $elapsed];
}

function collect_measurement(string $name, callable $algorithm, array $values, array $reference): array
{
    $measurement = measure($algorithm, $values);
    $matches = $measurement['result'] === $reference;

    return ['name' => $name, 'ms' => $measurement['ms'], 'correct' => $matches];
}

function print_report(array $measurements, int $size): void
{
    printf("Размер массива: %d элементов%s%s", $size, PHP_EOL, PHP_EOL);
    printf("%-16s %12s %10s%s", 'АЛГОРИТМ', 'ВРЕМЯ, МС', 'КОРРЕКТНО', PHP_EOL);
    printf("%s%s", str_repeat('-', 42), PHP_EOL);
    foreach ($measurements as $measurement) {
        printf(
            "%-16s %12.2f %10s%s",
            $measurement['name'],
            $measurement['ms'],
            $measurement['correct'] ? 'да' : 'НЕТ',
            PHP_EOL
        );
    }
}

function main(array $argv): int
{
    $size = (int) ($argv[1] ?? DEFAULT_SIZE);
    if ($size < 2) {
        fwrite(STDERR, 'Ошибка: размер массива должен быть не меньше 2' . PHP_EOL);

        return 1;
    }

    $values = build_random_list($size, DEFAULT_SEED);
    $reference = $values;
    sort($reference);

    $measurements = [
        collect_measurement('вставки', 'insertion_sort', $values, $reference),
        collect_measurement('слияние', 'merge_sort', $values, $reference),
        collect_measurement('быстрая', 'quick_sort', $values, $reference),
        collect_measurement('array_sort', static fn (array $v): array => (static function (array $list): array { sort($list); return $list; })($v), $values, $reference),
    ];

    print_report($measurements, $size);

    return is_sorted($reference) ? 0 : 1;
}

exit(main($argv));
