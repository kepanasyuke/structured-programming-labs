#include <algorithm>
#include <cctype>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr char kDelimiter = ';';
constexpr int kViolationExitCode = 1;

struct Table {
    std::vector<std::string> header;
    std::vector<std::vector<std::string>> rows;
};

struct Violation {
    std::size_t line = 0;
    std::string column;
    std::string rule;
    std::string message;
};

using CheckFunction = const char* (*)(const std::string& value);

struct Rule {
    std::string column;
    std::string name;
    CheckFunction check;
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

bool all_digits(const std::string& value) {
    bool result = !value.empty();
    for (char symbol : value) {
        if (std::isdigit(static_cast<unsigned char>(symbol)) == 0) {
            result = false;
        }
    }

    return result;
}

int digit_at(const std::string& value, std::size_t index) {
    return value[index] - '0';
}

bool matches_ten_digit_checksum(const std::string& inn) {
    const int weights[] = {2, 4, 10, 3, 5, 9, 4, 6, 8};
    int sum = 0;
    for (std::size_t i = 0; i < 9; ++i) {
        sum += weights[i] * digit_at(inn, i);
    }

    return sum % 11 % 10 == digit_at(inn, 9);
}

bool matches_twelve_digit_checksum(const std::string& inn) {
    const int weights_eleven[] = {7, 2, 4, 10, 3, 5, 9, 4, 6, 8};
    const int weights_twelve[] = {3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8};
    int sum_eleven = 0;
    int sum_twelve = 0;

    for (std::size_t i = 0; i < 10; ++i) {
        sum_eleven += weights_eleven[i] * digit_at(inn, i);
    }
    for (std::size_t i = 0; i < 11; ++i) {
        sum_twelve += weights_twelve[i] * digit_at(inn, i);
    }

    return sum_eleven % 11 % 10 == digit_at(inn, 10) && sum_twelve % 11 % 10 == digit_at(inn, 11);
}

const char* check_not_null(const std::string& value) {
    return value.empty() ? "значение пустое" : nullptr;
}

const char* check_inn(const std::string& value) {
    if (value.empty()) {
        return "значение пустое";
    }
    if ((value.size() != 10 && value.size() != 12) || !all_digits(value)) {
        return "неверная длина или символы ИНН";
    }

    const bool valid = value.size() == 10 ? matches_ten_digit_checksum(value) : matches_twelve_digit_checksum(value);

    return valid ? nullptr : "контрольное число ИНН не сходится";
}

const char* check_non_negative(const std::string& value) {
    if (value.empty()) {
        return "значение пустое";
    }

    std::string normalized = value;
    std::replace(normalized.begin(), normalized.end(), ',', '.');

    try {
        const double number = std::stod(normalized);
        return number >= 0.0 ? nullptr : "отрицательный остаток";
    } catch (const std::exception&) {
        return "значение не является числом";
    }
}

const char* check_status(const std::string& value) {
    const std::vector<std::string> allowed = {"active", "blocked", "closed"};

    return std::find(allowed.begin(), allowed.end(), value) != allowed.end() ? nullptr : "значение вне справочника";
}

const char* check_not_future_date(const std::string& value) {
    const bool valid_shape = value.size() == 10 && value[4] == '-' && value[7] == '-' && all_digits(value.substr(0, 4)) &&
                             all_digits(value.substr(5, 2)) && all_digits(value.substr(8, 2));

    if (!valid_shape) {
        return "значение не является датой";
    }

    const std::time_t now = std::time(nullptr);
    std::tm today{};
#ifdef _MSC_VER
    localtime_s(&today, &now);
#else
    localtime_r(&now, &today);
#endif

    std::ostringstream stream;
    stream << std::setw(4) << std::setfill('0') << (today.tm_year + 1900) << '-' << std::setw(2) << (today.tm_mon + 1) << '-'
           << std::setw(2) << today.tm_mday;

    return value <= stream.str() ? nullptr : "дата в будущем";
}

std::vector<Rule> build_rules() {
    return {
        {"client_id", "not_null", check_not_null},
        {"inn", "format", check_inn},
        {"balance_rub", "positive_number", check_non_negative},
        {"status", "allowed_values", check_status},
        {"open_date", "not_future_date", check_not_future_date},
    };
}

std::size_t column_index(const std::vector<std::string>& header, const std::string& name) {
    const auto position = std::find(header.begin(), header.end(), name);

    return position == header.end() ? header.size() : static_cast<std::size_t>(std::distance(header.begin(), position));
}

void collect_row_violations(const Table& table, const std::vector<Rule>& rules, std::size_t row_index,
                            std::vector<Violation>& violations) {
    const std::vector<std::string>& row = table.rows[row_index];

    for (const Rule& rule : rules) {
        const std::size_t index = column_index(table.header, rule.column);
        const std::string value = index < row.size() ? row[index] : std::string();
        const char* message = rule.check(value);

        if (message != nullptr) {
            violations.push_back({row_index + 2, rule.column, rule.name, message});
        }
    }
}

void collect_duplicate_violations(const Table& table, const std::string& column, std::vector<Violation>& violations) {
    const std::size_t index = column_index(table.header, column);
    if (index >= table.header.size()) {
        return;
    }

    std::map<std::string, std::size_t> first_seen;

    for (std::size_t i = 0; i < table.rows.size(); ++i) {
        const std::vector<std::string>& row = table.rows[i];
        const std::string value = index < row.size() ? row[index] : std::string();
        const std::size_t line = i + 2;
        const auto found = first_seen.find(value);

        if (found == first_seen.end()) {
            first_seen[value] = line;
        } else {
            violations.push_back(
                {line, column, "unique", "дубль значения " + value + ", впервые встретилось в строке " + std::to_string(found->second)});
        }
    }
}

std::vector<Violation> run_checks(const Table& table, const std::vector<Rule>& rules, const std::vector<std::string>& unique_columns) {
    std::vector<Violation> violations;

    for (std::size_t i = 0; i < table.rows.size(); ++i) {
        collect_row_violations(table, rules, i, violations);
    }

    for (const std::string& column : unique_columns) {
        collect_duplicate_violations(table, column, violations);
    }

    return violations;
}

void print_violations(const std::vector<Violation>& violations, std::size_t row_count) {
    std::cout << "Проверено строк: " << row_count << '\n';
    std::cout << "Нарушений: " << violations.size() << "\n\n";

    if (violations.empty()) {
        std::cout << "Все проверки пройдены.\n";
        return;
    }

    std::cout << std::left << std::setw(6) << "СТР." << std::setw(14) << "КОЛОНКА" << std::setw(17) << "ПРАВИЛО"
              << "ОПИСАНИЕ\n";
    std::cout << std::string(78, '-') << '\n';

    for (const Violation& violation : violations) {
        std::cout << std::left << std::setw(6) << violation.line << std::setw(14) << violation.column << std::setw(17)
                  << violation.rule << violation.message << '\n';
    }
}

}  // namespace

int main(int argc, char** argv) {
    const std::string path = resolve_path(argc, argv);
    Table table;

    if (!load_table(path, table)) {
        std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
        return 2;
    }

    const std::vector<Violation> violations = run_checks(table, build_rules(), {"client_id"});
    print_violations(violations, table.rows.size());

    return violations.empty() ? 0 : kViolationExitCode;
}
