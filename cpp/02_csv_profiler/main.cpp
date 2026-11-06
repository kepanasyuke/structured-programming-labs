#include <algorithm>
#include <cctype>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr char kDelimiter = ';';
constexpr std::size_t kMaxSampleValues = 3;

struct ColumnProfile {
    std::string name;
    std::string type;
    std::size_t rows = 0;
    std::size_t empty = 0;
    std::size_t unique = 0;
    std::string minimum;
    std::string maximum;
    std::string sample;
};

struct Table {
    std::vector<std::string> header;
    std::vector<std::vector<std::string>> rows;
};

bool read_lines(const std::string& path, std::vector<std::string>& lines) {
    std::ifstream input(path);
    if (!input.is_open()) {
        return false;
    }

    std::string line;
    while (std::getline(input, line)) {
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }
        if (!line.empty()) {
            lines.push_back(line);
        }
    }

    return true;
}

std::string resolve_path(int argc, char** argv) {
    if (argc > 1) {
        return argv[1];
    }

    const std::string candidates[] = {"data/clients.csv", "../../data/clients.csv"};
    for (const std::string& candidate : candidates) {
        std::ifstream probe(candidate);
        if (probe.is_open()) {
            return candidate;
        }
    }

    return candidates[0];
}

std::string trim(const std::string& value) {
    std::size_t begin = 0;
    std::size_t end = value.size();

    while (begin < end && std::isspace(static_cast<unsigned char>(value[begin])) != 0) {
        begin += 1;
    }
    while (end > begin && std::isspace(static_cast<unsigned char>(value[end - 1])) != 0) {
        end -= 1;
    }

    return value.substr(begin, end - begin);
}

std::vector<std::string> split(const std::string& line) {
    std::vector<std::string> parts;
    std::size_t start = 0;

    while (true) {
        const std::size_t position = line.find(kDelimiter, start);
        if (position == std::string::npos) {
            parts.push_back(trim(line.substr(start)));
            break;
        }
        parts.push_back(trim(line.substr(start, position - start)));
        start = position + 1;
    }

    return parts;
}

bool load_table(const std::string& path, Table& table) {
    std::vector<std::string> lines;
    if (!read_lines(path, lines) || lines.empty()) {
        return false;
    }

    table.header = split(lines.front());
    for (std::size_t i = 1; i < lines.size(); ++i) {
        table.rows.push_back(split(lines[i]));
    }

    return true;
}

bool is_integer(const std::string& value) {
    bool result = !value.empty();
    std::size_t start = (value.front() == '-') ? 1 : 0;
    result = result && value.size() > start;

    for (std::size_t i = start; i < value.size(); ++i) {
        if (std::isdigit(static_cast<unsigned char>(value[i])) == 0) {
            result = false;
        }
    }

    return result;
}

bool is_decimal(const std::string& value) {
    const std::size_t dot = value.find_first_of(",.");
    if (dot == std::string::npos) {
        return is_integer(value);
    }

    return is_integer(value.substr(0, dot)) && is_integer(value.substr(dot + 1));
}

bool is_iso_date(const std::string& value) {
    if (value.size() != 10 || value[4] != '-' || value[7] != '-') {
        return false;
    }

    std::size_t digits = 0;
    for (std::size_t i = 0; i < value.size(); ++i) {
        if (i == 4 || i == 7) {
            continue;
        }
        if (std::isdigit(static_cast<unsigned char>(value[i])) != 0) {
            digits += 1;
        }
    }

    return digits == 8;
}

std::string detect_type(const std::vector<std::string>& filled) {
    if (filled.empty()) {
        return "empty";
    }

    std::size_t integers = 0;
    std::size_t numerics = 0;
    std::size_t dates = 0;

    for (const std::string& value : filled) {
        if (is_integer(value)) {
            integers += 1;
        }
        if (is_integer(value) || is_decimal(value)) {
            numerics += 1;
        }
        if (is_iso_date(value)) {
            dates += 1;
        }
    }

    if (integers == filled.size()) {
        return "int";
    }
    if (numerics == filled.size()) {
        return "float";
    }
    if (dates == filled.size()) {
        return "date";
    }

    return "string";
}

