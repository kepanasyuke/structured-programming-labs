<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const DATE_PATTERN = '/^\d{4}-\d{2}-\d{2}$/';
const INT_PATTERN = '/^-?\d+$/';
const FLOAT_PATTERN = '/^-?\d+[.,]\d+$/';
const MAX_SAMPLE_VALUES = 3;
const HEADER_COLUMNS = ['КОЛОНКА', 'ТИП', 'ПУСТО', 'ДОЛЯ', 'УНИК.', 'MIN', 'MAX'];
const COLUMN_ROW_FORMAT = "%s%-14s %-8s %6d %8s %8d %-12s %-12s%s";
const REASON_NONE = '';
const REASON_READ = 'read';
const REASON_HEADER = 'header';
const REASON_ROWS = 'rows';

function file_is_readable(string $path): bool
{
    return is_file($path) && is_readable($path);
}

function is_blank_row(array $row): bool
{
    return $row === [] || $row === [null];
}

function keep_row(array $row): array
{
    return is_blank_row($row) ? [] : [$row];
}

function append_row(array $rows, array $row): array
{
    return array_merge($rows, keep_row($row));
}

function read_stream_rows($handle): array
{
    $row = fgetcsv($handle, 0, CSV_DELIMITER);
    $rows = [];
    while ($row !== false) {
        $rows = append_row($rows, $row);
        $row = fgetcsv($handle, 0, CSV_DELIMITER);
    }

    return $rows;
}

function build_table($handle, array $header): array
{
    $rows = read_stream_rows($handle);
    fclose($handle);

    return ['header' => $header, 'rows' => $rows];
}

function open_csv(string $path, bool $readable): array
{
    $handle = $readable ? fopen($path, 'rb') : false;
    $header = $handle === false ? false : fgetcsv($handle, 0, CSV_DELIMITER);
    $table = [];
    if ($header !== false) {
        $table = build_table($handle, $header);
    }

    return $table;
}

function read_csv(string $path): array
{
    $readable = file_is_readable($path);
    $table = open_csv($path, $readable);

    return ['table' => $table, 'reason' => table_reason($readable, $table)];
}

function table_reason(bool $readable, array $table): string
{
    $headerMissing = $table === [];
    $rowsMissing = !$headerMissing && $table['rows'] === [];

    return $readable ? ($headerMissing ? REASON_HEADER : ($rowsMissing ? REASON_ROWS : REASON_NONE)) : REASON_READ;
}

function error_messages(): array
{
    return [
        REASON_READ => 'Ошибка: не удалось прочитать файл ',
        REASON_HEADER => 'Ошибка: в файле нет строки заголовка',
        REASON_ROWS => 'Ошибка: в файле нет строк с данными',
    ];
}

function error_suffix(string $reason, string $path): string
{
    return $reason === REASON_READ ? $path : '';
}

function error_text(string $reason, string $path): string
{
    $messages = error_messages();

    return isset($messages[$reason]) ? $messages[$reason] . error_suffix($reason, $path) . PHP_EOL : '';
}

function column_values(array $rows, int $index): array
{
    return array_map(static fn (array $row): string => trim((string) ($row[$index] ?? '')), $rows);
}

function is_int_value(string $value): bool
{
    return preg_match(INT_PATTERN, $value) === 1;
}

function is_float_value(string $value): bool
{
    return preg_match(FLOAT_PATTERN, $value) === 1;
}

function is_calendar_date(string $value): bool
{
    [$year, $month, $day] = array_map('intval', explode('-', $value));

    return checkdate($month, $day, $year);
}

function is_date_value(string $value): bool
{
    return preg_match(DATE_PATTERN, $value) === 1 && is_calendar_date($value);
}

function is_filled(string $value): bool
{
    return $value !== '';
}

function filled_values(array $values): array
{
    return array_values(array_filter($values, 'is_filled'));
}

function is_all_int(array $values): bool
{
    return count(array_filter($values, 'is_int_value')) === count($values);
}

function is_numeric_value(string $value): bool
{
    return is_int_value($value) || is_float_value($value);
}

function is_all_numeric(array $values): bool
{
    return count(array_filter($values, 'is_numeric_value')) === count($values);
}

function is_all_date(array $values): bool
{
    return count(array_filter($values, 'is_date_value')) === count($values);
}

function detect_type(array $values): string
{
    $filled = filled_values($values);

    return $filled === [] ? 'empty' : pick_type($filled);
}

function pick_type(array $filled): string
{
    $type = numeric_type($filled);
    $type = is_date_kind($type, $filled) ? 'date' : $type;

    return $type;
}

function numeric_type(array $filled): string
{
    return is_all_int($filled) ? 'int' : 'float';
}

