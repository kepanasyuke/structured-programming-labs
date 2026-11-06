<?php

declare(strict_types=1);

const TOP_SIZE = 10;
const WORD_PATTERN = '/[\p{L}\p{N}]+/u';
const MIN_WORD_LENGTH = 2;

function read_text(string $path): string
{
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("не удалось прочитать файл {$path}");
    }

    return (string) file_get_contents($path);
}

function load_stop_words(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $raw = preg_split('/\s+/u', mb_strtolower(trim((string) file_get_contents($path))), -1, PREG_SPLIT_NO_EMPTY);
    $index = [];
    foreach ($raw as $word) {
        $index[$word] = true;
    }

    return $index;
}

function to_words(string $text, array $stopWords): array
{
    preg_match_all(WORD_PATTERN, mb_strtolower($text), $matches);
    $words = [];

    foreach ($matches[0] as $word) {
        $isShort = mb_strlen($word) < MIN_WORD_LENGTH;
        if ($isShort || isset($stopWords[$word])) {
            continue;
        }
        $words[] = $word;
    }

    return $words;
}

function count_words(array $words): array
{
    $counts = [];
    foreach ($words as $word) {
        $counts[$word] = ($counts[$word] ?? 0) + 1;
    }

    return $counts;
}

function top_words(array $counts, int $limit): array
{
    $words = array_keys($counts);
    $frequencies = array_values($counts);
    array_multisort($frequencies, SORT_DESC, SORT_NUMERIC, $words, SORT_ASC, SORT_STRING);

    $top = [];
    $size = min($limit, count($words));
    for ($i = 0; $i < $size; $i++) {
        $top[$words[$i]] = $frequencies[$i];
    }

    return $top;
}

function print_report(string $path, string $text, array $words, array $top): void
{
    printf("Файл: %s%s", $path, PHP_EOL);
    printf("Символов: %d%s", mb_strlen($text), PHP_EOL);
    printf("Слов после фильтрации: %d%s", count($words), PHP_EOL);
    printf("Уникальных: %d%s%s", count(array_unique($words)), PHP_EOL, PHP_EOL);
    printf("%-24s %s%s", 'СЛОВО', 'ЧАСТОТА', PHP_EOL);
    printf("%s%s", str_repeat('-', 32), PHP_EOL);

    foreach ($top as $word => $count) {
        printf("%-24s %d%s", $word, $count, PHP_EOL);
    }
}

function main(array $argv): int
{
    $path = $argv[1] ?? __DIR__ . '/../../data/sample.txt';
    $stopPath = $argv[2] ?? __DIR__ . '/../../data/stopwords.txt';

    try {
        $text = read_text($path);
    } catch (RuntimeException $error) {
        fwrite(STDERR, 'Ошибка: ' . $error->getMessage() . PHP_EOL);

        return 1;
    }

    $words = to_words($text, load_stop_words($stopPath));
    if ($words === []) {
        fwrite(STDERR, 'Ошибка: в тексте не найдено ни одного слова' . PHP_EOL);

        return 1;
    }

    print_report($path, $text, $words, top_words(count_words($words), TOP_SIZE));

    return 0;
}

exit(main($argv));
