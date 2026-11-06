<?php

declare(strict_types=1);

const PRECEDENCE = ['+' => 1, '-' => 1, '*' => 2, '/' => 2];

function tokenize(string $expression): array
{
    preg_match_all('/\d+[.,]?\d*|[+\-*\/()]/u', str_replace(' ', '', $expression), $matches);

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
    return $top !== '(' && is_operator($top) && PRECEDENCE[$top] >= PRECEDENCE[$operator];
}

function to_rpn(array $tokens): array
{
    $output = [];
    $stack = [];

    foreach ($tokens as $token) {
        if (is_number($token)) {
            $output[] = $token;
        } elseif ($token === '(') {
            $stack[] = $token;
        } elseif ($token === ')') {
            while ($stack !== [] && end($stack) !== '(') {
                $output[] = array_pop($stack);
            }
            if ($stack === []) {
                throw new RuntimeException('несбалансированные скобки');
            }
            array_pop($stack);
        } elseif (is_operator($token)) {
            while ($stack !== [] && should_pop_before($token, (string) end($stack))) {
                $output[] = array_pop($stack);
            }
            $stack[] = $token;
        } else {
            throw new RuntimeException("неизвестный токен: {$token}");
        }
    }

    while ($stack !== []) {
        $top = array_pop($stack);
        if ($top === '(') {
            throw new RuntimeException('несбалансированные скобки');
        }
        $output[] = $top;
    }

    return $output;
}

function apply_operator(string $operator, float $left, float $right): float
{
    if ($operator === '+') {
        return $left + $right;
    }
    if ($operator === '-') {
        return $left - $right;
    }
    if ($operator === '*') {
        return $left * $right;
    }
    if ($right == 0.0) {
        throw new RuntimeException('деление на ноль');
    }

    return $left / $right;
}

function evaluate_rpn(array $rpn): float
{
    $stack = [];

    foreach ($rpn as $token) {
        if (is_number($token)) {
            $stack[] = (float) str_replace(',', '.', $token);
            continue;
        }

        if (count($stack) < 2) {
            throw new RuntimeException('недостаточно операндов для оператора ' . $token);
        }

        $right = array_pop($stack);
        $left = array_pop($stack);
        $stack[] = apply_operator($token, $left, $right);
    }

    if (count($stack) !== 1) {
        throw new RuntimeException('выражение разобрано не полностью');
    }

    return $stack[0];
}

function print_result(string $expression, array $rpn, float $value): void
{
    printf("Выражение: %s%s", $expression, PHP_EOL);
    printf("ОПЗ: %s%s", implode(' ', $rpn), PHP_EOL);
    printf("Результат: %s%s", rtrim(rtrim(sprintf('%.6f', $value), '0'), '.'), PHP_EOL);
}

function main(array $argv): int
{
    $expression = $argv[1] ?? '(1240+8940)*2-1500/3';

    try {
        $rpn = to_rpn(tokenize($expression));
        if ($rpn === []) {
            throw new RuntimeException('пустое выражение');
        }
        $value = evaluate_rpn($rpn);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    print_result($expression, $rpn, $value);

    return 0;
}

exit(main($argv));