function is_date_kind(string $type, array $filled): bool
{
    return $type === 'string' && !is_all_numeric($filled) && is_all_date($filled);
}

function is_numeric_type(string $type): bool
{
    return $type === 'int' || $type === 'float';
}

function cast_value(string $value): float
{
    return (float) str_replace(',', '.', $value);
}

function numeric_range(array $filled): array
{
    $numbers = array_map('cast_value', $filled);

    return ['min' => (string) min($numbers), 'max' => (string) max($numbers)];
}

function date_range(array $filled): array
{
    $sorted = sorted_copy($filled);

    return $sorted === [] ? ['min' => '', 'max' => ''] : ['min' => $sorted[0], 'max' => $sorted[count($sorted) - 1]];
}

function sorted_copy(array $values): array
{
    sort($values);

    return $values;
}

function profile_range(string $type, array $filled): array
{
    $range = ['min' => '', 'max' => ''];
    if (is_numeric_type($type)) {
        $range = numeric_range($filled);
    }
    if ($type === 'date') {
        $range = date_range($filled);
    }

    return $range;
}

function sample_values(array $filled): string
{
    return implode(', ', array_slice(array_unique($filled), 0, MAX_SAMPLE_VALUES));
}

function count_filled(array $values): int
{
    return count(filled_values($values));
}

function count_empty(array $values): int
{
    return count($values) - count_filled($values);
}

function count_unique(array $values): int
{
    return count(array_unique(filled_values($values)));
}

function profile_head(string $name, array $values): array
{
    $head = ['column' => $name, 'type' => detect_type($values), 'rows' => count($values)];

    return add_counts($head, $values);
}

function add_counts(array $head, array $values): array
{
    return $head + ['empty' => count_empty($values), 'unique' => count_unique($values)];
}

function add_range(array $row, array $range): array
{
    return $row + ['min' => $range['min'], 'max' => $range['max']];
}

function add_sample(array $row, array $filled): array
{
    return $row + ['sample' => sample_values($filled)];
}

function profile_column(string $name, array $values): array
{
    $filled = filled_values($values);
    $row = add_range(profile_head($name, $values), profile_range(detect_type($values), $filled));

    return add_sample($row, $filled);
}

function build_column(array $table, int $index, string $name): array
{
    return profile_column($name, column_values($table['rows'], $index));
}

function build_columns(array $table, int $position, array $profiles): array
{
    $names = array_keys($table['header']);
    while ($position < count($names)) {
        $profiles[] = build_column($table, $names[$position], (string) $table['header'][$names[$position]]);
        $position += 1;
    }

    return $profiles;
}

function build_profile(array $table): array
{
    return build_columns($table, 0, []);
}

function empty_share(array $profile): string
{
    return $profile['rows'] === 0 ? '0%' : sprintf('%.1f%%', 100.0 * $profile['empty'] / $profile['rows']);
}

function print_line(string $format, mixed ...$arguments): void
{
    printf($format, ...$arguments);
}

function print_title(string $path): void
{
    print_line("Профиль файла: %s%s", $path, PHP_EOL);
}

function print_column_count(int $count): void
{
    print_line("Колонок: %d%s%s", $count, PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-14s %-8s %6s %8s %8s %-12s %-12s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_profile_row(array $profile): void
{
    $cells = [$profile['column'], $profile['type'], $profile['empty'], empty_share($profile), $profile['unique'], $profile['min'], $profile['max'], PHP_EOL];
    printf(COLUMN_ROW_FORMAT, PHP_EOL, ...$cells);
}

function print_sample(array $profile): void
{
    print_line("  примеры: %s%s", $profile['sample'], PHP_EOL);
}

function print_stats(array $profile): void
{
    print_profile_row($profile);
    print_sample($profile);
}

function print_profiles(array $profiles): void
{
    foreach ($profiles as $profile) {
        print_stats($profile);
    }
}

function print_profile(string $path, array $profiles): void
{
    print_title($path);
    print_column_count(count($profiles));
    print_table_head();
    print_profiles($profiles);
}

function read_path(array $argv): string
{
    return $argv[1] ?? __DIR__ . '/../../data/clients.csv';
}

function report_state(string $path, array $result): void
{
    fwrite(STDERR, error_text($result['reason'], $path));
}

function print_table(string $path, array $table): void
{
    if ($table !== [] && $table['rows'] !== []) {
        print_profile($path, build_profile($table));
    }
}

function is_failure(string $reason): bool
{
    return $reason !== REASON_NONE;
}

function main(array $argv): int
{
    $path = read_path($argv);
    $result = read_csv($path);
    report_state($path, $result);
    print_table($path, $result['table']);

    return is_failure($result['reason']) ? 1 : 0;
}

exit(main($argv));
