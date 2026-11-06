<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const INN_PATTERN = '/^(\d{10}|\d{12})$/';
const DATE_PATTERN = '/^\d{4}-\d{2}-\d{2}$/';
const EXIT_VIOLATIONS = 1;
const HEADER_COLUMNS = ['СТР.', 'КОЛОНКА', 'ПРАВИЛО', 'ОПИСАНИЕ'];

function file_is_readable(string $path): bool
{
    return is_file($path) && is_readable($path);
}

function normalize_row(array $row, array $header): array
{
    $padded = array_pad($row, count($header), '');

    return array_combine($header, array_slice($padded, 0, count($header)));
}

function read_stream_rows($handle, array $header): array
{
    $row = fgetcsv($handle, 0, CSV_DELIMITER);
    $rows = [];
    while ($row !== false) {
        $rows[] = normalize_row($row, $header);
        $row = fgetcsv($handle, 0, CSV_DELIMITER);
    }

    return $rows;
}

function build_table($handle, array $header): array
{
    $rows = read_stream_rows($handle, $header);
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

function read_csv(string $path): ?array
{
    $table = open_csv($path, file_is_readable($path));

    return $table === [] ? null : $table;
}

function check_not_null(string $value, array $params): ?string
{
    return $value === '' ? 'значение пустое' : null;
}

function to_float(string $value): float
{
    return (float) str_replace(',', '.', $value);
}

function is_number_value(string $value): bool
{
    return $value !== '' && is_numeric(str_replace(',', '.', $value));
}

function check_positive_number(string $value, array $params): ?string
{
    $isNumber = is_number_value($value);
    $error = $isNumber ? '' : 'значение не является числом';
    if ($isNumber && to_float($value) < to_float((string) ($params['min'] ?? 0))) {
        $error = 'значение ниже допустимого минимума';
    }

    return $error === '' ? null : $error;
}

function check_format(string $value, array $params): ?string
{
    $ok = $value !== '' && preg_match($params['pattern'], $value) === 1;
    $error = $value === '' ? 'значение пустое' : 'значение не соответствует формату';

    return $ok ? null : $error;
}

function check_allowed_values(string $value, array $params): ?string
{
    return in_array($value, $params['values'], true) ? null : 'значение вне справочника';
}

function is_date_shape(string $value): bool
{
    return preg_match(DATE_PATTERN, $value) === 1;
}

function check_not_future_date(string $value, array $params): ?string
{
    $ok = is_date_shape($value) && $value <= date('Y-m-d');
    $error = is_date_shape($value) ? 'дата в будущем' : 'значение не является датой';

    return $ok ? null : $error;
}

function apply_rule(string $rule, string $value, array $params): ?string
{
    $message = $rule === 'not_null' ? check_not_null($value, $params) : null;
    $message = $rule === 'positive_number' ? check_positive_number($value, $params) : $message;
    $message = $rule === 'format' ? check_format($value, $params) : $message;
    $message = $rule === 'allowed_values' ? check_allowed_values($value, $params) : $message;
    $message = $rule === 'not_future_date' ? check_not_future_date($value, $params) : $message;

    return $message;
}

function make_violation(int $row, string $column, string $rule, string $message): array
{
    return ['row' => $row, 'column' => $column, 'rule' => $rule, 'message' => $message];
}

function duplicate_message(string $value, int $firstRow): string
{
    return "дубль значения {$value}, впервые встретилось в строке {$firstRow}";
}

function check_unique(array $rows, string $column): array
{
    $state = ['seen' => [], 'violations' => []];
    foreach ($rows as $number => $row) {
        $state = visit_cell($state, (string) ($row[$column] ?? ''), $number + 2, $column);
    }

    return $state['violations'];
}

function visit_cell(array $state, string $value, int $lineNumber, string $column): array
{
    $found = isset($state['seen'][$value]) ? [make_violation($lineNumber, $column, 'unique', duplicate_message($value, $state['seen'][$value]))] : [];

    return ['seen' => remember_value($state['seen'], $value, $lineNumber), 'violations' => array_merge($state['violations'], $found)];
}

function remember_value(array $seen, string $value, int $lineNumber): array
{
    return isset($seen[$value]) ? $seen : $seen + [$value => $lineNumber];
}

function check_rule(array $row, array $rule, int $lineNumber): array
{
    $value = (string) ($row[$rule['column']] ?? '');
    $message = apply_rule($rule['rule'], $value, $rule['params'] ?? []);

    return $message === null ? [] : [make_violation($lineNumber, $rule['column'], $rule['rule'], $message)];
}

function check_row(array $row, array $rules, int $lineNumber): array
{
    return array_merge([], ...array_map(static fn (array $rule): array => check_rule($row, $rule, $lineNumber), $rules));
}

function collect_row_violations(array $rows, array $rules, int $index, array $violations): array
{
    while ($index < count($rows)) {
        $violations = array_merge($violations, check_row($rows[$index], $rules, $index + 2));
        $index += 1;
    }

    return $violations;
}

function collect_unique_violations(array $rows, array $columns, int $index, array $violations): array
{
    while ($index < count($columns)) {
        $violations = array_merge($violations, check_unique($rows, $columns[$index]));
        $index += 1;
    }

    return $violations;
}

function run_checks(array $rows, array $rules, array $uniqueColumns): array
{
    $rowViolations = collect_row_violations($rows, $rules, 0, []);
    $uniqueViolations = collect_unique_violations($rows, $uniqueColumns, 0, []);

    return array_merge($rowViolations, $uniqueViolations);
}

function build_rules(): array
{
    return array_merge(rule_table(), date_rule());
}

function rule_table(): array
{
    $rows = [base_rule(), inn_rule(), balance_rule()];

    return array_merge($rows, status_rule());
}

function base_rule(): array
{
    return ['column' => 'client_id', 'rule' => 'not_null'];
}

function inn_rule(): array
{
    return ['column' => 'inn', 'rule' => 'format', 'params' => ['pattern' => INN_PATTERN]];
}

function balance_rule(): array
{
    return ['column' => 'balance_rub', 'rule' => 'positive_number', 'params' => ['min' => 0]];
}

function status_rule(): array
{
    return [['column' => 'status', 'rule' => 'allowed_values', 'params' => ['values' => ['active', 'blocked', 'closed']]]];
}

function date_rule(): array
{
    return [['column' => 'open_date', 'rule' => 'not_future_date']];
}

function print_checked(int $count): void
{
    printf("Проверено строк: %d%s", $count, PHP_EOL);
}

function print_violation_count(int $count): void
{
    printf("Нарушений: %d%s%s", $count, PHP_EOL, PHP_EOL);
}

function print_all_passed(): void
{
    printf("Все проверки пройдены.%s", PHP_EOL);
}

function print_table_head(): void
{
    printf("%-6s %-12s %-16s %s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 78), PHP_EOL);
}

function print_violation(array $violation): void
{
    printf("%-6d %-12s %-16s %s%s", $violation['row'], $violation['column'], $violation['rule'], $violation['message'], PHP_EOL);
}

function print_violation_rows(array $violations): void
{
    foreach ($violations as $violation) {
        print_violation($violation);
    }
}

function print_violation_table(array $violations): void
{
    print_table_head();
    print_separator();
    print_violation_rows($violations);
}

function print_violations(array $violations, int $rowCount): void
{
    print_checked($rowCount);
    print_violation_count(count($violations));
    if ($violations === []) {
        print_all_passed();
    }
    if ($violations !== []) {
        print_violation_table($violations);
    }
}

function read_path(array $argv): string
{
    return $argv[1] ?? __DIR__ . '/../../data/clients.csv';
}

function report_read_error(string $path): void
{
    fwrite(STDERR, 'Ошибка: не удалось прочитать файл ' . $path . PHP_EOL);
}

function is_empty_table(?array $table): bool
{
    return $table === null || $table['rows'] === [];
}

function table_exit_code(?array $table, array $violations): int
{
    $code = 0;
    if (is_empty_table($table)) {
        $code = 2;
    }
    if (!is_empty_table($table) && $violations !== []) {
        $code = EXIT_VIOLATIONS;
    }

    return $code;
}

function main(array $argv): int
{
    $path = read_path($argv);
    $table = read_csv($path);
    $violations = is_empty_table($table) ? [] : run_checks($table['rows'], build_rules(), ['client_id']);
    report_state($path, $table, $violations);

    return table_exit_code($table, $violations);
}

function report_state(string $path, ?array $table, array $violations): void
{
    if (is_empty_table($table)) {
        report_read_error($path);
    }
    if (!is_empty_table($table)) {
        print_violations($violations, count($table['rows']));
    }
}

exit(main($argv));
