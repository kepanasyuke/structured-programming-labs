<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const DATE_PATTERN = '/^\d{4}-\d{2}-\d{2}$/';
const MAX_SAMPLE_VALUES = 3;

function read_csv(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("не удалось прочитать файл {$path}");
    }

    $handle = fopen($path, 'rb');
    if ($handle === false) {
        throw new RuntimeException("не удалось открыть файл {$path}");
    }

    $header = fgetcsv($handle, 0, CSV_DELIMITER);
    if ($header === false) {
        fclose($handle);
        throw new RuntimeException('в файле нет строки заголовка');
    }

    $rows = [];
    while (($row = fgetcsv($handle, 0, CSV_DELIMITER)) !== false) {
        if ($row === [null] || $row === []) {
            continue;
        }
        $rows[] = $row;
    }
    fclose($handle);

    return ['header' => $header, 'rows' => $rows];
}

function column_values(array $rows, int $index): array
{
    $values = [];
    foreach ($rows as $row) {
        $values[] = trim((string) ($row[$index] ?? ''));
    }

    return $values;
}

function is_int_value(string $value): bool
{
    return preg_match('/^-?\d+$/', $value) === 1;
}

function is_float_value(string $value): bool
{
    return preg_match('/^-?\d+[.,]\d+$/', $value) === 1;
}

function is_date_value(string $value): bool
{
    if (preg_match(DATE_PATTERN, $value) !== 1) {
        return false;
    }
    [$year, $month, $day] = array_map('intval', explode('-', $value));

    return checkdate($month, $day, $year);
}

function detect_type(array $values): string
{
    $filled = array_values(array_filter($values, static fn (string $v): bool => $v !== ''));
    if ($filled === []) {
        return 'empty';
    }

    $ints = count(array_filter($filled, 'is_int_value'));
    if ($ints === count($filled)) {
        return 'int';
    }

    $numeric = count(array_filter($filled, static fn (string $v): bool => is_int_value($v) || is_float_value($v)));
    if ($numeric === count($filled)) {
        return 'float';
    }

    $dates = count(array_filter($filled, 'is_date_value'));

    return $dates === count($filled) ? 'date' : 'string';
}

function profile_column(string $name, array $values): array
{
    $filled = array_values(array_filter($values, static fn (string $v): bool => $v !== ''));
    $type = detect_type($values);
    $profile = [
        'column' => $name,
        'type' => $type,
        'rows' => count($values),
        'empty' => count($values) - count($filled),
        'unique' => count(array_unique($filled)),
        'min' => '',
        'max' => '',
        'sample' => '',
    ];

    if ($type === 'int' || $type === 'float') {
        $numbers = array_map(static fn (string $v): float => (float) str_replace(',', '.', $v), $filled);
        $profile['min'] = (string) min($numbers);
        $profile['max'] = (string) max($numbers);
    } elseif ($type === 'date') {
        sort($filled);
        $profile['min'] = $filled[0];
        $profile['max'] = $filled[count($filled) - 1];
    }

    $profile['sample'] = implode(', ', array_slice(array_unique($filled), 0, MAX_SAMPLE_VALUES));

    return $profile;
}

function build_profile(array $table): array
{
    $profiles = [];
    foreach ($table['header'] as $index => $name) {
        $profiles[] = profile_column((string) $name, column_values($table['rows'], $index));
    }

    return $profiles;
}

function empty_share(array $profile): string
{
    if ($profile['rows'] === 0) {
        return '0%';
    }

    return sprintf('%.1f%%', 100.0 * $profile['empty'] / $profile['rows']);
}

function print_profile(string $path, array $profiles): void
{
    printf("Профиль файла: %s%s", $path, PHP_EOL);
    printf("Колонок: %d%s%s", count($profiles), PHP_EOL, PHP_EOL);
    printf(
        "%-14s %-8s %6s %8s %8s %-12s %-12s%s",
        'КОЛОНКА',
        'ТИП',
        'ПУСТО',
        'ДОЛЯ',
        'УНИК.',
        'MIN',
        'MAX',
        PHP_EOL
    );

    foreach ($profiles as $profile) {
        printf(
            "%s%-14s %-8s %6d %8s %8d %-12s %-12s%s",
            PHP_EOL,
            $profile['column'],
            $profile['type'],
            $profile['empty'],
            empty_share($profile),
            $profile['unique'],
            $profile['min'],
            $profile['max'],
            PHP_EOL
        );
        printf("  примеры: %s%s", $profile['sample'], PHP_EOL);
    }
}

function main(array $argv): int
{
    $path = $argv[1] ?? __DIR__ . '/../../data/clients.csv';

    try {
        $table = read_csv($path);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    if ($table['rows'] === []) {
        fwrite(STDERR, 'Ошибка: в файле нет строк с данными' . PHP_EOL);

        return 1;
    }

    print_profile($path, build_profile($table));

    return 0;
}

exit(main($argv));
