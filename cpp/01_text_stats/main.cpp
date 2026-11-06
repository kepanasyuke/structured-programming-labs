#include <algorithm>
#include <cctype>
#include <fstream>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr std::size_t kTopSize = 10;
constexpr std::size_t kMinWordLength = 2;

using FrequencyMap = std::map<std::string, std::size_t>;
using Entry = std::pair<std::string, std::size_t>;

bool is_lowercase_candidate(unsigned char lead, unsigned char trail) {
    const bool cyrillic_lead = lead == 0xD0 || lead == 0xD1;
    const bool uppercase_a = lead == 0xD0 && trail >= 0x90 && trail <= 0x9F;
    const bool uppercase_p = lead == 0xD0 && trail >= 0xA0 && trail <= 0xAF;
    const bool uppercase_yo = lead == 0xD0 && trail == 0x81;

    return cyrillic_lead && (uppercase_a || uppercase_p || uppercase_yo);
}

bool is_lower_a(unsigned char lead, unsigned char trail) {
    return lead == 0xD0 && trail >= 0x90 && trail <= 0x9F;
}

bool is_lower_p(unsigned char lead, unsigned char trail) {
    return lead == 0xD0 && trail >= 0xA0 && trail <= 0xAF;
}

bool is_lower_yo(unsigned char lead, unsigned char trail) {
    return lead == 0xD0 && trail == 0x81;
}

void push_pair(unsigned char lead, unsigned char trail, std::string& result) {
    result.push_back(static_cast<char>(lead));
    result.push_back(static_cast<char>(trail));
}

void push_lower_a(unsigned char trail, std::string& result) {
    push_pair(0xD0, static_cast<unsigned char>(trail + 0x20), result);
}

void push_lower_p(unsigned char trail, std::string& result) {
    push_pair(0xD1, static_cast<unsigned char>(trail - 0x20), result);
}

void push_lower_yo(std::string& result) {
    push_pair(0xD1, 0x91, result);
}

void push_lowered(unsigned char lead, unsigned char trail, std::string& result) {
    if (is_lower_a(lead, trail)) {
        push_lower_a(trail, result);
    } else if (is_lower_p(lead, trail)) {
        push_lower_p(trail, result);
    } else {
        push_lower_yo(result);
    }
}

bool has_next(const std::string& text, std::size_t index) {
    return index + 1 < text.size();
}

bool is_pair_start(const std::string& text, std::size_t index) {
    return has_next(text, index) && is_lowercase_candidate(text[index], text[index + 1]);
}

void copy_pair(const std::string& text, std::size_t& index, std::string& result) {
    push_pair(static_cast<unsigned char>(text[index]), static_cast<unsigned char>(text[index + 1]), result);
    index += 2;
}

void copy_single(const std::string& text, std::size_t& index, std::string& result) {
    result.push_back(text[index]);
    index += 1;
}

void copy_ascii(const std::string& text, std::size_t& index, std::string& result) {
    result.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(text[index]))));
    index += 1;
}

void lower_cyrillic_pair(const std::string& text, std::size_t& index, std::string& result) {
    push_lowered(static_cast<unsigned char>(text[index]), static_cast<unsigned char>(text[index + 1]), result);
    index += 2;
}

bool is_ascii(const std::string& text, std::size_t index) {
    return static_cast<unsigned char>(text[index]) < 0x80;
}

void copy_tail(const std::string& text, std::size_t& index, std::string& result) {
    copy_single(text, index, result);
}

void lower_non_ascii(const std::string& text, std::size_t& index, std::string& result) {
    if (is_pair_start(text, index)) {
        lower_cyrillic_pair(text, index, result);
    } else if (has_next(text, index)) {
        copy_pair(text, index, result);
    } else {
        copy_tail(text, index, result);
    }
}

void lower_step(const std::string& text, std::size_t& index, std::string& result) {
    if (is_ascii(text, index)) {
        copy_ascii(text, index, result);
    } else {
        lower_non_ascii(text, index, result);
    }
}

