<?php

declare(strict_types=1);

const PRECEDENCE = ['+' => 1, '-' => 1, '*' => 2, '/' => 2];
const TOKEN_PATTERN = '/\d+[.,]?\d*|[+\-*\/()]/u';
const WHITESPACE = ' ';
const OPEN_BRACKET = '(';
const BRACKETS_ERROR = 'несбалансированные скобки';
const UNKNOWN_TOKEN_ERROR = 'неизвестный токен: ';
const ZERO_DIVISION_ERROR = 'деление на ноль';
const FEW_OPERANDS_ERROR = 'недостаточно операндов для оператора ';
const TRAILING_ERROR = 'выражение разобрано не полностью';
const EMPTY_ERROR = 'пустое выражение';

function tokenize(string $expression): array
{
    preg_match_all(TOKEN_PATTERN, str_replace(WHITESPACE, '', $expression), $matches);

    return $matches[0];
}

function is_operator(string $token): bool
{
    return isset(PRECEDENCE[$token]);
}

function is_number(string $token): bool
{
    return is_numeric(str_replace(',', '.', $token));
}

function should_pop_before(string $operator, string $top): bool
{
    return $top !== OPEN_BRACKET && is_operator($top) && PRECEDENCE[$top] >= PRECEDENCE[$operator];
}

function to_number(string $token): float
{
    return (float) str_replace(',', '.', $token);
}

function is_open_bracket(string $token): bool
{
    return $token === OPEN_BRACKET;
}

function is_close_bracket(string $token): bool
{
    return $token === ')';
}

function is_plain_token(string $token): bool
{
    return !is_number($token) && !is_open_bracket($token) && !is_close_bracket($token) && !is_operator($token);
}

function push_text(array $items, string $token): array
{
    $items[] = $token;

    return $items;
}

function pop_last(array $items): array
{
    array_pop($items);

    return $items;
}

function pop_top(array $stack, array $output): array
{
    return ['stack' => pop_last($stack), 'output' => push_text($output, (string) end($stack))];
}

function drain_until_bracket(array $stack, array $output): array
{
    $state = ['stack' => $stack, 'output' => $output];
    while ($state['stack'] !== [] && end($state['stack']) !== OPEN_BRACKET) {
        $state = pop_top($state['stack'], $state['output']);
    }

    return $state;
}

function close_bracket(array $stack, array $output): array
{
    $state = drain_until_bracket($stack, $output);
    $ok = $state['stack'] !== [];

    return ['stack' => $ok ? pop_last($state['stack']) : [], 'output' => $state['output'], 'error' => $ok ? '' : BRACKETS_ERROR];
}

function pop_by_precedence(array $stack, array $output, string $token): array
{
    $state = ['stack' => $stack, 'output' => $output];
    while ($state['stack'] !== [] && should_pop_before($token, (string) end($state['stack']))) {
        $state = pop_top($state['stack'], $state['output']);
    }

    return $state;
}

function push_operator(array $stack, array $output, string $token): array
{
    $state = pop_by_precedence($stack, $output, $token);

    return ['stack' => push_text($state['stack'], $token), 'output' => $state['output'], 'error' => ''];
}

function step_shunting(array $state, string $token): array
{
    $result = is_plain_token($token) ? ['stack' => $state['stack'], 'output' => $state['output'], 'error' => UNKNOWN_TOKEN_ERROR . $token] : $state;
    $result = route_token($result, $token);

    return $result;
}

function route_token(array $state, string $token): array
{
    return route_bracket(route_number($state, $token), $token);
}

function route_number(array $state, string $token): array
{
    $result = $state;
    if (is_number($token)) {
        $result['output'] = push_text($state['output'], $token);
    }
    if (is_operator($token)) {
        $result = push_operator($state['stack'], $state['output'], $token);
    }

    return $result;
}

function route_bracket(array $state, string $token): array
{
    $result = $state;
    if (is_open_bracket($token)) {
        $result['stack'] = push_text($state['stack'], $token);
    }
    if (is_close_bracket($token)) {
        $result = close_bracket($state['stack'], $state['output']);
    }

    return $result;
}

function scan_tokens(array $tokens, int $position, array $state): array
{
    while ($position < count($tokens) && $state['error'] === '') {
        $state = step_shunting($state, $tokens[$position]);
        $position += 1;
    }

    return $state;
}

function flush_stack(array $stack, array $output): array
{
    $state = ['stack' => $stack, 'output' => $output, 'error' => ''];
    while ($state['stack'] !== [] && $state['error'] === '') {
        $top = (string) end($state['stack']);
        $state = ['stack' => pop_last($state['stack']), 'output' => push_text($state['output'], $top), 'error' => $top === OPEN_BRACKET ? BRACKETS_ERROR : ''];
    }

    return $state;
}

function pick_error(array $first, array $second): string
{
    return $first['error'] !== '' ? $first['error'] : $second['error'];
}

