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

std::size_t next_position(const std::string& line, std::size_t start) {
    return line.find(kDelimiter, start);
}

std::string piece(const std::string& line, std::size_t start, std::size_t position) {
    const bool last = position == std::string::npos;
    const std::size_t length = last ? std::string::npos : position - start;

    return trim(line.substr(start, length));
}

void split_step(const std::string& line, std::size_t& start, std::vector<std::string>& parts, bool& done) {
    const std::size_t position = next_position(line, start);
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

bool load_table(const std::string& path, Table& table) {
    std::vector<std::string> lines;
    const bool opened = read_lines(path, lines);

    if (opened && !lines.empty()) {
        table.header = split(lines.front());
        fill_rows(lines, 1, table);
    }

    return opened && !lines.empty();
}

bool is_sign(char symbol) {
    return symbol == '-';
}

bool is_digit_char(char symbol) {
    return std::isdigit(static_cast<unsigned char>(symbol)) != 0;
}

std::size_t number_start(const std::string& value) {
    return !value.empty() && is_sign(value.front()) ? 1 : 0;
}

void check_digit(const std::string& value, std::size_t index, bool& result) {
    if (!is_digit_char(value[index])) {
        result = false;
    }
}

void scan_digits(const std::string& value, std::size_t start, std::size_t index, bool& result) {
    for (; index < value.size(); index += 1) {
        check_digit(value, index, result);
    }
}

bool is_integer(const std::string& value) {
    const std::size_t start = number_start(value);
    bool result = !value.empty() && value.size() > start;

    scan_digits(value, start, start, result);

    return result;
}

bool is_decimal(const std::string& value) {
    const std::size_t dot = value.find_first_of(",.");
    const bool has_dot = dot != std::string::npos;

    return has_dot ? is_integer(value.substr(0, dot)) && is_integer(value.substr(dot + 1)) : is_integer(value);
}

bool has_date_shape(const std::string& value) {
    return value.size() == 10 && value[4] == '-' && value[7] == '-';
}

std::size_t count_digits(const std::string& value, std::size_t index, std::size_t digits) {
    for (; index < value.size(); index += 1) {
        const bool skip_dash = index == 4 || index == 7;
        digits += (!skip_dash && is_digit_char(value[index])) ? 1 : 0;
    }

    return digits;
}

bool is_iso_date(const std::string& value) {
    return has_date_shape(value) && count_digits(value, 0, 0) == 8;
}

struct TypeCounts {
    std::size_t integers = 0;
    std::size_t numerics = 0;
    std::size_t dates = 0;
};

TypeCounts& tally_value(const std::string& value, TypeCounts& counts) {
    counts.integers += is_integer(value) ? 1 : 0;
    counts.numerics += (is_integer(value) || is_decimal(value)) ? 1 : 0;
    counts.dates += is_iso_date(value) ? 1 : 0;

    return counts;
}

TypeCounts tally_all(const std::vector<std::string>& filled) {
    TypeCounts counts;

    for (const std::string& value : filled) {
        tally_value(value, counts);
    }

    return counts;
}

std::string classify(const std::vector<std::string>& filled) {
    const TypeCounts counts = tally_all(filled);
    const std::size_t total = filled.size();
    const bool all_integers = total > 0 && counts.integers == total;
    const bool all_numerics = total > 0 && counts.numerics == total;
    const bool all_dates = total > 0 && counts.dates == total;

    return all_integers ? "int" : all_numerics ? "float" : all_dates ? "date" : filled.empty() ? "empty" : "string";
}

std::string detect_type(const std::vector<std::string>& filled) {
    return classify(filled);
}

std::string cell_at(const std::vector<std::string>& row, std::size_t index) {
    return index < row.size() ? row[index] : std::string();
}

void collect_cell(const Table& table, std::size_t index, std::size_t row, std::vector<std::string>& values) {
    values.push_back(cell_at(table.rows[row], index));
}

std::vector<std::string> select_column(const Table& table, std::size_t index) {
    std::vector<std::string> values;

    for (std::size_t row = 0; row < table.rows.size(); row += 1) {
        collect_cell(table, index, row, values);
    }

    return values;
}

void keep_filled(const std::string& value, std::vector<std::string>& filled) {
    if (!value.empty()) {
        filled.push_back(value);
    }
}

std::vector<std::string> only_filled(const std::vector<std::string>& values) {
    std::vector<std::string> filled;

    for (const std::string& value : values) {
        keep_filled(value, filled);
    }

    return filled;
}

bool is_numeric_type(const std::string& type) {
    return type == "int" || type == "float";
}

double to_double(const std::string& value) {
    std::string normalized = value;
    std::replace(normalized.begin(), normalized.end(), ',', '.');
    std::istringstream stream(normalized);
    double number = 0.0;
    stream >> number;

    return number;
}

void collect_numbers(const std::vector<std::string>& filled, std::size_t index, std::vector<double>& numbers) {
    if (index < filled.size()) {
        numbers.push_back(to_double(filled[index]));
    }
}

std::vector<double> to_numbers(const std::vector<std::string>& filled) {
    std::vector<double> numbers;

    for (std::size_t index = 0; index < filled.size(); index += 1) {
        collect_numbers(filled, index, numbers);
    }

    return numbers;
}

std::string format_two(double value) {
    std::ostringstream stream;
    stream << std::fixed << std::setprecision(2) << value;

    return stream.str();
}

void fill_numeric_range(ColumnProfile& profile, const std::vector<std::string>& filled) {
    const std::vector<double> numbers = to_numbers(filled);
    const auto lowest = std::min_element(numbers.begin(), numbers.end());
    const auto highest = std::max_element(numbers.begin(), numbers.end());
    profile.minimum = lowest == numbers.end() ? std::string() : format_two(*lowest);
    profile.maximum = highest == numbers.end() ? std::string() : format_two(*highest);
}

void fill_text_range(ColumnProfile& profile, const std::vector<std::string>& filled) {
    profile.minimum = *std::min_element(filled.begin(), filled.end());
    profile.maximum = *std::max_element(filled.begin(), filled.end());
}

void fill_range(ColumnProfile& profile, const std::vector<std::string>& filled) {
    if (is_numeric_type(profile.type) && !filled.empty()) {
        fill_numeric_range(profile, filled);
    } else if (profile.type == "date") {
        fill_text_range(profile, filled);
    }
}

bool sample_is_full(const std::set<std::string>& unique) {
    return unique.size() >= kMaxSampleValues;
}

void add_sample(const std::string& value, std::set<std::string>& unique) {
    if (!sample_is_full(unique)) {
        unique.insert(value);
    }
}

std::set<std::string> sample_set(const std::vector<std::string>& filled) {
    std::set<std::string> unique;

    for (const std::string& value : filled) {
        add_sample(value, unique);
    }

    return unique;
}

void append_with_separator(const std::string& value, std::string& sample) {
    if (!sample.empty()) {
        sample += ", ";
    }
    sample += value;
}

std::string build_sample(const std::vector<std::string>& filled) {
    const std::set<std::string> unique = sample_set(filled);
    std::string sample;

    for (const std::string& value : unique) {
        append_with_separator(value, sample);
    }

    return sample;
}

std::size_t unique_count(const std::vector<std::string>& filled) {
    return std::set<std::string>(filled.begin(), filled.end()).size();
}

void set_counts(ColumnProfile& profile, std::size_t total, const std::vector<std::string>& filled) {
    profile.rows = total;
    profile.empty = total - filled.size();
}

void assign_basic(ColumnProfile& profile, const std::string& name, const std::vector<std::string>& values,
                  const std::vector<std::string>& filled) {
    profile.name = name;
    set_counts(profile, values.size(), filled);
    profile.unique = unique_count(filled);
}

ColumnProfile filled_profile(const std::string& name, const std::vector<std::string>& values,
                             const std::vector<std::string>& filled) {
    ColumnProfile profile;
    assign_basic(profile, name, values, filled);
    profile.type = detect_type(filled);
    profile.sample = build_sample(filled);

    return profile;
}

ColumnProfile profile_column(const std::string& name, const std::vector<std::string>& values) {
    const std::vector<std::string> filled = only_filled(values);
    ColumnProfile profile = filled_profile(name, values, filled);
    fill_range(profile, filled);

    return profile;
}

void add_profile(const Table& table, std::size_t index, std::vector<ColumnProfile>& profiles) {
    if (index < table.header.size()) {
        profiles.push_back(profile_column(table.header[index], select_column(table, index)));
    }
}

std::vector<ColumnProfile> build_profiles(const Table& table, std::size_t index, std::vector<ColumnProfile>& profiles) {
    for (; index < table.header.size(); index += 1) {
        add_profile(table, index, profiles);
    }

    return profiles;
}

std::vector<ColumnProfile> profiles_of(const Table& table) {
    std::vector<ColumnProfile> profiles;

    return build_profiles(table, 0, profiles);
}

double empty_percent(const ColumnProfile& profile) {
    return profile.rows == 0 ? 0.0 : 100.0 * static_cast<double>(profile.empty) / static_cast<double>(profile.rows);
}

std::string empty_share(const ColumnProfile& profile) {
    std::ostringstream share;
    share << std::fixed << std::setprecision(1) << empty_percent(profile) << '%';

    return share.str();
}

void print_caption(const std::string& path) {
    std::cout << "Профиль файла: " << path << '\n';
}

void print_columns(std::size_t count) {
    std::cout << "Колонок: " << count << "\n\n";
}

void print_header() {
    std::cout << std::left << std::setw(14) << "КОЛОНКА" << std::setw(8) << "ТИП" << std::right << std::setw(6) << "ПУСТО"
              << std::setw(9) << "ДОЛЯ" << std::setw(8) << "УНИК." << "  " << std::left << std::setw(12) << "MIN"
              << std::setw(12) << "MAX" << '\n';
    std::cout << std::string(76, '-') << '\n';
}

void print_profile_line(const ColumnProfile& profile) {
    std::cout << std::left << std::setw(14) << profile.name << std::setw(8) << profile.type << std::right
              << std::setw(6) << profile.empty << std::setw(9) << empty_share(profile) << std::setw(8)
              << profile.unique << "  " << std::left << std::setw(12) << profile.minimum << std::setw(12)
              << profile.maximum << '\n';
    std::cout << "  примеры: " << profile.sample << '\n';
}

void print_profiles_block(const std::vector<ColumnProfile>& profiles) {
    for (const ColumnProfile& profile : profiles) {
        print_profile_line(profile);
    }
}

void print_profiles(const std::string& path, const std::vector<ColumnProfile>& profiles) {
    print_caption(path);
    print_columns(profiles.size());
    print_header();
    print_profiles_block(profiles);
}

void report_read_error(const std::string& path) {
    std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
}

void report_empty_table() {
    std::cerr << "Ошибка: в файле нет строк с данными\n";
}

int fail_read(const std::string& path) {
    report_read_error(path);

    return 1;
}

int fail_empty() {
    report_empty_table();

    return 1;
}

int run(const std::string& path) {
    Table table;
    const bool loaded = load_table(path, table);
    const bool has_rows = !table.rows.empty();

    if (loaded && has_rows) {
        print_profiles(path, profiles_of(table));
    }

    return loaded && has_rows ? 0 : (loaded ? fail_empty() : fail_read(path));
}

}  // namespace

int main(int argc, char** argv) {
    return run(resolve_path(argc, argv));
}
