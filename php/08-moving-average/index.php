<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const WINDOW_SIZE = 3;
const Z_THRESHOLD = 2.0;
const BAR_WIDTH = 24;
const BAR_SYMBOL = '#';
const HEADER_COLUMNS = ['ПЕРИОД', 'ЗНАЧЕНИЕ', 'СРЕДНЕЕ', 'Z', 'ДИНАМИКА'];
const OUTLIER_MARK = '  <-- ВЫБРОС';

function file_is_readable(string $path): bool
{
    return is_file($path) && is_readable($path);
}

function read_lines(string $path): ?array
{
    $lines = file_is_readable($path) ? file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : false;

    return $lines === false || count($lines) < 2 ? null : $lines;
}

function split_fields(string $line): array
{
    return explode(CSV_DELIMITER, $line);
}

function parse_value(string $field): ?float
{
    $value = str_replace(',', '.', trim($field));

    return is_numeric($value) ? (float) $value : null;
}

function build_point(string $line): array
{
    $parts = split_fields($line);
    $value = count($parts) < 2 ? null : parse_value($parts[1]);

    return $value === null ? [] : [['period' => trim($parts[0]), 'value' => $value]];
}

function collect_points(array $lines, int $index, array $points): array
{
    $result = $points;
    while ($index < count($lines)) {
        $result = array_merge($result, build_point($lines[$index]));
        $index += 1;
    }

    return $result;
}

function read_series(string $path): ?array
{
    $lines = read_lines($path);

    return $lines === null ? null : collect_points(array_slice($lines, 1), 0, []);
}

function window_start(int $index, int $window): int
{
    return max(0, $index - $window + 1);
}

function window_slice(array $values, int $index, int $window): array
{
    $from = window_start($index, $window);

    return array_slice($values, $from, $index - $from + 1);
}

function window_mean(array $slice): float
{
    return array_sum($slice) / count($slice);
}

function average_step(array $values, int $index, int $window): float
{
    return window_mean(window_slice($values, $index, $window));
}

function average_loop(array $values, int $index, int $window, array $result): array
{
    $accumulated = $result;
    while ($index < count($values)) {
        $accumulated[] = average_step($values, $index, $window);
        $index += 1;
    }

    return $accumulated;
}

function moving_average(array $values, int $window): array
{
    return average_loop($values, 0, $window, []);
}

function mean(array $values): float
{
    return $values === [] ? 0.0 : array_sum($values) / count($values);
}

function square_deviation(float $value, float $average): float
{
    return ($value - $average) ** 2;
}

function squared_values(array $values, int $index, float $average, array $squares): array
{
    $result = $squares;
    while ($index < count($values)) {
        $result[] = square_deviation($values[$index], $average);
        $index += 1;
    }

    return $result;
}

function standard_deviation(array $values): float
{
    $average = mean($values);
    $squares = squared_values($values, 0, $average, []);
    $deviation = count($values) < 2 ? 0.0 : sqrt(array_sum($squares) / (count($values) - 1));

    return $deviation;
}

function z_score(float $value, float $average, float $deviation): float
{
    $score = $deviation == 0.0 ? 0.0 : ($value - $average) / $deviation;

    return $score;
}

function add_outlier(array $outliers, int $index, float $score, float $threshold): array
{
    return abs($score) > $threshold ? [$index => $score] + $outliers : $outliers;
}

function find_outliers(array $values, float $threshold): array
{
    $average = mean($values);
    $deviation = standard_deviation($values);
    $outliers = [];
    foreach ($values as $index => $value) {
        $outliers = add_outlier($outliers, $index, z_score($value, $average, $deviation), $threshold);
    }

    return $outliers;
}

function build_bar(float $value, float $maximum): string
{
    return $maximum <= 0 ? '' : str_repeat(BAR_SYMBOL, (int) round(BAR_WIDTH * $value / $maximum));
}

function print_parameters(): void
{
    printf("Окно сглаживания: %d, порог z-score: %.1f%s%s", WINDOW_SIZE, Z_THRESHOLD, PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-12s %12s %12s %8s %s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 74), PHP_EOL);
}

function print_row(array $row, array $averages, int $index, array $context): void
{
    $cells = [$row['period'], $row['value'], $averages[$index], row_score($row['value'], $context), build_bar($row['value'], $context['maximum']), row_mark($context['outliers'], $index), PHP_EOL];
    printf("%-12s %12.0f %12.0f %8.2f %-24s%s%s", ...$cells);
}

function row_score(float $value, array $context): float
{
    return z_score($value, $context['average'], $context['deviation']);
}

function row_mark(array $outliers, int $index): string
{
    return isset($outliers[$index]) ? OUTLIER_MARK : '';
}

function print_rows(array $series, array $averages, array $outliers, array $context): void
{
    foreach ($series as $index => $row) {
        print_row($row, $averages, $index, $context);
    }
}

function print_outlier_count(array $outliers): void
{
    printf("%sВыбросов найдено: %d%s", PHP_EOL, count($outliers), PHP_EOL);
}

function print_series(array $series, array $averages, array $outliers): void
{
    print_parameters();
    print_table_head();
    print_separator();
    print_rows($series, $averages, $outliers, build_context($series, $outliers));
    print_outlier_count($outliers);
}

function build_context(array $series, array $outliers): array
{
    $values = array_column($series, 'value');
    $average = mean($values);
    $deviation = standard_deviation($values);

    return ['maximum' => max($values), 'average' => $average, 'deviation' => $deviation, 'outliers' => $outliers];
}

function series_values(array $series): array
{
    return array_column($series, 'value');
}

function read_path(array $argv): string
{
    return $argv[1] ?? __DIR__ . '/../../data/balance.csv';
}

function report_read_error(string $path): void
{
    fwrite(STDERR, 'Ошибка: не удалось прочитать файл ' . $path . PHP_EOL);
}

function report_window_error(): void
{
    fwrite(STDERR, 'Ошибка: для сглаживания нужно минимум ' . WINDOW_SIZE . ' точки' . PHP_EOL);
}

function is_short_series(?array $series): bool
{
    return $series === null || count($series) < WINDOW_SIZE;
}

function report_failure(string $path, ?array $series): void
{
    if ($series === null) {
        report_read_error($path);
    }
    if ($series !== null && count($series) < WINDOW_SIZE) {
        report_window_error();
    }
}

function main(array $argv): int
{
    $path = read_path($argv);
    $series = read_series($path);
    report_failure($path, $series);
    print_report($series);

    return is_short_series($series) ? 1 : 0;
}

function print_report(?array $series): void
{
    if (!is_short_series($series)) {
        $values = series_values($series);
        print_series($series, moving_average($values, WINDOW_SIZE), find_outliers($values, Z_THRESHOLD));
    }
}

exit(main($argv));