function to_rpn(array $tokens): ?array
{
    $scanned = scan_tokens($tokens, 0, ['stack' => [], 'output' => [], 'error' => '']);
    $flushed = flush_stack($scanned['stack'], $scanned['output']);

    return pick_error($scanned, $flushed) === '' ? $flushed['output'] : null;
}

function apply_plus(float $left, float $right): float
{
    return $left + $right;
}

function apply_minus(float $left, float $right): float
{
    return $left - $right;
}

function apply_multiply(float $left, float $right): float
{
    return $left * $right;
}

function apply_divide(float $left, float $right): float
{
    return $left / $right;
}

function compute(string $operator, float $left, float $right): float
{
    $value = $operator === '-' ? apply_minus($left, $right) : apply_plus($left, $right);
    if ($operator === '*') {
        $value = apply_multiply($left, $right);
    }
    if ($operator === '/') {
        $value = apply_divide($left, $right);
    }

    return $value;
}

function is_zero_division(string $operator, float $divisor): bool
{
    return $operator === '/' && $divisor == 0.0;
}

function push_value(array $stack, float $value): array
{
    $stack[] = $value;

    return $stack;
}

function pop_two(array $stack): array
{
    $right = (float) end($stack);
    $left = (float) $stack[count($stack) - 2];

    return [pop_last(pop_last($stack)), $left, $right];
}

function has_operand(array $stack): bool
{
    return count($stack) >= 2;
}

function step_rpn(array $state, string $token): array
{
    $result = is_number($token) ? ['stack' => push_value($state['stack'], to_number($token)), 'error' => ''] : $state;
    $result = route_rpn($result, $token);

    return $result;
}

function route_rpn(array $state, string $token): array
{
    $result = $state;
    if (!is_number($token) && !has_operand($state['stack'])) {
        $result['error'] = FEW_OPERANDS_ERROR . $token;
    }
    if (!is_number($token) && has_operand($state['stack'])) {
        $result = apply_rpn_operator($state['stack'], $token);
    }

    return $result;
}

function apply_rpn_operator(array $stack, string $token): array
{
    [$rest, $left, $right] = pop_two($stack);
    $error = is_zero_division($token, $right) ? ZERO_DIVISION_ERROR : '';

    return ['stack' => $error === '' ? push_value($rest, compute($token, $left, $right)) : $stack, 'error' => $error];
}

function scan_rpn(array $rpn, int $position, array $state): array
{
    while ($position < count($rpn) && $state['error'] === '') {
        $state = step_rpn($state, (string) $rpn[$position]);
        $position += 1;
    }

    return $state;
}

function evaluate_rpn(array $rpn): ?float
{
    $state = scan_rpn($rpn, 0, ['stack' => [], 'error' => '']);
    $complete = $state['error'] === '' && count($state['stack']) === 1;

    return $complete ? (float) end($state['stack']) : null;
}

function format_number(float $value): string
{
    return rtrim(rtrim(sprintf('%.6f', $value), '0'), '.');
}

function print_expression(string $expression): void
{
    printf("Выражение: %s%s", $expression, PHP_EOL);
}

function print_rpn(array $rpn): void
{
    printf("ОПЗ: %s%s", implode(' ', $rpn), PHP_EOL);
}

function print_value(float $value): void
{
    printf("Результат: %s%s", format_number($value), PHP_EOL);
}

function print_result(string $expression, array $rpn, float $value): void
{
    print_expression($expression);
    print_rpn($rpn);
    print_value($value);
}

function read_expression(array $argv): string
{
    return $argv[1] ?? '(1240+8940)*2-1500/3';
}

function report_error(string $message): void
{
    fwrite(STDERR, 'Ошибка: ' . $message . PHP_EOL);
}

function is_empty_rpn(?array $rpn): bool
{
    return $rpn === [] || $rpn === null;
}

function solve_expression(string $expression): array
{
    $rpn = to_rpn(tokenize($expression));
    $value = is_empty_rpn($rpn) ? null : evaluate_rpn($rpn);

    return ['rpn' => $rpn ?? [], 'value' => $value, 'message' => describe_failure($rpn, $value)];
}

function describe_failure(?array $rpn, ?float $value): string
{
    $message = EMPTY_ERROR;
    if (!is_empty_rpn($rpn) && $value === null) {
        $message = TRAILING_ERROR;
    }

    return $message;
}

function main(array $argv): int
{
    $expression = read_expression($argv);
    $result = solve_expression($expression);
    report_failure($result['value'], $result['message']);
    report_result($expression, $result);

    return $result['value'] === null ? 1 : 0;
}

function report_failure(?float $value, string $message): void
{
    if ($value === null) {
        report_error($message);
    }
}

function report_result(string $expression, array $result): void
{
    if ($result['value'] !== null) {
        print_result($expression, $result['rpn'], $result['value']);
    }
}

exit(main($argv));
