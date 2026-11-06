<?php

declare(strict_types=1);

const DEFAULT_SIZE = 2000;
const DEFAULT_SEED = 42;
const HEADER_COLUMNS = ['АЛГОРИТМ', 'ВРЕМЯ, МС', 'КОРРЕКТНО'];

function build_random_list(int $size, int $seed): array
{
    mt_srand($seed);
    $values = [];
    for ($i = 0; $i < $size; $i++) {
        $values[] = mt_rand(0, $size * 10);
    }

    return $values;
}

function shift_right(array $values, int $j): array
{
    $values[$j + 1] = $values[$j];

    return $values;
}

function shift_while_greater(array $values, int $j, int $current): array
{
    $state = ['values' => $values, 'j' => $j, 'done' => $j < 0 || $values[$j] <= $current];
    while (!$state['done']) {
        $state = shift_step($state['values'], $state['j'], $current);
    }

    return $state;
}

function shift_step(array $values, int $j, int $current): array
{
    $canShift = $j >= 0 && $values[$j] > $current;
    $next = $canShift ? shift_right($values, $j) : $values;

    return ['values' => $next, 'j' => $canShift ? $j - 1 : $j, 'done' => !$canShift];
}

function insertion_pass(array $values, int $i, int $size): array
{
    $result = $values;
    while ($i < $size) {
        $result = insert_item($result, $i);
        $i += 1;
    }

    return $result;
}

function insert_item(array $values, int $i): array
{
    $current = $values[$i];
    $state = shift_while_greater($values, $i - 1, $current);
    $result = $state['values'];
    $result[$state['j'] + 1] = $current;

    return $result;
}

function insertion_sort(array $values): array
{
    return insertion_pass($values, 1, count($values));
}

function take_left(array $result, array $left, int $i): array
{
    $result[] = $left[$i];

    return $result;
}

function take_right(array $result, array $right, int $j): array
{
    $result[] = $right[$j];

    return $result;
}

function merge_while(array $left, array $right, array $result, int $i, int $j): array
{
    $state = ['result' => $result, 'i' => $i, 'j' => $j, 'done' => $i >= count($left) || $j >= count($right)];
    while (!$state['done']) {
        $state = merge_step($left, $right, $state['result'], $state['i'], $state['j']);
    }

    return $state;
}

function merge_step(array $left, array $right, array $result, int $i, int $j): array
{
    $takeLeft = $left[$i] <= $right[$j];
    $merged = $takeLeft ? take_left($result, $left, $i) : take_right($result, $right, $j);
    $nextI = $i + ($takeLeft ? 1 : 0);
    $nextJ = $j + ($takeLeft ? 0 : 1);
    $done = $nextI >= count($left) || $nextJ >= count($right);

    return ['result' => $merged, 'i' => $nextI, 'j' => $nextJ, 'done' => $done];
}

function merge(array $left, array $right): array
{
    $state = merge_while($left, $right, [], 0, 0);

    return array_merge($state['result'], array_slice($left, $state['i']), array_slice($right, $state['j']));
}

function merge_sort(array $values): array
{
    $middle = intdiv(count($values), 2);
    $sorted = count($values) < 2 ? $values : merge(merge_sort(array_slice($values, 0, $middle)), merge_sort(array_slice($values, $middle)));

    return $sorted;
}

function swap(array $values, int $a, int $b): array
{
    [$values[$a], $values[$b]] = [$values[$b], $values[$a]];

    return $values;
}

function partition_pass(array $values, int $low, int $high, int $i, int $j): array
{
    $pivot = $values[$high];
    $state = ['values' => $values, 'i' => $i, 'j' => $j];
    while ($state['j'] < $high) {
        $state = partition_step($state['values'], $state['i'], $state['j'], $pivot);
    }

    return $state;
}

function partition_step(array $values, int $i, int $j, int $pivot): array
{
    $swapNow = $values[$j] <= $pivot;
    $next = $swapNow ? $i + 1 : $i;

    return ['values' => $swapNow ? swap($values, $next, $j) : $values, 'i' => $next, 'j' => $j + 1];
}

function quick_sort_partition(array $values, int $low, int $high): array
{
    $state = partition_pass($values, $low, $high, $low - 1, $low);
    $values = swap($state['values'], $state['i'] + 1, $high);

    return [$values, $state['i'] + 1];
}

function quick_sort_range(array $values, int $low, int $high): array
{
    $result = $values;
    if ($low < $high) {
        [$result, $pivot] = quick_sort_partition($values, $low, $high);
        $result = quick_sort_range($result, $low, $pivot - 1);
        $result = quick_sort_range($result, $pivot + 1, $high);
    }

    return $result;
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
        $sorted = $values[$i - 1] > $values[$i] ? false : $sorted;
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

    return ['name' => $name, 'ms' => $measurement['ms'], 'correct' => $measurement['result'] === $reference];
}

function sort_copy(array $values): array
{
    sort($values);

    return $values;
}

function collect_measurements(array $values, array $reference): array
{
    return [
        collect_measurement('вставки', 'insertion_sort', $values, $reference),
        collect_measurement('слияние', 'merge_sort', $values, $reference),
        collect_measurement('быстрая', 'quick_sort', $values, $reference),
        measure_array_sort($values, $reference),
    ];
}

function measure_array_sort(array $values, array $reference): array
{
    $measurement = measure('sort_copy', $values);

    return ['name' => 'array_sort', 'ms' => $measurement['ms'], 'correct' => $measurement['result'] === $reference];
}

function print_size(int $size): void
{
    printf("Размер массива: %d элементов%s%s", $size, PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-16s %12s %10s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 42), PHP_EOL);
}

function print_measurement(array $measurement): void
{
    printf("%-16s %12.2f %10s%s", $measurement['name'], $measurement['ms'], $measurement['correct'] ? 'да' : 'НЕТ', PHP_EOL);
}

function print_rows(array $measurements): void
{
    foreach ($measurements as $measurement) {
        print_measurement($measurement);
    }
}

function print_report(array $measurements, int $size): void
{
    print_size($size);
    print_table_head();
    print_separator();
    print_rows($measurements);
}

function read_size(array $argv): int
{
    return (int) ($argv[1] ?? DEFAULT_SIZE);
}

function report_size_error(): void
{
    fwrite(STDERR, 'Ошибка: размер массива должен быть не меньше 2' . PHP_EOL);
}

function main(array $argv): int
{
    $size = read_size($argv);
    if ($size < 2) {
        report_size_error();
    }
    if ($size >= 2) {
        run_bench($size);
    }

    return $size < 2 ? 1 : 0;
}

function run_bench(int $size): void
{
    $values = build_random_list($size, DEFAULT_SEED);
    $reference = sort_copy($values);
    print_report(collect_measurements($values, $reference), $size);
}

exit(main($argv));
