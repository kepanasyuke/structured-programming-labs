<?php

declare(strict_types=1);

const PERIOD_MONTH = 'month';
const PERIOD_QUARTER = 'quarter';
const PERIOD_YEAR = 'year';
const MONTHS_IN_QUARTER = 3;

function parse_date(string $value): DateTimeImmutable
{
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    $errors = DateTimeImmutable::getLastErrors();
    if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
        throw new RuntimeException("некорректная дата: {$value}");
    }

    return $date;
}

function month_start(DateTimeImmutable $date): DateTimeImmutable
{
    return $date->modify('first day of this month');
}

function month_end(DateTimeImmutable $date): DateTimeImmutable
{
    return $date->modify('last day of this month');
}

function quarter_start(DateTimeImmutable $date): DateTimeImmutable
{
    $firstMonth = intdiv((int) $date->format('n') - 1, MONTHS_IN_QUARTER) * MONTHS_IN_QUARTER + 1;

    return $date->setDate((int) $date->format('Y'), $firstMonth, 1);
}

function next_period_start(DateTimeImmutable $start, string $granularity): DateTimeImmutable
{
    if ($granularity === PERIOD_MONTH) {
        return $start->modify('+1 month');
    }
    if ($granularity === PERIOD_QUARTER) {
        return $start->modify('+3 months');
    }
    if ($granularity === PERIOD_YEAR) {
        return $start->modify('+1 year');
    }

    throw new RuntimeException("неизвестная гранулярность: {$granularity}");
}

function align_start(DateTimeImmutable $date, string $granularity): DateTimeImmutable
{
    if ($granularity === PERIOD_MONTH) {
        return month_start($date);
    }
    if ($granularity === PERIOD_QUARTER) {
        return quarter_start($date);
    }
    if ($granularity === PERIOD_YEAR) {
        return $date->setDate((int) $date->format('Y'), 1, 1);
    }

    throw new RuntimeException("неизвестная гранулярность: {$granularity}");
}

function generate_periods(DateTimeImmutable $from, DateTimeImmutable $to, string $granularity): array
{
    $periods = [];
    $cursor = align_start($from, $granularity);
    while ($cursor <= $to) {
        $next = next_period_start($cursor, $granularity);
        $end = $next->modify('-1 day');
        if ($end > $to) {
            $end = $to;
        }
        $periods[] = ['start' => $cursor, 'end' => $end];
        $cursor = $next;
    }

    return $periods;
}

function find_intersections(array $periods): array
{
    $problems = [];
    $count = count($periods);
    for ($i = 1; $i < $count; $i++) {
        $previous = $periods[$i - 1];
        $current = $periods[$i];
        if ($current['start'] <= $previous['end']) {
            $problems[] = sprintf(
                'пересечение: %s — %s и %s — %s',
                $previous['start']->format('Y-m-d'),
                $previous['end']->format('Y-m-d'),
                $current['start']->format('Y-m-d'),
                $current['end']->format('Y-m-d')
            );
        }
    }

    return $problems;
}

function find_gaps(array $periods): array
{
    $problems = [];
    $count = count($periods);
    for ($i = 1; $i < $count; $i++) {
        $expected = $periods[$i - 1]['end']->modify('+1 day');
        if ($periods[$i]['start'] != $expected) {
            $problems[] = sprintf(
                'разрыв между %s и %s',
                $periods[$i - 1]['end']->format('Y-m-d'),
                $periods[$i]['start']->format('Y-m-d')
            );
        }
    }

    return $problems;
}

function total_days(array $periods): int
{
    $days = 0;
    foreach ($periods as $period) {
        $days += (int) $period['start']->diff($period['end'])->days + 1;
    }

    return $days;
}

function print_periods(array $periods, array $problems, string $granularity): void
{
    printf("Гранулярность: %s, периодов: %d, дней всего: %d%s%s", $granularity, count($periods), total_days($periods), PHP_EOL, PHP_EOL);
    printf("%-4s %-12s %-12s %6s%s", '№', 'НАЧАЛО', 'КОНЕЦ', 'ДНЕЙ', PHP_EOL);
    printf("%s%s", str_repeat('-', 40), PHP_EOL);

    foreach ($periods as $index => $period) {
        printf(
            "%-4d %-12s %-12s %6d%s",
            $index + 1,
            $period['start']->format('Y-m-d'),
            $period['end']->format('Y-m-d'),
            (int) $period['start']->diff($period['end'])->days + 1,
            PHP_EOL
        );
    }

    printf("%s", PHP_EOL);
    if ($problems === []) {
        printf("Периоды непрерывны и не пересекаются.%s", PHP_EOL);

        return;
    }

    foreach ($problems as $problem) {
        printf("Проблема: %s%s", $problem, PHP_EOL);
    }
}

function main(array $argv): int
{
    $from = $argv[1] ?? '2025-11-15';
    $to = $argv[2] ?? '2026-06-30';
    $granularity = $argv[3] ?? PERIOD_QUARTER;

    try {
        $periods = generate_periods(parse_date($from), parse_date($to), $granularity);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    if ($periods === []) {
        fwrite(STDERR, 'Ошибка: диапазон не содержит ни одного периода' . PHP_EOL);

        return 1;
    }

    $problems = array_merge(find_intersections($periods), find_gaps($periods));
    print_periods($periods, $problems, $granularity);

    return $problems === [] ? 0 : 1;
}

exit(main($argv));
