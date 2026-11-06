#include <algorithm>
#include <cctype>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr char kDelimiter = ';';
constexpr int kViolationExitCode = 1;
constexpr int kReadErrorCode = 2;

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

const char* null_message() {
    return nullptr;
}

std::string strip_carriage_return(std::string line) {
    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }

    return line;
}

void keep_line(const std::string& line, std::vector<std::string>& lines) {
    if (!line.empty()) {
        lines.push_back(line);
    }
}

void read_into(std::ifstream& input, std::vector<std::string>& lines) {
    std::string line;

    while (std::getline(input, line)) {
        keep_line(strip_carriage_return(line), lines);
    }
}

bool read_lines(const std::string& path, std::vector<std::string>& lines) {
    std::ifstream input(path);
    const bool opened = input.is_open();

    if (opened) {
        read_into(input, lines);
    }

    return opened;
}

bool probe_file(const std::string& candidate) {
    std::ifstream probe(candidate);

    return probe.is_open();
}

std::vector<std::string> client_candidates() {
    return {"data/clients.csv", "../../data/clients.csv"};
}

void collect_opened(const std::vector<std::string>& candidates, std::size_t index, std::vector<std::string>& opened) {
    if (index < candidates.size() && probe_file(candidates[index])) {
        opened.push_back(candidates[index]);
    }
}

std::vector<std::string>& open_candidates(const std::vector<std::string>& candidates, std::vector<std::string>& opened) {
    for (std::size_t index = 0; index < candidates.size(); index += 1) {
        collect_opened(candidates, index, opened);
    }

    return opened;
}

std::string pick_opened(const std::vector<std::string>& candidates, const std::vector<std::string>& opened) {
    return opened.empty() ? candidates.front() : opened.front();
}

std::string resolve_path(int argc, char** argv) {
    const std::vector<std::string> candidates = client_candidates();
    std::vector<std::string> opened;
    const std::string fallback = pick_opened(candidates, open_candidates(candidates, opened));

    return argc > 1 ? std::string(argv[1]) : fallback;
}

bool is_space_at(const std::string& value, std::size_t index) {
    return std::isspace(static_cast<unsigned char>(value[index])) != 0;
}

void advance_begin(const std::string& value, std::size_t& begin, std::size_t end) {
    if (begin < end && is_space_at(value, begin)) {
        begin += 1;
    }
}

void retreat_end(const std::string& value, std::size_t begin, std::size_t& end) {
    if (end > begin && is_space_at(value, end - 1)) {
        end -= 1;
    }
}

bool is_leading_space(const std::string& value, std::size_t begin, std::size_t end) {
    return begin < end && is_space_at(value, begin);
}

bool is_trailing_space(const std::string& value, std::size_t begin, std::size_t end) {
    return end > begin && is_space_at(value, end - 1);
}

std::string trim_range(const std::string& value, std::size_t begin, std::size_t end) {
    for (; is_leading_space(value, begin, end);) {
        advance_begin(value, begin, end);
    }
    for (; is_trailing_space(value, begin, end);) {
        retreat_end(value, begin, end);
    }

    return value.substr(begin, end - begin);
}

std::string trim(const std::string& value) {
    return trim_range(value, 0, value.size());
}

std::string piece(const std::string& line, std::size_t start, std::size_t position) {
    const bool last = position == std::string::npos;
    const std::size_t length = last ? std::string::npos : position - start;

    return trim(line.substr(start, length));
}

void split_step(const std::string& line, std::size_t& start, std::vector<std::string>& parts, bool& done) {
    const std::size_t position = line.find(kDelimiter, start);
    parts.push_back(piece(line, start, position));
    start = position + 1;
    done = position == std::string::npos;
}

std::vector<std::string> split(const std::string& line) {
    std::vector<std::string> parts;
    std::size_t start = 0;
    bool done = false;

    while (!done && start <= line.size() + 1) {
        split_step(line, start, parts, done);
    }

    return parts;
}

void append_row(const std::vector<std::string>& lines, std::size_t index, Table& table) {
    if (index < lines.size()) {
        table.rows.push_back(split(lines[index]));
    }
}

