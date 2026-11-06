<?php

declare(strict_types=1);

const FIELD_SEPARATOR = '|';
const TOP_SIZE = 5;
const PERCENTILES = [50, 95];
const HEADER_COLUMNS = ['ЗАДАЧА', 'ЗАП.', 'СРЕДН.', 'P50', 'P95', 'MAX', 'FAIL'];
const STATUS_FAIL = 'FAIL';
const STATUS_WARN = 'WARN';

function read_lines(string $path): ?array
{
    $lines = is_file($path) && is_readable($path) ? file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : false;

    return $lines === false ? null : $lines;
}

function split_fields(string $line): array
{
    return array_map('trim', explode(FIELD_SEPARATOR, $line));
}

function has_fields(array $parts): bool
{
    return count($parts) >= 4;
}

function parse_duration(string $field): int
{
    return (int) filter_var($field, FILTER_SANITIZE_NUMBER_INT);
}

function format_time(string $field): ?string
{
    $timestamp = strtotime($field);
    $formatted = $timestamp === false ? null : date('Y-m-d H:i:s', $timestamp);

    return $formatted;
}

function build_record(array $parts, string $time): array
{
    return [
        'time' => $time,
        'task' => $parts[1],
        'duration' => parse_duration($parts[2]),
        'status' => strtoupper($parts[3]),
    ];
}

function parse_line(string $line): ?array
{
    $parts = split_fields($line);
    $time = has_fields($parts) ? format_time($parts[0]) : null;

    return $time === null ? null : build_record($parts, $time);
}

function parse_log(array $lines): array
{
    $records = [];
    foreach ($lines as $line) {
        $record = parse_line($line);
        if ($record !== null) {
            $records[] = $record;
        }
    }

    return $records;
}

function is_empty_series(array $sortedValues): bool
{
    return $sortedValues === [];
}

function percentile_position(array $sortedValues, int $percent): float
{
    return ($percent / 100) * (count($sortedValues) - 1);
}

function is_same_index(float $position): bool
{
    return (int) floor($position) === (int) ceil($position);
}

function cubic_value(array $sortedValues, float $position): float
{
    $lower = (int) floor($position);
    $upper = (int) ceil($position);
    $weight = $position - $lower;

    return $sortedValues[$lower] * (1 - $weight) + $sortedValues[$upper] * $weight;
}

function percentile(array $sortedValues, int $percent): float
{
    $position = percentile_position($sortedValues, $percent);
    $value = is_empty_series($sortedValues) ? 0.0 : cubic_value($sortedValues, $position);
    if (!is_empty_series($sortedValues) && is_same_index($position)) {
        $value = (float) $sortedValues[(int) floor($position)];
    }

    return $value;
}

function average_duration(array $durations): int
{
    return (int) round(array_sum($durations) / count($durations));
}

function last_value(array $durations): int
{
    return $durations[count($durations) - 1];
}

function status_count(array $statuses, string $status): int
{
    return $statuses[$status] ?? 0;
}

function add_percentiles(array $summary, array $durations, int $index): array
{
    $summary['p' . PERCENTILES[$index]] = (int) round(percentile($durations, PERCENTILES[$index]));

    return $summary;
}

function summarize_task(string $task, array $durations, array $statuses): array
{
    sort($durations);
    $summary = base_summary($task, $durations, $statuses);
    foreach (PERCENTILES as $index => $percent) {
        $summary = add_percentiles($summary, $durations, $index);
    }

    return $summary;
}

function base_summary(string $task, array $durations, array $statuses): array
{
    $head = ['task' => $task, 'runs' => count($durations), 'avg' => average_duration($durations), 'max' => last_value($durations)];

    return add_status_book($head, $statuses);
}

function add_status_book(array $summary, array $statuses): array
{
    return $summary + ['failures' => status_count($statuses, STATUS_FAIL), 'warnings' => status_count($statuses, STATUS_WARN)];
}

function append_record(array $grouped, array $record): array
{
    $task = $record['task'];
    $status = $record['status'];
    $grouped[$task]['durations'][] = $record['duration'];
    $grouped[$task]['statuses'][$status] = ($grouped[$task]['statuses'][$status] ?? 0) + 1;

    return $grouped;
}

function group_records(array $records): array
{
    $grouped = [];
    foreach ($records as $record) {
        $grouped = append_record($grouped, $record);
    }

    return $grouped;
}

function task_keys(array $grouped): array
{
    return array_keys($grouped);
}

function summarize_all(array $grouped, array $tasks, int $index, array $summaries): array
{
    $result = $summaries;
    while ($index < count($tasks)) {
        $task = $tasks[$index];
        $result[] = summarize_task((string) $task, $grouped[$task]['durations'], $grouped[$task]['statuses']);
        $index += 1;
    }

    return $result;
}

function aggregate(array $records): array
{
    $grouped = group_records($records);

    return summarize_all($grouped, task_keys($grouped), 0, []);
}

function sort_by_p95(array $summaries): array
{
    $p95 = array_column($summaries, 'p95');
    $tasks = array_column($summaries, 'task');
    array_multisort($p95, SORT_DESC, SORT_NUMERIC, $tasks, SORT_ASC, $summaries);

    return $summaries;
}

function print_log_line(string $path): void
{
    printf("Лог: %s%s", $path, PHP_EOL);
}

function print_counts(array $records, array $summaries): void
{
    printf("Записей: %d, задач: %d%s%s", count($records), count($summaries), PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-22s %6s %8s %8s %8s %8s %6s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 78), PHP_EOL);
}

function print_summary(array $summary): void
{
    $cells = [$summary['task'], $summary['runs'], $summary['avg'], $summary['p50'], $summary['p95'], $summary['max'], $summary['failures'], PHP_EOL];
    printf("%-22s %6d %8d %8d %8d %8d %6d%s", ...$cells);
}

function print_summaries(array $summaries): void
{
    foreach ($summaries as $summary) {
        print_summary($summary);
    }
}

function print_footer(): void
{
    printf("%s%s", PHP_EOL, 'Отсортировано по p95, показаны первые ' . TOP_SIZE . PHP_EOL);
}

function print_report(string $path, array $records, array $summaries): void
{
    print_log_line($path);
    print_counts($records, $summaries);
    print_table_head();
    print_separator();
    print_summaries(array_slice(sort_by_p95($summaries), 0, TOP_SIZE));
    print_footer();
}

function read_path(array $argv): string
{
    return $argv[1] ?? __DIR__ . '/../../data/queries.log';
}

function parse_file(string $path): array
{
    $lines = read_lines($path);
    $records = $lines === null ? [] : parse_log($lines);

    return ['lines' => $lines, 'records' => $records];
}

function report_failure(string $path, array $parsed): void
{
    if (is_failed_parse($parsed)) {
        fwrite(STDERR, failure_message($path, $parsed['lines']));
    }
}

function failure_message(string $path, ?array $lines): string
{
    return ($lines === null ? 'Ошибка: не удалось прочитать файл ' . $path : 'Ошибка: не удалось разобрать ни одной записи') . PHP_EOL;
}

function is_failed_parse(array $parsed): bool
{
    return $parsed['lines'] === null || $parsed['records'] === [];
}

function main(array $argv): int
{
    $path = read_path($argv);
    $parsed = parse_file($path);
    report_failure($path, $parsed);
    if (!is_failed_parse($parsed)) {
        print_report($path, $parsed['records'], aggregate($parsed['records']));
    }

    return is_failed_parse($parsed) ? 1 : 0;
}

exit(main($argv));
