<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const WINDOW_SIZE = 3;
const Z_THRESHOLD = 2.0;
const BAR_WIDTH = 24;

function read_series(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("не удалось прочитать файл {$path}");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false || count($lines) < 2) {
        throw new RuntimeException('в файле нет данных');
    }

    array_shift($lines);
    $series = [];
    foreach ($lines as $line) {
        $parts = explode(CSV_DELIMITER, $line);
        if (count($parts) < 2) {
            continue;
        }
        $value = str_replace(',', '.', trim($parts[1]));
        if (!is_numeric($value)) {
            continue;
        }
        $series[] = ['period' => trim($parts[0]), 'value' => (float) $value];
    }

    return $series;
}

function moving_average(array $values, int $window): array
{
    $result = [];
    $count = count($values);
    for ($i = 0; $i < $count; $i++) {
        $from = max(0, $i - $window + 1);
        $slice = array_slice($values, $from, $i - $from + 1);
        $result[] = array_sum($slice) / count($slice);
    }

    return $result;
}

function mean(array $values): float
{
    return $values === [] ? 0.0 : array_sum($values) / count($values);
}

function standard_deviation(array $values): float
{
    if (count($values) < 2) {
        return 0.0;
    }

    $average = mean($values);
    $squares = [];
    foreach ($values as $value) {
        $squares[] = ($value - $average) ** 2;
    }

    return sqrt(array_sum($squares) / (count($values) - 1));
}

function z_score(float $value, float $average, float $deviation): float
{
    if ($deviation == 0.0) {
        return 0.0;
    }

    return ($value - $average) / $deviation;
}

function find_outliers(array $values, float $threshold): array
{
    $average = mean($values);
    $deviation = standard_deviation($values);
    $outliers = [];
    foreach ($values as $index => $value) {
        $score = z_score($value, $average, $deviation);
        if (abs($score) > $threshold) {
            $outliers[$index] = $score;
        }
    }

    return $outliers;
}

function build_bar(float $value, float $maximum): string
{
    if ($maximum <= 0) {
        return '';
    }

    return str_repeat('#', (int) round(BAR_WIDTH * $value / $maximum));
}

function print_series(array $series, array $averages, array $outliers): void
{
    $values = array_column($series, 'value');
    $maximum = max($values);
    printf("Окно сглаживания: %d, порог z-score: %.1f%s%s", WINDOW_SIZE, Z_THRESHOLD, PHP_EOL, PHP_EOL);
    printf("%-12s %12s %12s %8s %s%s", 'ПЕРИОД', 'ЗНАЧЕНИЕ', 'СРЕДНЕЕ', 'Z', 'ДИНАМИКА', PHP_EOL);
    printf("%s%s", str_repeat('-', 74), PHP_EOL);

    foreach ($series as $index => $row) {
        $average = $averages[$index];
        $averageAll = mean($values);
        $score = z_score($row['value'], $averageAll, standard_deviation($values));
        $mark = isset($outliers[$index]) ? '  <-- ВЫБРОС' : '';
        printf(
            "%-12s %12.0f %12.0f %8.2f %-24s%s%s",
            $row['period'],
            $row['value'],
            $average,
            $score,
            build_bar($row['value'], $maximum),
            $mark,
            PHP_EOL
        );
    }

    printf("%sВыбросов найдено: %d%s", PHP_EOL, count($outliers), PHP_EOL);
}

function main(array $argv): int
{
    $path = $argv[1] ?? __DIR__ . '/../../data/balance.csv';

    try {
        $series = read_series($path);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    if (count($series) < WINDOW_SIZE) {
        fwrite(STDERR, 'Ошибка: для сглаживания нужно минимум ' . WINDOW_SIZE . ' точки' . PHP_EOL);

        return 1;
    }

    $values = array_column($series, 'value');
    $averages = moving_average($values, WINDOW_SIZE);
    $outliers = find_outliers($values, Z_THRESHOLD);
    print_series($series, $averages, $outliers);

    return 0;
}

exit(main($argv));