void fill_rows(const std::vector<std::string>& lines, std::size_t index, Table& table) {
    for (; index < lines.size(); index += 1) {
        append_row(lines, index, table);
    }
}

void fill_table(const std::vector<std::string>& lines, Table& table) {
    table.header = split(lines.front());
    fill_rows(lines, 1, table);
}

bool load_table(const std::string& path, Table& table) {
    std::vector<std::string> lines;
    const bool opened = read_lines(path, lines);
    const bool usable = opened && !lines.empty();

    if (usable) {
        fill_table(lines, table);
    }

    return usable;
}

bool is_digit_symbol(char symbol) {
    return std::isdigit(static_cast<unsigned char>(symbol)) != 0;
}

void check_digit(char symbol, bool& result) {
    if (!is_digit_symbol(symbol)) {
        result = false;
    }
}

void scan_digits(const std::string& value, std::size_t index, bool& result) {
    for (; index < value.size(); index += 1) {
        check_digit(value[index], result);
    }
}

bool all_digits(const std::string& value) {
    bool result = !value.empty();

    scan_digits(value, 0, result);

    return result;
}

int digit_at(const std::string& value, std::size_t index) {
    return value[index] - '0';
}

int weighted_sum(const std::string& value, const std::vector<int>& weights) {
    int sum = 0;

    for (std::size_t i = 0; i < weights.size(); i += 1) {
        sum += weights[i] * digit_at(value, i);
    }

    return sum;
}

int ten_sum(const std::string& inn) {
    return weighted_sum(inn, {2, 4, 10, 3, 5, 9, 4, 6, 8});
}

bool matches_ten_digit_checksum(const std::string& inn) {
    return ten_sum(inn) % 11 % 10 == digit_at(inn, 9);
}

bool matches_twelve_digit_checksum(const std::string& inn) {
    const int eleven = weighted_sum(inn, {7, 2, 4, 10, 3, 5, 9, 4, 6, 8}) % 11 % 10;
    const int twelve = weighted_sum(inn, {3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8}) % 11 % 10;

    return eleven == digit_at(inn, 10) && twelve == digit_at(inn, 11);
}

const char* check_not_null(const std::string& value) {
    return value.empty() ? "значение пустое" : null_message();
}

bool has_inn_length(const std::string& value) {
    return value.size() == 10 || value.size() == 12;
}

bool is_inn_format_valid(const std::string& value) {
    return has_inn_length(value) && all_digits(value);
}

bool matches_inn_checksum(const std::string& value) {
    return value.size() == 10 ? matches_ten_digit_checksum(value) : matches_twelve_digit_checksum(value);
}

const char* inn_message(bool empty, bool format_ok, bool checksum_ok) {
    return empty ? "значение пустое"
           : !format_ok ? "неверная длина или символы ИНН"
           : checksum_ok ? null_message()
                        : "контрольное число ИНН не сходится";
}

const char* check_inn(const std::string& value) {
    const bool empty = value.empty();
    const bool format_ok = !empty && is_inn_format_valid(value);
    const bool checksum_ok = format_ok && matches_inn_checksum(value);

    return inn_message(empty, format_ok, checksum_ok);
}

bool has_trailing_garbage(std::istringstream& stream) {
    return !stream.eof();
}

std::string normalize_number(const std::string& value) {
    std::string normalized = value;
    std::replace(normalized.begin(), normalized.end(), ',', '.');

    return normalized;
}

bool parse_number(const std::string& value, double& number) {
    std::istringstream stream(normalize_number(value));
    const bool read = static_cast<bool>(stream >> number);
    const bool ok = read && !has_trailing_garbage(stream);
    number = ok ? number : 0.0;

    return ok;
}

const char* non_negative_message(bool empty, bool parsed, double number) {
    return empty ? "значение пустое" : !parsed ? "значение не является числом" : number >= 0.0 ? null_message() : "отрицательный остаток";
}

const char* check_non_negative(const std::string& value) {
    double number = 0.0;
    const bool empty = value.empty();
    const bool parsed = !empty && parse_number(value, number);

    return non_negative_message(empty, parsed, number);
}

bool is_allowed_status(const std::string& value) {
    const std::vector<std::string> allowed = {"active", "blocked", "closed"};

    return std::find(allowed.begin(), allowed.end(), value) != allowed.end();
}

