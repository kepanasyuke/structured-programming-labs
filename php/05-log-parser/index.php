<?php

declare(strict_types=1);

const FIELD_SEPARATOR = '|';
const TOP_SIZE = 5;
const PERCENTILES = [50, 95];

function read_lines(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("не удалось прочитать файл {$path}");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException("не удалось разобрать файл {$path}");
    }

    return $lines;
}

function parse_line(string $line): ?array
{
    $parts = array_map('trim', explode(FIELD_SEPARATOR, $line));
    if (count($parts) < 4) {
        return null;
    }

    $duration = (int) filter_var($parts[2], FILTER_SANITIZE_NUMBER_INT);
    $timestamp = strtotime($parts[0]);
    if ($timestamp === false) {
        return null;
    }

    return [
        'time' => date('Y-m-d H:i:s', $timestamp),
        'task' => $parts[1],
        'duration' => $duration,
        'status' => strtoupper($parts[3]),
    ];
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

function percentile(array $sortedValues, int $percent): float
{
    if ($sortedValues === []) {
        return 0.0;
    }

    $position = ($percent / 100) * (count($sortedValues) - 1);
    $lower = (int) floor($position);
    $upper = (int) ceil($position);
    if ($lower === $upper) {
        return (float) $sortedValues[$lower];
    }

    $weight = $position - $lower;

    return $sortedValues[$lower] * (1 - $weight) + $sortedValues[$upper] * $weight;
}

function summarize_task(string $task, array $durations, array $statuses): array
{
    sort($durations);
    $summary = [
        'task' => $task,
        'runs' => count($durations),
        'avg' => (int) round(array_sum($durations) / count($durations)),
        'max' => $durations[count($durations) - 1],
        'failures' => $statuses['FAIL'] ?? 0,
        'warnings' => $statuses['WARN'] ?? 0,
    ];

    foreach (PERCENTILES as $percent) {
        $summary['p' . $percent] = (int) round(percentile($durations, $percent));
    }

    return $summary;
}

function aggregate(array $records): array
{
    $grouped = [];
    foreach ($records as $record) {
        $task = $record['task'];
        $grouped[$task]['durations'][] = $record['duration'];
        $status = $record['status'];
        $grouped[$task]['statuses'][$status] = ($grouped[$task]['statuses'][$status] ?? 0) + 1;
    }

    $summaries = [];
    foreach ($grouped as $task => $data) {
        $summaries[] = summarize_task((string) $task, $data['durations'], $data['statuses']);
    }

    return $summaries;
}

function sort_by_p95(array $summaries): array
{
    $p95 = array_column($summaries, 'p95');
    $tasks = array_column($summaries, 'task');
    array_multisort($p95, SORT_DESC, SORT_NUMERIC, $tasks, SORT_ASC, $summaries);

    return $summaries;
}

function print_report(string $path, array $records, array $summaries): void
{
    printf("Лог: %s%s", $path, PHP_EOL);
    printf("Записей: %d, задач: %d%s%s", count($records), count($summaries), PHP_EOL, PHP_EOL);
    printf("%-22s %6s %8s %8s %8s %8s %6s%s", 'ЗАДАЧА', 'ЗАП.', 'СРЕДН.', 'P50', 'P95', 'MAX', 'FAIL', PHP_EOL);
    printf("%s%s", str_repeat('-', 78), PHP_EOL);

    $top = array_slice(sort_by_p95($summaries), 0, TOP_SIZE);
    foreach ($top as $summary) {
        printf(
            "%-22s %6d %8d %8d %8d %8d %6d%s",
            $summary['task'],
            $summary['runs'],
            $summary['avg'],
            $summary['p50'],
            $summary['p95'],
            $summary['max'],
            $summary['failures'],
            PHP_EOL
        );
    }
    printf("%s%s", PHP_EOL, 'Отсортировано по p95, показаны первые ' . TOP_SIZE . PHP_EOL);
}

function main(array $argv): int
{
    $path = $argv[1] ?? __DIR__ . '/../../data/queries.log';

    try {
        $records = parse_log(read_lines($path));
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    if ($records === []) {
        fwrite(STDERR, 'Ошибка: не удалось разобрать ни одной записи' . PHP_EOL);

        return 1;
    }

    print_report($path, $records, aggregate($records));

    return 0;
}

exit(main($argv));