void lower_until_end(const std::string& text, std::size_t& index, std::string& result) {
    for (; index < text.size();) {
        lower_step(text, index, result);
    }
}

std::string lowercase_utf8(const std::string& text) {
    std::string result;
    std::size_t index = 0;
    result.reserve(text.size());
    lower_until_end(text, index, result);

    return result;
}

bool is_word_byte(unsigned char byte) {
    const bool latin = std::isalnum(byte) != 0;
    const bool cyrillic = byte >= 0x80;

    return latin || cyrillic;
}

void flush_word(std::vector<std::string>& words, std::string& current) {
    if (!current.empty()) {
        words.push_back(current);
        current.clear();
    }
}

void feed_byte(unsigned char byte, std::vector<std::string>& words, std::string& current) {
    if (is_word_byte(byte)) {
        current.push_back(static_cast<char>(byte));
    } else {
        flush_word(words, current);
    }
}

std::vector<std::string> split_lowered(const std::string& lowered, std::size_t index, std::vector<std::string>& words,
                                       std::string& current) {
    for (; index < lowered.size(); index += 1) {
        feed_byte(static_cast<unsigned char>(lowered[index]), words, current);
    }
    flush_word(words, current);

    return words;
}

std::vector<std::string> split_words(const std::string& text) {
    std::vector<std::string> words;
    std::string current;

    return split_lowered(lowercase_utf8(text), 0, words, current);
}

std::size_t utf8_length(const std::string& word) {
    std::size_t length = 0;

    for (unsigned char byte : word) {
        if ((byte & 0xC0) != 0x80) {
            length += 1;
        }
    }

    return length;
}

void fill_from_streambuf(std::ifstream& input, std::string& content) {
    std::ostringstream buffer;
    buffer << input.rdbuf();
    content = buffer.str();
}

bool read_file(const std::string& path, std::string& content) {
    std::ifstream input(path, std::ios::binary);
    const bool opened = input.is_open();

    if (opened) {
        fill_from_streambuf(input, content);
    }

    return opened;
}

bool probe_file(const std::string& candidate) {
    std::ifstream probe(candidate);

    return probe.is_open();
}

std::vector<std::string> path_candidates(const std::string& name) {
    return {"data/" + name, "../../data/" + name};
}

void collect_opened(const std::vector<std::string>& candidates, std::size_t index, std::vector<std::string>& opened) {
    if (index < candidates.size()) {
        if (probe_file(candidates[index])) {
            opened.push_back(candidates[index]);
        }
    }
}

std::vector<std::string> open_candidates(const std::vector<std::string>& candidates, std::size_t index,
                                         std::vector<std::string>& opened) {
    for (; index < candidates.size(); index += 1) {
        collect_opened(candidates, index, opened);
    }

    return opened;
}

std::string first_or_default(const std::vector<std::string>& candidates) {
    std::vector<std::string> opened;
    const std::vector<std::string> found = open_candidates(candidates, 0, opened);
    const std::vector<std::string>& chosen = found.empty() ? candidates : found;

    return chosen.front();
}

std::string resolve_path(int argc, char** argv, const std::string& name) {
    return argc > 1 ? std::string(argv[1]) : first_or_default(path_candidates(name));
}

bool is_significant_word(const std::string& word, const std::set<std::string>& stop_words) {
    return utf8_length(word) >= kMinWordLength && stop_words.count(word) == 0;
}

void keep_word(const std::string& word, const std::set<std::string>& stop_words, std::vector<std::string>& filtered) {
    if (is_significant_word(word, stop_words)) {
        filtered.push_back(word);
    }
}

std::vector<std::string> filter_words(const std::vector<std::string>& words, const std::set<std::string>& stop_words) {
    std::vector<std::string> filtered;

    for (const std::string& word : words) {
        keep_word(word, stop_words, filtered);
    }

    return filtered;
}

void insert_stream_words(std::istringstream& stream, std::set<std::string>& stop_words) {
    std::string word;

    while (stream >> word) {
        stop_words.insert(word);
    }
}

