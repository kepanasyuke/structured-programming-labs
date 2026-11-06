<?php

declare(strict_types=1);

const CSV_DELIMITER = ';';
const INN_PATTERN = '/^(\d{10}|\d{12})$/';
const EXIT_VIOLATIONS = 1;

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
        if (count($row) < count($header)) {
            $row = array_pad($row, count($header), '');
        }
        $rows[] = array_combine($header, array_slice($row, 0, count($header)));
    }
    fclose($handle);

    return ['header' => $header, 'rows' => $rows];
}

function inn_checksum_valid(string $inn): bool
{
    if (preg_match(INN_PATTERN, $inn) !== 1) {
        return false;
    }

    $digits = array_map('intval', str_split($inn));

    if (strlen($inn) === 10) {
        $weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
        $control = 0;
        for ($i = 0; $i < 9; $i++) {
            $control += $weights[$i] * $digits[$i];
        }

        return $control % 11 % 10 === $digits[9];
    }

    $weights11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    $weights12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    $sum11 = 0;
    $sum12 = 0;
    for ($i = 0; $i < 10; $i++) {
        $sum11 += $weights11[$i] * $digits[$i];
    }
    for ($i = 0; $i < 11; $i++) {
        $sum12 += $weights12[$i] * $digits[$i];
    }

    return $sum11 % 11 % 10 === $digits[10] && $sum12 % 11 % 10 === $digits[11];
}

function check_not_null(string $value, array $params): ?string
{
    return $value === '' ? 'значение пустое' : null;
}

function check_positive_number(string $value, array $params): ?string
{
    $normalized = str_replace(',', '.', $value);
    if ($value === '' || !is_numeric($normalized)) {
        return 'значение не является числом';
    }

    return (float) $normalized >= (float) ($params['min'] ?? 0) ? null : 'значение ниже допустимого минимума';
}

function check_format(string $value, array $params): ?string
{
    if ($value === '') {
        return 'значение пустое';
    }

    return preg_match($params['pattern'], $value) === 1 ? null : 'значение не соответствует формату';
}

function check_allowed_values(string $value, array $params): ?string
{
    return in_array($value, $params['values'], true) ? null : 'значение вне справочника';
}

function check_not_future_date(string $value, array $params): ?string
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return 'значение не является датой';
    }

    return $value <= date('Y-m-d') ? null : 'дата в будущем';
}

function apply_rule(string $rule, string $value, array $params): ?string
{
    switch ($rule) {
        case 'not_null':
            return check_not_null($value, $params);
        case 'positive_number':
            return check_positive_number($value, $params);
        case 'format':
            return check_format($value, $params);
        case 'allowed_values':
            return check_allowed_values($value, $params);
        case 'not_future_date':
            return check_not_future_date($value, $params);
        default:
            throw new RuntimeException("неизвестное правило: {$rule}");
    }
}

function check_unique(array $rows, string $column): array
{
    $seen = [];
    $violations = [];
    foreach ($rows as $number => $row) {
        $value = (string) ($row[$column] ?? '');
        if (isset($seen[$value])) {
            $violations[] = ['row' => $number + 2, 'column' => $column, 'rule' => 'unique', 'message' => "дубль значения {$value}, впервые встретилось в строке {$seen[$value]}"];
        } else {
            $seen[$value] = $number + 2;
        }
    }

    return $violations;
}

function check_row(array $row, array $rules, int $lineNumber): array
{
    $violations = [];
    foreach ($rules as $rule) {
        $value = (string) ($row[$rule['column']] ?? '');
        $message = apply_rule($rule['rule'], $value, $rule['params'] ?? []);
        if ($message !== null) {
            $violations[] = ['row' => $lineNumber, 'column' => $rule['column'], 'rule' => $rule['rule'], 'message' => $message];
        }
    }

    return $violations;
}

function run_checks(array $rows, array $rules, array $uniqueColumns): array
{
    $violations = [];
    foreach ($rows as $index => $row) {
        foreach (check_row($row, $rules, $index + 2) as $violation) {
            $violations[] = $violation;
        }
    }

    foreach ($uniqueColumns as $column) {
        foreach (check_unique($rows, $column) as $violation) {
            $violations[] = $violation;
        }
    }

    return $violations;
}

function build_rules(): array
{
    return [
        ['column' => 'client_id', 'rule' => 'not_null'],
        ['column' => 'inn', 'rule' => 'format', 'params' => ['pattern' => INN_PATTERN]],
        ['column' => 'balance_rub', 'rule' => 'positive_number', 'params' => ['min' => 0]],
        ['column' => 'status', 'rule' => 'allowed_values', 'params' => ['values' => ['active', 'blocked', 'closed']]],
        ['column' => 'open_date', 'rule' => 'not_future_date'],
    ];
}

function print_violations(array $violations, int $rowCount): void
{
    printf("Проверено строк: %d%s", $rowCount, PHP_EOL);
    printf("Нарушений: %d%s%s", count($violations), PHP_EOL, PHP_EOL);

    if ($violations === []) {
        printf("Все проверки пройдены.%s", PHP_EOL);

        return;
    }

    printf("%-6s %-12s %-16s %s%s", 'СТР.', 'КОЛОНКА', 'ПРАВИЛО', 'ОПИСАНИЕ', PHP_EOL);
    printf("%s%s", str_repeat('-', 78), PHP_EOL);
    foreach ($violations as $violation) {
        printf(
            "%-6d %-12s %-16s %s%s",
            $violation['row'],
            $violation['column'],
            $violation['rule'],
            $violation['message'],
            PHP_EOL
        );
    }
}

function main(array $argv): int
{
    $path = $argv[1] ?? __DIR__ . '/../../data/clients.csv';

    try {
        $table = read_csv($path);
        $violations = run_checks($table['rows'], build_rules(), ['client_id']);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 2;
    }

    print_violations($violations, count($table['rows']));

    return $violations === [] ? 0 : EXIT_VIOLATIONS;
}

exit(main($argv));
