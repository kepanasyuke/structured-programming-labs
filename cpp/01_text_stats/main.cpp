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

bool read_file(const std::string& path, std::string& content) {
    std::ifstream input(path, std::ios::binary);
    if (!input.is_open()) {
        return false;
    }

    std::ostringstream buffer;
    buffer << input.rdbuf();
    content = buffer.str();

    return true;
}

std::string resolve_path(int argc, char** argv, const std::string& name) {
    if (argc > 1) {
        return argv[1];
    }

    const std::string candidates[] = {"data/" + name, "../../data/" + name};

    for (const std::string& candidate : candidates) {
        std::ifstream probe(candidate);
        if (probe.is_open()) {
            return candidate;
        }
    }

    return candidates[0];
}

std::string lowercase_utf8(const std::string& text) {
    std::string result;
    result.reserve(text.size());

    for (std::size_t i = 0; i < text.size();) {
        const unsigned char lead = static_cast<unsigned char>(text[i]);

        if (lead < 0x80) {
            result.push_back(static_cast<char>(std::tolower(lead)));
            i += 1;
            continue;
        }

        const bool is_cyrillic_pair = (lead == 0xD0 || lead == 0xD1) && i + 1 < text.size();
        if (!is_cyrillic_pair) {
            result.push_back(text[i]);
            i += 1;
            continue;
        }

        const unsigned char trail = static_cast<unsigned char>(text[i + 1]);
        if (lead == 0xD0 && trail >= 0x90 && trail <= 0x9F) {
            result.push_back(static_cast<char>(0xD0));
            result.push_back(static_cast<char>(trail + 0x20));
        } else if (lead == 0xD0 && trail >= 0xA0 && trail <= 0xAF) {
            result.push_back(static_cast<char>(0xD1));
            result.push_back(static_cast<char>(trail - 0x20));
        } else if (lead == 0xD0 && trail == 0x81) {
            result.push_back(static_cast<char>(0xD1));
            result.push_back(static_cast<char>(0x91));
        } else {
            result.push_back(text[i]);
            result.push_back(text[i + 1]);
        }
        i += 2;
    }

    return result;
}

bool is_word_byte(unsigned char byte) {
    return std::isalnum(byte) != 0 || byte >= 0x80;
}

std::vector<std::string> split_words(const std::string& text) {
    const std::string lowered = lowercase_utf8(text);
    std::vector<std::string> words;
    std::string current;

    for (unsigned char byte : lowered) {
        if (is_word_byte(byte)) {
            current.push_back(static_cast<char>(byte));
            continue;
        }

        if (!current.empty()) {
            words.push_back(current);
            current.clear();
        }
    }

    if (!current.empty()) {
        words.push_back(current);
    }

    return words;
}

std::set<std::string> load_stop_words(const std::string& path) {
    std::set<std::string> stop_words;
    std::string content;

    if (!read_file(path, content)) {
        return stop_words;
    }

    std::istringstream stream(lowercase_utf8(content));
    std::string word;
    while (stream >> word) {
        stop_words.insert(word);
    }

    return stop_words;
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

std::vector<std::string> filter_words(const std::vector<std::string>& words, const std::set<std::string>& stop_words) {
    std::vector<std::string> filtered;
    for (const std::string& word : words) {
        const bool is_short = utf8_length(word) < kMinWordLength;
        if (!is_short && stop_words.count(word) == 0) {
            filtered.push_back(word);
        }
    }

    return filtered;
}

using FrequencyMap = std::map<std::string, std::size_t>;

FrequencyMap count_words(const std::vector<std::string>& words) {
    FrequencyMap counts;
    for (const std::string& word : words) {
        counts[word] += 1;
    }

    return counts;
}

std::vector<std::pair<std::string, std::size_t>> top_words(const FrequencyMap& counts, std::size_t limit) {
    std::vector<std::pair<std::string, std::size_t>> ordered(counts.begin(), counts.end());

    std::stable_sort(ordered.begin(), ordered.end(), [](const auto& left, const auto& right) {
        if (left.second != right.second) {
            return left.second > right.second;
        }
        return left.first < right.first;
    });

    if (ordered.size() > limit) {
        ordered.resize(limit);
    }

    return ordered;
}

void print_report(const std::string& path, const std::string& text, const std::vector<std::string>& words,
                  const FrequencyMap& counts, const std::vector<std::pair<std::string, std::size_t>>& top) {
    std::cout << "Файл: " << path << '\n';
    std::cout << "Символов: " << utf8_length(text) << '\n';
    std::cout << "Слов после фильтрации: " << words.size() << '\n';
    std::cout << "Уникальных: " << counts.size() << "\n\n";
    std::cout << "СЛОВО                    ЧАСТОТА\n";
    std::cout << std::string(32, '-') << '\n';

    for (const auto& entry : top) {
        std::cout << entry.first << std::string(entry.first.size() < 24 ? 25 - entry.first.size() : 1, ' ')
                  << entry.second << '\n';
    }
}

}  // namespace

int main(int argc, char** argv) {
    const std::string path = resolve_path(argc, argv, "sample.txt");
    std::string text;

    if (!read_file(path, text)) {
        std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
        return 1;
    }

    const std::set<std::string> stop_words = load_stop_words("data/stopwords.txt");
    const std::vector<std::string> words = filter_words(split_words(text), stop_words);

    if (words.empty()) {
        std::cerr << "Ошибка: в тексте не найдено ни одного слова\n";
        return 1;
    }

    const FrequencyMap counts = count_words(words);
    print_report(path, text, words, counts, top_words(counts, kTopSize));

    return 0;
}