std::vector<std::string> select_column(const Table& table, std::size_t index) {
    std::vector<std::string> values;
    values.reserve(table.rows.size());

    for (const std::vector<std::string>& row : table.rows) {
        values.push_back(index < row.size() ? row[index] : std::string());
    }

    return values;
}

std::vector<std::string> only_filled(const std::vector<std::string>& values) {
    std::vector<std::string> filled;
    for (const std::string& value : values) {
        if (!value.empty()) {
            filled.push_back(value);
        }
    }

    return filled;
}

void fill_range(ColumnProfile& profile, const std::vector<std::string>& filled) {
    if (profile.type == "int" || profile.type == "float") {
        std::vector<double> numbers;
        for (const std::string& value : filled) {
            std::string normalized = value;
            std::replace(normalized.begin(), normalized.end(), ',', '.');
            numbers.push_back(std::stod(normalized));
        }

        std::ostringstream minimum;
        std::ostringstream maximum;
        minimum << std::fixed << std::setprecision(2) << *std::min_element(numbers.begin(), numbers.end());
        maximum << std::fixed << std::setprecision(2) << *std::max_element(numbers.begin(), numbers.end());
        profile.minimum = minimum.str();
        profile.maximum = maximum.str();
        return;
    }

    if (profile.type == "date") {
        profile.minimum = *std::min_element(filled.begin(), filled.end());
        profile.maximum = *std::max_element(filled.begin(), filled.end());
    }
}

std::string build_sample(const std::vector<std::string>& filled) {
    std::set<std::string> unique;
    for (const std::string& value : filled) {
        if (unique.size() < kMaxSampleValues) {
            unique.insert(value);
        }
    }

    std::string sample;
    for (const std::string& value : unique) {
        if (!sample.empty()) {
            sample += ", ";
        }
        sample += value;
    }

    return sample;
}

ColumnProfile profile_column(const std::string& name, const std::vector<std::string>& values) {
    const std::vector<std::string> filled = only_filled(values);

    ColumnProfile profile;
    profile.name = name;
    profile.type = detect_type(filled);
    profile.rows = values.size();
    profile.empty = values.size() - filled.size();
    profile.unique = std::set<std::string>(filled.begin(), filled.end()).size();
    profile.sample = build_sample(filled);

    fill_range(profile, filled);

    return profile;
}

std::vector<ColumnProfile> build_profiles(const Table& table) {
    std::vector<ColumnProfile> profiles;
    for (std::size_t i = 0; i < table.header.size(); ++i) {
        profiles.push_back(profile_column(table.header[i], select_column(table, i)));
    }

    return profiles;
}

std::string empty_share(const ColumnProfile& profile) {
    std::ostringstream share;
    const double percent = profile.rows == 0 ? 0.0 : 100.0 * static_cast<double>(profile.empty) / static_cast<double>(profile.rows);
    share << std::fixed << std::setprecision(1) << percent << '%';

    return share.str();
}

void print_profiles(const std::string& path, const std::vector<ColumnProfile>& profiles) {
    std::cout << "Профиль файла: " << path << '\n';
    std::cout << "Колонок: " << profiles.size() << "\n\n";
    std::cout << std::left << std::setw(14) << "КОЛОНКА" << std::setw(8) << "ТИП" << std::right << std::setw(6) << "ПУСТО"
              << std::setw(9) << "ДОЛЯ" << std::setw(8) << "УНИК." << "  " << std::left << std::setw(12) << "MIN"
              << std::setw(12) << "MAX" << '\n';
    std::cout << std::string(76, '-') << '\n';

    for (const ColumnProfile& profile : profiles) {
        std::cout << std::left << std::setw(14) << profile.name << std::setw(8) << profile.type << std::right
                  << std::setw(6) << profile.empty << std::setw(9) << empty_share(profile) << std::setw(8)
                  << profile.unique << "  " << std::left << std::setw(12) << profile.minimum << std::setw(12)
                  << profile.maximum << '\n';
        std::cout << "  примеры: " << profile.sample << '\n';
    }
}

}  // namespace

int main(int argc, char** argv) {
    const std::string path = resolve_path(argc, argv);
    Table table;

    if (!load_table(path, table)) {
        std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
        return 1;
    }

    if (table.rows.empty()) {
        std::cerr << "Ошибка: в файле нет строк с данными\n";
        return 1;
    }

    print_profiles(path, build_profiles(table));

    return 0;
}