const char* check_status(const std::string& value) {
    return is_allowed_status(value) ? null_message() : "значение вне справочника";
}

bool has_date_shape(const std::string& value) {
    return value.size() == 10 && value[4] == '-' && value[7] == '-';
}

bool has_date_digits(const std::string& value) {
    const bool year = all_digits(value.substr(0, 4));
    const bool month = all_digits(value.substr(5, 2));
    const bool day = all_digits(value.substr(8, 2));

    return year && month && day;
}

bool is_date_shaped(const std::string& value) {
    return has_date_shape(value) && has_date_digits(value);
}

void local_today(std::tm& today) {
    const std::time_t now = std::time(nullptr);

#ifdef _WIN32
    localtime_s(&today, &now);
#else
    localtime_r(&now, &today);
#endif
}

void print_digit(int value, int width, std::ostringstream& stream) {
    stream << std::setw(width) << std::setfill('0') << value;
}

void print_date_part(int value, int width, std::ostringstream& stream) {
    print_digit(value, width, stream);
    stream << '-';
}

std::string date_prefix(std::tm& today) {
    std::ostringstream stream;
    print_date_part(today.tm_year + 1900, 4, stream);
    print_date_part(today.tm_mon + 1, 2, stream);

    return stream.str();
}

std::string day_suffix(int day) {
    std::ostringstream stream;
    print_digit(day, 2, stream);

    return stream.str();
}

std::string today_text() {
    std::tm today{};
    local_today(today);

    return date_prefix(today) + day_suffix(today.tm_mday);
}

const char* future_date_message(bool future) {
    return future ? "дата в будущем" : null_message();
}

const char* check_not_future_date(const std::string& value) {
    const bool shaped = is_date_shaped(value);
    const bool future = shaped && value > today_text();

    return shaped ? future_date_message(future) : "значение не является датой";
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
    const bool missing = position == header.end();

    return missing ? header.size() : static_cast<std::size_t>(std::distance(header.begin(), position));
}

std::string cell_at(const std::vector<std::string>& row, std::size_t index) {
    return index < row.size() ? row[index] : std::string();
}

void add_violation(const char* message, std::size_t line, const Rule& rule, std::vector<Violation>& violations) {
    if (message != null_message()) {
        violations.push_back({line, rule.column, rule.name, message});
    }
}

void check_rule(const Table& table, std::size_t row_index, const Rule& rule, std::vector<Violation>& violations) {
    const std::size_t index = column_index(table.header, rule.column);

    add_violation(rule.check(cell_at(table.rows[row_index], index)), row_index + 2, rule, violations);
}

void collect_rule(const Table& table, std::size_t row_index, const std::vector<Rule>& rules, std::size_t index,
                  std::vector<Violation>& violations) {
    if (index < rules.size()) {
        check_rule(table, row_index, rules[index], violations);
    }
}

void collect_row_violations(const Table& table, const std::vector<Rule>& rules, std::size_t row_index,
                            std::vector<Violation>& violations) {
    for (std::size_t index = 0; index < rules.size(); index += 1) {
        collect_rule(table, row_index, rules, index, violations);
    }
}

void check_row_at(const Table& table, const std::vector<Rule>& rules, std::size_t index,
                  std::vector<Violation>& violations) {
    if (index < table.rows.size()) {
        collect_row_violations(table, rules, index, violations);
    }
}

void check_all_rows(const Table& table, const std::vector<Rule>& rules, std::size_t index,
                    std::vector<Violation>& violations) {
    for (; index < table.rows.size(); index += 1) {
        check_row_at(table, rules, index, violations);
    }
}

void duplicate_message(const std::string& value, std::size_t first_line, const std::string& column, std::size_t line,
                       std::vector<Violation>& violations) {
    violations.push_back({line, column, "unique",
                          "дубль значения " + value + ", впервые встретилось в строке " + std::to_string(first_line)});
}

