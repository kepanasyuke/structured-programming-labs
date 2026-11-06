#include <algorithm>
#include <cctype>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr char kFieldSeparator = '|';
constexpr std::size_t kTopSize = 5;

struct LogRecord {
    std::string task;
    int duration = 0;
    std::string status;
};

struct TaskSummary {
    std::string task;
    std::size_t runs = 0;
    int average = 0;
    int p50 = 0;
    int p95 = 0;
    int maximum = 0;
    std::size_t failures = 0;
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

std::vector<std::string> log_candidates() {
    return {"data/queries.log", "../../data/queries.log"};
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
    const std::vector<std::string> candidates = log_candidates();
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
    const std::size_t position = line.find(kFieldSeparator, start);
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

bool is_digit_symbol(char symbol) {
    return std::isdigit(static_cast<unsigned char>(symbol)) != 0;
}

void keep_digit(char symbol, std::string& digits) {
    if (is_digit_symbol(symbol)) {
        digits.push_back(symbol);
    }
}

void collect_digits(const std::string& field, std::size_t index, std::string& digits) {
    for (; index < field.size(); index += 1) {
        keep_digit(field[index], digits);
    }
}

std::string digit_string(const std::string& field) {
    std::string digits;

    collect_digits(field, 0, digits);

    return digits;
}

bool parse_duration(const std::string& field, int& duration) {
    const std::string digits = digit_string(field);
    std::istringstream stream(digits);
    duration = 0;
    const bool parsed = !digits.empty() && static_cast<bool>(stream >> duration);

    return parsed;
}

char to_upper_char(char symbol) {
    return static_cast<char>(std::toupper(static_cast<unsigned char>(symbol)));
}

void upper_byte(char& symbol) {
    symbol = to_upper_char(symbol);
}

std::string to_upper(std::string value) {
    for (char& symbol : value) {
        upper_byte(symbol);
    }

    return value;
}

std::string field_at(const std::vector<std::string>& parts, std::size_t index) {
    return index < parts.size() ? parts[index] : std::string();
}

bool has_enough_parts(const std::vector<std::string>& parts) {
    return parts.size() >= 4;
}

void assign_record(LogRecord& record, const std::vector<std::string>& parts, int duration) {
    record.task = field_at(parts, 1);
    record.duration = duration;
    record.status = to_upper(field_at(parts, 3));
}

bool parse_line(const std::string& line, LogRecord& record) {
    const std::vector<std::string> parts = split(line);
    int duration = 0;
    const bool parsed = has_enough_parts(parts) && parse_duration(field_at(parts, 2), duration);

    if (parsed) {
        assign_record(record, parts, duration);
    }

    return parsed;
}

void keep_record(const std::string& line, std::vector<LogRecord>& records) {
    LogRecord record;

    if (parse_line(line, record)) {
        records.push_back(record);
    }
}

std::vector<LogRecord> parse_log(const std::vector<std::string>& lines) {
    std::vector<LogRecord> records;

    for (const std::string& line : lines) {
        keep_record(line, records);
    }

    return records;
}

struct Point {
    std::size_t lower = 0;
    std::size_t upper = 0;
    double weight = 0.0;
};

Point locate(const std::vector<int>& values, double position) {
    Point point;
    point.lower = static_cast<std::size_t>(position);
    point.upper = point.lower + 1 < values.size() ? point.lower + 1 : point.lower;
    point.weight = position - static_cast<double>(point.lower);

    return point;
}

double interpolate(const std::vector<int>& values, double position) {
    const Point point = locate(values, position);

    return static_cast<double>(values[point.lower]) * (1.0 - point.weight) +
           static_cast<double>(values[point.upper]) * point.weight;
}

double percentile(const std::vector<int>& sorted_values, int percent) {
    const bool empty = sorted_values.empty();
    const std::size_t last = empty ? 0 : sorted_values.size() - 1;
    const double position = empty ? 0.0 : percent / 100.0 * static_cast<double>(last);

    return empty ? 0.0 : interpolate(sorted_values, position);
}

int rounded(double value) {
    return static_cast<int>(value + 0.5);
}

struct Totals {
    int sum = 0;
    std::size_t failures = 0;
};

void tally(const LogRecord& record, std::vector<int>& durations, Totals& totals) {
    durations.push_back(record.duration);
    totals.sum += record.duration;
    totals.failures += record.status == "FAIL" ? 1 : 0;
}

Totals tally_all(const std::vector<LogRecord>& records, std::size_t index, std::vector<int>& durations, Totals totals) {
    for (; index < records.size(); index += 1) {
        tally(records[index], durations, totals);
    }

    return totals;
}

void fill_percentiles(TaskSummary& summary, const std::vector<int>& durations) {
    summary.p50 = rounded(percentile(durations, 50));
    summary.p95 = rounded(percentile(durations, 95));
}

void fill_summary(TaskSummary& summary, std::vector<int>& durations, const Totals& totals) {
    std::sort(durations.begin(), durations.end());
    summary.runs = durations.size();
    summary.average = totals.sum / static_cast<int>(summary.runs);
    summary.maximum = durations.back();
    summary.failures = totals.failures;
    fill_percentiles(summary, durations);
}

TaskSummary summarize(const std::string& task, const std::vector<LogRecord>& records) {
    std::vector<int> durations;
    TaskSummary summary;
    summary.task = task;
    fill_summary(summary, durations, tally_all(records, 0, durations, Totals()));

    return summary;
}

std::map<std::string, std::vector<LogRecord>> group_by_task(const std::vector<LogRecord>& records,
                                                            std::size_t index,
                                                            std::map<std::string, std::vector<LogRecord>>& grouped) {
    for (; index < records.size(); index += 1) {
        grouped[records[index].task].push_back(records[index]);
    }

    return grouped;
}

void summarize_group(const std::pair<const std::string, std::vector<LogRecord>>& group,
                     std::vector<TaskSummary>& summaries) {
    summaries.push_back(summarize(group.first, group.second));
}

std::vector<TaskSummary> aggregate(const std::vector<LogRecord>& records) {
    std::map<std::string, std::vector<LogRecord>> grouped;
    std::vector<TaskSummary> summaries;
    const std::map<std::string, std::vector<LogRecord>> filled = group_by_task(records, 0, grouped);

    for (const auto& group : filled) {
        summarize_group(group, summaries);
    }

    return summaries;
}

bool ranks_before(const TaskSummary& left, const TaskSummary& right) {
    const bool heavier = left.p95 != right.p95 && left.p95 > right.p95;
    const bool same = left.p95 == right.p95;

    return same ? left.task < right.task : heavier;
}

void sort_by_p95(std::vector<TaskSummary>& summaries) {
    std::stable_sort(summaries.begin(), summaries.end(), ranks_before);
}

void truncate(std::vector<TaskSummary>& summaries) {
    summaries.resize(std::min(kTopSize, summaries.size()));
}

void print_log_path(const std::string& path) {
    std::cout << "Лог: " << path << '\n';
}

void print_counts(std::size_t records, std::size_t tasks) {
    std::cout << "Записей: " << records << ", задач: " << tasks << "\n\n";
}

void print_header() {
    std::cout << std::left << std::setw(22) << "ЗАДАЧА" << std::right << std::setw(6) << "ЗАП." << std::setw(8)
              << "СРЕДН." << std::setw(8) << "P50" << std::setw(8) << "P95" << std::setw(8) << "MAX" << std::setw(6)
              << "FAIL\n";
    std::cout << std::string(78, '-') << '\n';
}

void print_summary(const TaskSummary& summary) {
    std::cout << std::left << std::setw(22) << summary.task << std::right << std::setw(6) << summary.runs
              << std::setw(8) << summary.average << std::setw(8) << summary.p50 << std::setw(8) << summary.p95
              << std::setw(8) << summary.maximum << std::setw(6) << summary.failures << '\n';
}

void print_summaries(const std::vector<TaskSummary>& summaries) {
    for (const TaskSummary& summary : summaries) {
        print_summary(summary);
    }
}

void print_footer() {
    std::cout << "\nОтсортировано по p95, показаны первые " << kTopSize << '\n';
}

void print_block(const std::vector<TaskSummary>& summaries) {
    print_header();
    print_summaries(summaries);
    print_footer();
}

void print_report(const std::string& path, const std::vector<LogRecord>& records,
                  const std::vector<TaskSummary>& summaries) {
    print_log_path(path);
    print_counts(records.size(), summaries.size());
    print_block(summaries);
}

std::vector<TaskSummary> top_summaries(const std::vector<LogRecord>& records) {
    std::vector<TaskSummary> summaries = aggregate(records);
    sort_by_p95(summaries);
    truncate(summaries);

    return summaries;
}

void report_read_error(const std::string& path) {
    std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
}

void report_parse_error() {
    std::cerr << "Ошибка: не удалось разобрать ни одной записи\n";
}

int fail_read(const std::string& path) {
    report_read_error(path);

    return 1;
}

int fail_parse() {
    report_parse_error();

    return 1;
}

int failure_status(bool loaded, const std::string& path) {
    return loaded ? fail_parse() : fail_read(path);
}

void print_when_parsed(bool parsed, const std::string& path, const std::vector<LogRecord>& records) {
    if (parsed) {
        print_report(path, records, top_summaries(records));
    }
}

int run(const std::string& path) {
    std::vector<std::string> lines;
    const bool loaded = read_lines(path, lines);
    const std::vector<LogRecord> records = loaded ? parse_log(lines) : std::vector<LogRecord>();
    const bool parsed = loaded && !records.empty();

    print_when_parsed(parsed, path, records);

    return parsed ? 0 : failure_status(loaded, path);
}

}  // namespace

int main(int argc, char** argv) {
    return run(resolve_path(argc, argv));
}
