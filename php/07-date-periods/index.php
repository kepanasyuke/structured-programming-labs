<?php

declare(strict_types=1);

const PERIOD_MONTH = 'month';
const PERIOD_QUARTER = 'quarter';
const PERIOD_YEAR = 'year';
const MONTHS_IN_QUARTER = 3;
const DATE_FORMAT = 'Y-m-d';
const HEADER_COLUMNS = ['№', 'НАЧАЛО', 'КОНЕЦ', 'ДНЕЙ'];
const FIRST_MONTH_STEP = '+1 month';
const QUARTER_MONTH_STEP = '+3 months';
const YEAR_STEP = '+1 year';

function create_date(string $value): DateTimeImmutable|false
{
    return DateTimeImmutable::createFromFormat('!' . DATE_FORMAT, $value);
}

function has_date_errors(): bool
{
    $errors = DateTimeImmutable::getLastErrors();

    return $errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0);
}

function parse_date(string $value): ?DateTimeImmutable
{
    $date = create_date($value);

    return $date === false || has_date_errors() ? null : $date;
}

function month_start(DateTimeImmutable $date): DateTimeImmutable
{
    return $date->modify('first day of this month');
}

function first_quarter_month(DateTimeImmutable $date): int
{
    return intdiv((int) $date->format('n') - 1, MONTHS_IN_QUARTER) * MONTHS_IN_QUARTER + 1;
}

function quarter_start(DateTimeImmutable $date): DateTimeImmutable
{
    return $date->setDate((int) $date->format('Y'), first_quarter_month($date), 1);
}

function year_start(DateTimeImmutable $date): DateTimeImmutable
{
    return $date->setDate((int) $date->format('Y'), 1, 1);
}

function shift_months(DateTimeImmutable $start): DateTimeImmutable
{
    return $start->modify(FIRST_MONTH_STEP);
}

function shift_quarters(DateTimeImmutable $start): DateTimeImmutable
{
    return $start->modify(QUARTER_MONTH_STEP);
}

function shift_years(DateTimeImmutable $start): DateTimeImmutable
{
    return $start->modify(YEAR_STEP);
}

function is_unknown_granularity(string $granularity): bool
{
    return $granularity !== PERIOD_MONTH && $granularity !== PERIOD_QUARTER && $granularity !== PERIOD_YEAR;
}

function next_period_start(DateTimeImmutable $start, string $granularity): ?DateTimeImmutable
{
    $next = $granularity === PERIOD_MONTH ? shift_months($start) : shift_quarters($start);
    if ($granularity === PERIOD_YEAR) {
        $next = shift_years($start);
    }

    return is_unknown_granularity($granularity) ? null : $next;
}

function align_start(DateTimeImmutable $date, string $granularity): ?DateTimeImmutable
{
    $aligned = $granularity === PERIOD_MONTH ? month_start($date) : quarter_start($date);
    if ($granularity === PERIOD_YEAR) {
        $aligned = year_start($date);
    }

    return is_unknown_granularity($granularity) ? null : $aligned;
}

function clamp_end(DateTimeImmutable $end, DateTimeImmutable $to): DateTimeImmutable
{
    return $end > $to ? $to : $end;
}

function make_period(DateTimeImmutable $start, DateTimeImmutable $next, DateTimeImmutable $to): array
{
    return ['start' => $start, 'end' => clamp_end($next->modify('-1 day'), $to)];
}

function collect_periods(DateTimeImmutable $cursor, DateTimeImmutable $to, string $granularity, array $periods): array
{
    $state = ['periods' => $periods, 'cursor' => $cursor];
    while ($state['cursor'] <= $to) {
        $state = period_step($state['cursor'], next_period_start($state['cursor'], $granularity), $to, $state['periods']);
    }

    return $state['periods'];
}
function period_step(DateTimeImmutable $cursor, ?DateTimeImmutable $next, DateTimeImmutable $to, array $periods): array
{
    $periods[] = make_period($cursor, $next ?? $cursor, $to);

    return ['periods' => $periods, 'cursor' => $next ?? $cursor];
}
function generate_periods(DateTimeImmutable $from, DateTimeImmutable $to, string $granularity): array
{
    $start = align_start($from, $granularity);

    return $start === null ? [] : collect_periods($start, $to, $granularity, []);
}

function format_date(DateTimeImmutable $date): string
{
    return $date->format(DATE_FORMAT);
}

function overlap_message(array $previous, array $current): string
{
    return sprintf('пересечение: %s — %s и %s — %s', format_date($previous['start']), format_date($previous['end']), format_date($current['start']), format_date($current['end']));
}

function find_overlap(array $previous, array $current): array
{
    return $current['start'] <= $previous['end'] ? [overlap_message($previous, $current)] : [];
}

function intersection_loop(array $periods, int $index, int $count, array $problems): array
{
    $result = $problems;
    while ($index < $count) {
        $result = array_merge($result, find_overlap($periods[$index - 1], $periods[$index]));
        $index += 1;
    }

    return $result;
}

function find_intersections(array $periods): array
{
    return intersection_loop($periods, 1, count($periods), []);
}