void remember_value(const std::string& value, std::size_t line, std::map<std::string, std::size_t>& first_seen,
                    const std::string& column, std::vector<Violation>& violations) {
    const auto found = first_seen.find(value);
    const bool seen = found != first_seen.end();

    if (!seen) {
        first_seen[value] = line;
    }
    if (seen) {
        duplicate_message(value, found->second, column, line, violations);
    }
}

void check_duplicate(const Table& table, std::size_t index_in_header, std::size_t row, const std::string& column,
                     std::map<std::string, std::size_t>& first_seen, std::vector<Violation>& violations) {
    if (row < table.rows.size()) {
        remember_value(cell_at(table.rows[row], index_in_header), row + 2, first_seen, column, violations);
    }
}

void scan_duplicates(const Table& table, std::size_t index_in_header, std::size_t row, const std::string& column,
                     std::map<std::string, std::size_t>& first_seen, std::vector<Violation>& violations) {
    for (; row < table.rows.size(); row += 1) {
        check_duplicate(table, index_in_header, row, column, first_seen, violations);
    }
}

void collect_duplicate_violations(const Table& table, const std::string& column, std::vector<Violation>& violations) {
    const std::size_t index = column_index(table.header, column);
    std::map<std::string, std::size_t> first_seen;

    if (index < table.header.size()) {
        scan_duplicates(table, index, 0, column, first_seen, violations);
    }
}

void collect_unique_column(const Table& table, const std::vector<std::string>& unique_columns, std::size_t index,
                           std::vector<Violation>& violations) {
    if (index < unique_columns.size()) {
        collect_duplicate_violations(table, unique_columns[index], violations);
    }
}

std::vector<Violation> run_checks(const Table& table, const std::vector<Rule>& rules,
                                  const std::vector<std::string>& unique_columns) {
    std::vector<Violation> violations;

    check_all_rows(table, rules, 0, violations);
    for (std::size_t index = 0; index < unique_columns.size(); index += 1) {
        collect_unique_column(table, unique_columns, index, violations);
    }

    return violations;
}

void print_line(const std::string& text) {
    std::cout << text << '\n';
}

void print_checked_rows(std::size_t row_count) {
    std::cout << "Проверено строк: " << row_count << '\n';
}

void print_violation_count(std::size_t count) {
    std::cout << "Нарушений: " << count << "\n\n";
}

void print_all_passed() {
    print_line("Все проверки пройдены.");
}

void print_table_header() {
    std::cout << std::left << std::setw(6) << "СТР." << std::setw(14) << "КОЛОНКА" << std::setw(17) << "ПРАВИЛО"
              << "ОПИСАНИЕ\n";
    std::cout << std::string(78, '-') << '\n';
}

void print_violation(const Violation& violation) {
    std::cout << std::left << std::setw(6) << violation.line << std::setw(14) << violation.column << std::setw(17)
              << violation.rule << violation.message << '\n';
}

void print_violations_block(const std::vector<Violation>& violations) {
    for (const Violation& violation : violations) {
        print_violation(violation);
    }
}

void print_head(std::size_t row_count, std::size_t count) {
    print_checked_rows(row_count);
    print_violation_count(count);
}

void print_body(const std::vector<Violation>& violations) {
    const bool empty = violations.empty();

    if (empty) {
        print_all_passed();
    } else {
        print_table_header();
        print_violations_block(violations);
    }
}

void print_violations(const std::vector<Violation>& violations, std::size_t row_count) {
    print_head(row_count, violations.size());
    print_body(violations);
}

void report_read_error(const std::string& path) {
    std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
}

int fail_read(const std::string& path) {
    report_read_error(path);

    return kReadErrorCode;
}

int violation_status(const std::vector<Violation>& violations) {
    return violations.empty() ? 0 : kViolationExitCode;
}

std::vector<Violation> checked(const Table& table, bool loaded) {
    return loaded ? run_checks(table, build_rules(), {"client_id"}) : std::vector<Violation>();
}

int run(const std::string& path) {
    Table table;
    const bool loaded = load_table(path, table);
    const std::vector<Violation> violations = checked(table, loaded);

    if (loaded) {
        print_violations(violations, table.rows.size());
    }

    return loaded ? violation_status(violations) : fail_read(path);
}

}  // namespace

int main(int argc, char** argv) {
    return run(resolve_path(argc, argv));
}