std::set<std::string> load_stop_words(const std::string& path) {
    std::string content;
    std::set<std::string> stop_words;
    const bool loaded = read_file(path, content);
    std::istringstream stream(loaded ? lowercase_utf8(content) : std::string());
    insert_stream_words(stream, stop_words);

    return stop_words;
}

FrequencyMap count_words(const std::vector<std::string>& words) {
    FrequencyMap counts;

    for (const std::string& word : words) {
        counts[word] += 1;
    }

    return counts;
}

bool ranks_before(const Entry& left, const Entry& right) {
    const bool heavier = left.second > right.second;
    const bool same_weight = left.second == right.second;

    return same_weight ? left.first < right.first : heavier;
}

std::vector<Entry> top_words(const FrequencyMap& counts, std::size_t limit) {
    std::vector<Entry> ordered(counts.begin(), counts.end());
    std::stable_sort(ordered.begin(), ordered.end(), ranks_before);
    ordered.resize(std::min(limit, ordered.size()));

    return ordered;
}

void print_caption(const std::string& path) {
    std::cout << "Файл: " << path << '\n';
}

void print_characters(std::size_t count) {
    std::cout << "Символов: " << count << '\n';
}

void print_word_count(const std::vector<std::string>& words) {
    std::cout << "Слов после фильтрации: " << words.size() << '\n';
}

void print_unique_count(std::size_t count) {
    std::cout << "Уникальных: " << count << "\n\n";
}

void print_word_table_header() {
    std::cout << "СЛОВО                    ЧАСТОТА\n";
}

void print_rows_caption() {
    std::cout << std::string(32, '-') << '\n';
}

std::size_t word_padding(std::size_t length) {
    return length < 24 ? 25 - length : 1;
}

void print_row(const Entry& entry) {
    std::cout << entry.first << std::string(word_padding(entry.first.size()), ' ') << entry.second << '\n';
}

void print_each_entry(const std::vector<Entry>& top) {
    for (const Entry& entry : top) {
        print_row(entry);
    }
}

void print_head(const std::string& path, std::size_t chars, std::size_t word_count, std::size_t unique_count) {
    print_caption(path);
    print_characters(chars);
    print_unique_count(unique_count);
    print_word_table_header();
    print_rows_caption();
}

void print_report(const std::string& path, const std::vector<std::string>& words, const std::string& text,
                  const FrequencyMap& counts, const std::vector<Entry>& top) {
    print_head(path, utf8_length(text), words.size(), counts.size());
    print_each_entry(top);
}

void report_read_error(const std::string& path) {
    std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
}

void report_empty_text() {
    std::cerr << "Ошибка: в тексте не найдено ни одного слова\n";
}

int report_read_and_fail(const std::string& path) {
    report_read_error(path);

    return 1;
}

int report_empty_and_fail() {
    report_empty_text();

    return 1;
}

int failure_status(bool loaded, const std::string& path) {
    return loaded ? report_empty_and_fail() : report_read_and_fail(path);
}

struct Report {
    std::string path;
    std::string text;
    std::vector<std::string> words;
    FrequencyMap counts;
    bool loaded = false;
};

void print_when_ready(const Report& report) {
    if (report.loaded && !report.words.empty()) {
        print_report(report.path, report.words, report.text, report.counts, top_words(report.counts, kTopSize));
    }
}

Report prepare(const std::string& path) {
    Report report;
    report.path = path;
    report.loaded = read_file(path, report.text);
    report.words = filter_words(split_words(report.text), load_stop_words("data/stopwords.txt"));
    report.counts = count_words(report.words);

    return report;
}

int run(const std::string& path) {
    const Report report = prepare(path);
    const bool can_report = report.loaded && !report.words.empty();

    print_when_ready(report);

    return can_report ? 0 : failure_status(report.loaded, path);
}

}  // namespace

int main(int argc, char** argv) {
    return run(resolve_path(argc, argv, "sample.txt"));
}