function expected_start(array $previous): DateTimeImmutable
{
    return $previous['end']->modify('+1 day');
}

function gap_message(array $previous, array $current): string
{
    return sprintf('разрыв между %s и %s', format_date($previous['end']), format_date($current['start']));
}

function find_gap(array $previous, array $current): array
{
    return $current['start'] != expected_start($previous) ? [gap_message($previous, $current)] : [];
}

function gap_loop(array $periods, int $index, int $count, array $problems): array
{
    $result = $problems;
    while ($index < $count) {
        $result = array_merge($result, find_gap($periods[$index - 1], $periods[$index]));
        $index += 1;
    }

    return $result;
}

function find_gaps(array $periods): array
{
    return gap_loop($periods, 1, count($periods), []);
}

function period_days(array $period): int
{
    return (int) $period['start']->diff($period['end'])->days + 1;
}

function total_days(array $periods): int
{
    $days = 0;
    foreach ($periods as $period) {
        $days += period_days($period);
    }

    return $days;
}

function print_summary(array $periods, string $granularity): void
{
    printf("Гранулярность: %s, периодов: %d, дней всего: %d%s%s", $granularity, count($periods), total_days($periods), PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-4s %-12s %-12s %6s%s", ...array_merge(HEADER_COLUMNS, [PHP_EOL]));
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 40), PHP_EOL);
}

function print_period_row(int $index, array $period): void
{
    printf("%-4d %-12s %-12s %6d%s", $index + 1, format_date($period['start']), format_date($period['end']), period_days($period), PHP_EOL);
}

function print_period_rows(array $periods): void
{
    foreach ($periods as $index => $period) {
        print_period_row($index, $period);
    }
}

function print_problems(array $problems): void
{
    foreach ($problems as $problem) {
        printf("Проблема: %s%s", $problem, PHP_EOL);
    }
}

function print_continuity(array $problems): void
{
    if ($problems === []) {
        printf("Периоды непрерывны и не пересекаются.%s", PHP_EOL);
    }
    if ($problems !== []) {
        print_problems($problems);
    }
}

function print_periods(array $periods, array $problems, string $granularity): void
{
    print_summary($periods, $granularity);
    print_table_head();
    print_separator();
    print_period_rows($periods);
    printf("%s", PHP_EOL);
    print_continuity($problems);
}

function read_argument(array $argv, int $index, string $fallback): string
{
    return $argv[$index] ?? $fallback;
}

function parse_bounds(array $argv): array
{
    return ['from' => parse_date(read_argument($argv, 1, '2025-11-15')), 'to' => parse_date(read_argument($argv, 2, '2026-06-30'))];
}

function grant_granularity(array $argv): string
{
    return read_argument($argv, 3, PERIOD_QUARTER);
}

function is_bad_bounds(array $bounds): bool
{
    return $bounds['from'] === null || $bounds['to'] === null;
}

function date_error_message(array $bounds): string
{
    $bad = $bounds['from'] === null ? 'from' : 'to';

    return is_bad_bounds($bounds) ? 'Ошибка: некорректная дата: ' . ($bad === 'from' ? $bounds['from'] ?? '' : $bounds['to'] ?? '') . PHP_EOL : '';
}

function report_granularity_error(string $granularity): void
{
    if (is_unknown_granularity($granularity)) {
        fwrite(STDERR, 'Ошибка: неизвестная гранулярность: ' . $granularity . PHP_EOL);
    }
}

function report_empty_error(): void
{
    fwrite(STDERR, 'Ошибка: диапазон не содержит ни одного периода' . PHP_EOL);
}

function build_code(bool $bad, string $granularity, array $periods): int
{
    $failed = $bad || is_unknown_granularity($granularity) || $periods === [];

    return $failed ? 1 : 0;
}

function solve(array $argv): array
{
    $bounds = parse_bounds($argv);
    $granularity = grant_granularity($argv);
    $valid = !is_bad_bounds($bounds) && !is_unknown_granularity($granularity);
    $periods = $valid ? generate_periods($bounds['from'], $bounds['to'], $granularity) : [];

    return ['bounds' => $bounds, 'granularity' => $granularity, 'periods' => $periods];
}

function report_outcome(array $solution): void
{
    fwrite(STDERR, date_error_message($solution['bounds']));
    report_granularity_error($solution['granularity']);
    if (!is_bad_bounds($solution['bounds']) && !is_unknown_granularity($solution['granularity']) && $solution['periods'] === []) {
        report_empty_error();
    }
}

function main(array $argv): int
{
    $solution = solve($argv);
    $granularity = $solution['granularity'];
    $periods = $solution['periods'];
    report_outcome($solution);
    print_outcome($periods, $granularity);

    return build_code(is_bad_bounds($solution['bounds']), $granularity, $periods);
}

function print_outcome(array $periods, string $granularity): void
{
    if ($periods !== [] && !is_unknown_granularity($granularity)) {
        print_periods($periods, array_merge(find_intersections($periods), find_gaps($periods)), $granularity);
    }
}

exit(main($argv));
