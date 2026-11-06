<?php

declare(strict_types=1);

const TOP_SIZE = 10;
const WORD_PATTERN = '/[\p{L}\p{N}]+/u';
const MIN_WORD_LENGTH = 2;
const STOP_SPLIT_PATTERN = '/\s+/u';

function file_is_readable(string $path): bool
{
    return is_file($path) && is_readable($path);
}

function load_file_text(string $path): ?string
{
    return file_is_readable($path) ? (string) file_get_contents($path) : null;
}

function mark_stop_word(array $index, string $word): array
{
    $index[$word] = true;

    return $index;
}

function split_tokens(string $text): array
{
    return preg_split(STOP_SPLIT_PATTERN, mb_strtolower(trim($text)), -1, PREG_SPLIT_NO_EMPTY) ?: [];
}

function load_stop_words(string $path): array
{
    return index_words(split_tokens(load_file_text($path) ?? ''), 0, []);
}

function index_words(array $words, int $position, array $index): array
{
    $result = $index;
    while ($position < count($words)) {
        $result = mark_stop_word($result, $words[$position]);
        $position += 1;
    }

    return $result;
}

function is_short_word(string $word): bool
{
    return mb_strlen($word) < MIN_WORD_LENGTH;
}

function is_skipped_word(string $word, array $stopWords): bool
{
    return is_short_word($word) || isset($stopWords[$word]);
}

function keep_word(string $word, array $stopWords): array
{
    return is_skipped_word($word, $stopWords) ? [] : [$word];
}

function match_words(string $text): array
{
    preg_match_all(WORD_PATTERN, mb_strtolower($text), $matches);

    return $matches[0];
}

function to_words(string $text, array $stopWords): array
{
    return flatten_words(match_words($text), $stopWords);
}

function flatten_words(array $words, array $stopWords): array
{
    return array_merge([], ...array_map(static fn (string $word): array => keep_word($word, $stopWords), $words));
}

function count_word(array $counts, string $word): array
{
    $counts[$word] = ($counts[$word] ?? 0) + 1;

    return $counts;
}

function count_words(array $words): array
{
    $counts = [];
    foreach ($words as $word) {
        $counts = count_word($counts, $word);
    }

    return $counts;
}

function sorted_word_keys(array $counts): array
{
    return array_keys($counts);
}

function sorted_word_values(array $counts): array
{
    return array_values($counts);
}

function sort_by_frequency(array &$words, array &$frequencies): void
{
    array_multisort($frequencies, SORT_DESC, SORT_NUMERIC, $words, SORT_ASC, SORT_STRING);
}

function clamp_size(int $limit, int $total): int
{
    return min($limit, $total);
}

function collect_top(array $words, array $frequencies, int $position, int $size, array $top): array
{
    while ($position < $size) {
        $top[$words[$position]] = $frequencies[$position];
        $position += 1;
    }

    return $top;
}

function top_words(array $counts, int $limit): array
{
    $words = sorted_word_keys($counts);
    $frequencies = sorted_word_values($counts);
    sort_by_frequency($words, $frequencies);

    return collect_top($words, $frequencies, 0, clamp_size($limit, count($words)), []);
}

function unique_count(array $words): int
{
    return count(array_unique($words));
}

function print_header(string $path): void
{
    printf("Файл: %s%s", $path, PHP_EOL);
}

function print_characters(int $length): void
{
    printf("Символов: %d%s", $length, PHP_EOL);
}

function print_word_count(int $count): void
{
    printf("Слов после фильтрации: %d%s", $count, PHP_EOL);
}

function print_unique_count(int $count): void
{
    printf("Уникальных: %d%s%s", $count, PHP_EOL, PHP_EOL);
}

function print_table_head(): void
{
    printf("%-24s %s%s", 'СЛОВО', 'ЧАСТОТА', PHP_EOL);
}

function print_separator(): void
{
    printf("%s%s", str_repeat('-', 32), PHP_EOL);
}

function print_top_row(string $word, int $count): void
{
    printf("%-24s %d%s", $word, $count, PHP_EOL);
}

function print_top_rows(array $top): void
{
    foreach ($top as $word => $count) {
        print_top_row((string) $word, $count);
    }
}

function print_summary(string $path, string $text, array $words): void
{
    print_header($path);
    print_characters(mb_strlen($text));
    print_word_count(count($words));
    print_unique_count(unique_count($words));
}

function print_table(array $top): void
{
    print_table_head();
    print_separator();
    print_top_rows($top);
}

function print_report(string $path, string $text, array $words, array $top): void
{
    print_summary($path, $text, $words);
    print_table($top);
}

function read_path(array $argv): string
{
    return $argv[1] ?? __DIR__ . '/../../data/sample.txt';
}

function read_stop_path(array $argv): string
{
    return $argv[2] ?? __DIR__ . '/../../data/stopwords.txt';
}

function print_read_error(string $path): void
{
    fwrite(STDERR, "Ошибка: не удалось прочитать файл {$path}" . PHP_EOL);
}

function print_empty_error(): void
{
    fwrite(STDERR, 'Ошибка: в тексте не найдено ни одного слова' . PHP_EOL);
}

function report_read_error(string $path, ?string $text): void
{
    if ($text === null) {
        print_read_error($path);
    }
}

function report_words_error(?string $text, array $words): void
{
    if ($text !== null && $words === []) {
        print_empty_error();
    }
}

function report_success(?string $text, string $path, array $words): void
{
    if ($text !== null && $words !== []) {
        print_report($path, $text, $words, top_words(count_words($words), TOP_SIZE));
    }
}

function load_words(string $path, string $stopPath): array
{
    return to_words(load_file_text($path) ?? '', load_stop_words($stopPath));
}

function prepare_source(array $argv): array
{
    $path = read_path($argv);

    return ['path' => $path, 'text' => load_file_text($path), 'words' => load_words($path, read_stop_path($argv))];
}

function exit_code(?string $text, array $words): int
{
    return $text === null || $words === [] ? 1 : 0;
}

function report_main(array $source): void
{
    report_read_error($source['path'], $source['text']);
    report_words_error($source['text'], $source['words']);
    report_success($source['text'], $source['path'], $source['words']);
}

function main(array $argv): int
{
    $source = prepare_source($argv);
    $text = $source['text'];
    $words = $source['words'];
    report_main($source);

    return exit_code($text, $words);
}

exit(main($argv));
