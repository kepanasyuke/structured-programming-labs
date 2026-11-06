#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

namespace {

constexpr char kDelimiter = ';';
constexpr std::size_t kWindowSize = 3;
constexpr double kZThreshold = 2.0;
constexpr int kBarWidth = 24;

struct SeriesPoint {
    std::string period;
    double value = 0.0;
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

std::vector<std::string> balance_candidates() {
    return {"data/balance.csv", "../../data/balance.csv"};
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
    const std::vector<std::string> candidates = balance_candidates();
    std::vector<std::string> opened;
    const std::string fallback = pick_opened(candidates, open_candidates(candidates, opened));

    return argc > 1 ? std::string(argv[1]) : fallback;
}

bool is_blank_at(const std::string& value, std::size_t index) {
    return value[index] == ' ' || value[index] == '\t';
}

void advance_begin(const std::string& value, std::size_t& begin, std::size_t end) {
    if (begin < end && is_blank_at(value, begin)) {
        begin += 1;
    }
}

void retreat_end(const std::string& value, std::size_t begin, std::size_t& end) {
    if (end > begin && is_blank_at(value, end - 1)) {
        end -= 1;
    }
}

std::string trim_range(const std::string& value, std::size_t begin, std::size_t end) {
    for (; begin < end;) {
        advance_begin(value, begin, end);
    }
    for (; end > begin;) {
        retreat_end(value, begin, end);
    }

    return value.substr(begin, end - begin);
}

std::string trim(const std::string& value) {
    return trim_range(value, 0, value.size());
}

void replace_comma(char& symbol) {
    if (symbol == ',') {
        symbol = '.';
    }
}

std::string normalize_value(const std::string& raw) {
    std::string normalized = trim(raw);

    for (char& symbol : normalized) {
        replace_comma(symbol);
    }

    return normalized;
}

bool fully_parsed(char* end, const std::string& normalized) {
    return end != nullptr && *end == '\0' && !normalized.empty();
}

bool parse_value(const std::string& raw, double& value) {
    const std::string normalized = normalize_value(raw);
    char* end = nullptr;
    const double parsed = std::strtod(normalized.c_str(), &end);
    const bool ok = normalized.empty() ? false : fully_parsed(end, normalized);
    value = ok ? parsed : 0.0;

    return ok;
}

std::size_t separator_at(const std::string& line) {
    return line.find(kDelimiter);
}

bool has_separator(const std::string& line) {
    return separator_at(line) != std::string::npos;
}

std::string period_part(const std::string& line, std::size_t position) {
    return trim(line.substr(0, position));
}

std::string value_part(const std::string& line, std::size_t position) {
    return line.substr(position + 1);
}

void add_point(const std::string& line, std::vector<SeriesPoint>& series) {
    const std::size_t position = separator_at(line);
    double value = 0.0;

    if (has_separator(line) && parse_value(value_part(line, position), value)) {
        series.push_back({period_part(line, position), value});
    }
}

std::vector<SeriesPoint> read_series(const std::vector<std::string>& lines) {
    std::vector<SeriesPoint> series;

    for (std::size_t index = 1; index < lines.size(); index += 1) {
        add_point(lines[index], series);
    }

    return series;
}

void push_value(const SeriesPoint& point, std::vector<double>& values) {
    values.push_back(point.value);
}

std::vector<double> extract_values(const std::vector<SeriesPoint>& series) {
    std::vector<double> values;

    for (const SeriesPoint& point : series) {
        push_value(point, values);
    }

    return values;
}

double mean_or(const std::vector<double>& values, double fallback) {
    const double total = std::accumulate(values.begin(), values.end(), 0.0);

    return values.empty() ? fallback : total / static_cast<double>(values.size());
}

double mean(const std::vector<double>& values) {
    return mean_or(values, 0.0);
}

double squared_gap(double value, double average) {
    const double gap = value - average;

    return gap * gap;
}

void add_square(double value, double average, double& sum_of_squares) {
    sum_of_squares += squared_gap(value, average);
}

double square_sum(const std::vector<double>& values, double average, std::size_t index, double sum_of_squares) {
    for (; index < values.size(); index += 1) {
        add_square(values[index], average, sum_of_squares);
    }

    return sum_of_squares;
}

double variance(const std::vector<double>& values) {
    const bool too_short = values.size() < 2;
    const double average = mean(values);
    const double total = too_short ? 0.0 : square_sum(values, average, 0, 0.0);

    return too_short ? 0.0 : total / static_cast<double>(values.size() - 1);
}

double standard_deviation(const std::vector<double>& values) {
    return std::sqrt(variance(values));
}

std::size_t window_begin(std::size_t index, std::size_t window) {
    return index + 1 > window ? index + 1 - window : 0;
}

double window_sum(const std::vector<double>& values, std::size_t from, std::size_t to) {
    return std::accumulate(values.begin() + static_cast<std::ptrdiff_t>(from),
                           values.begin() + static_cast<std::ptrdiff_t>(to) + 1, 0.0);
}

double window_mean(const std::vector<double>& values, std::size_t from, std::size_t to) {
    return window_sum(values, from, to) / static_cast<double>(to - from + 1);
}

void add_average(const std::vector<double>& values, std::size_t index, std::vector<double>& result) {
    const std::size_t from = window_begin(index, kWindowSize);
    result.push_back(window_mean(values, from, index));
}

std::vector<double> moving_average(const std::vector<double>& values) {
    std::vector<double> result;

    for (std::size_t index = 0; index < values.size(); index += 1) {
        add_average(values, index, result);
    }

    return result;
}

double z_score(double value, double average, double deviation) {
    return deviation == 0.0 ? 0.0 : (value - average) / deviation;
}

bool is_outlier(double value, double threshold) {
    return std::fabs(value) > threshold;
}

void add_outlier(double value, double average, double deviation, std::vector<bool>& flags) {
    flags.push_back(is_outlier(z_score(value, average, deviation), kZThreshold));
}

std::vector<bool> find_outliers(const std::vector<double>& values) {
    const double average = mean(values);
    const double deviation = standard_deviation(values);
    std::vector<bool> flags;

    for (double value : values) {
        add_outlier(value, average, deviation, flags);
    }

    return flags;
}

int bar_length(double value, double maximum) {
    return static_cast<int>(std::lround(kBarWidth * value / maximum));
}

std::size_t positive_length(int length) {
    return static_cast<std::size_t>(length < 0 ? 0 : length);
}

std::string build_bar(double value, double maximum) {
    const bool usable = maximum > 0.0;
    const int length = usable ? bar_length(value, maximum) : 0;

    return usable ? std::string(positive_length(length), '#') : std::string();
}

std::string outlier_mark(bool outlier) {
    return outlier ? "  <-- ВЫБРОС" : "";
}

std::size_t count_flags(const std::vector<bool>& flags) {
    return static_cast<std::size_t>(std::count(flags.begin(), flags.end(), true));
}

double maximum_of(const std::vector<double>& values) {
    return values.empty() ? 0.0 : *std::max_element(values.begin(), values.end());
}

void print_caption() {
    std::cout << "Окно сглаживания: " << kWindowSize << ", порог z-score: " << std::fixed << std::setprecision(1)
              << kZThreshold << "\n\n";
}

void print_header() {
    std::cout << std::left << std::setw(12) << "ПЕРИОД" << std::right << std::setw(12) << "ЗНАЧЕНИЕ" << std::setw(12)
              << "СРЕДНЕЕ" << std::setw(8) << "Z" << "  " << std::left << std::setw(26) << "ДИНАМИКА\n";
    std::cout << std::string(74, '-') << '\n';
}

void print_row(const SeriesPoint& point, double average_value, double score, double maximum, bool outlier) {
    std::cout << std::left << std::setw(12) << point.period << std::right << std::fixed << std::setprecision(0)
              << std::setw(12) << point.value << std::setw(12) << average_value << std::setprecision(2) << std::setw(8)
              << score << "  " << std::left << std::setw(26) << build_bar(point.value, maximum)
              << outlier_mark(outlier) << '\n';
}

struct Chart {
    const std::vector<SeriesPoint>& series;
    const std::vector<double>& averages;
    const std::vector<bool>& outliers;
    double average = 0.0;
    double deviation = 0.0;
    double maximum = 0.0;
};

void print_one(const Chart& chart, std::size_t index) {
    const SeriesPoint& point = chart.series[index];

    print_row(point, chart.averages[index], z_score(point.value, chart.average, chart.deviation), chart.maximum,
              chart.outliers[index]);
}

void print_rows(const Chart& chart, std::size_t index) {
    for (; index < chart.series.size(); index += 1) {
        print_one(chart, index);
    }
}

void print_summary(std::size_t outliers_count) {
    std::cout << "\nВыбросов найдено: " << outliers_count << '\n';
}

void print_table(const Chart& chart) {
    print_header();
    print_rows(chart, 0);
    print_summary(count_flags(chart.outliers));
}

Chart make_chart(const std::vector<SeriesPoint>& series, const std::vector<double>& values,
                 const std::vector<double>& averages, const std::vector<bool>& outliers) {
    Chart chart{series, averages, outliers};
    chart.average = mean(values);
    chart.deviation = standard_deviation(values);
    chart.maximum = maximum_of(values);

    return chart;
}

void print_series(const std::vector<SeriesPoint>& series, const std::vector<double>& values,
                  const std::vector<double>& averages, const std::vector<bool>& outliers) {
    print_caption();
    print_table(make_chart(series, values, averages, outliers));
}

bool has_enough_points(const std::vector<SeriesPoint>& series) {
    return series.size() >= kWindowSize;
}

void report_read_error(const std::string& path) {
    std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
}

void report_short_series() {
    std::cerr << "Ошибка: для сглаживания нужно минимум " << kWindowSize << " точки\n";
}

int fail_read(const std::string& path) {
    report_read_error(path);

    return 1;
}

int fail_short() {
    report_short_series();

    return 1;
}

struct Input {
    std::vector<SeriesPoint> series;
    std::vector<double> values;
    bool loaded = false;
};

Input load_input(const std::string& path) {
    std::vector<std::string> lines;
    Input input;
    input.loaded = read_lines(path, lines);
    input.series = read_series(lines);
    input.values = extract_values(input.series);

    return input;
}

void print_when_ready(bool ready, const Input& input) {
    if (ready) {
        print_series(input.series, input.values, moving_average(input.values), find_outliers(input.values));
    }
}

int run(const std::string& path) {
    const Input input = load_input(path);
    const bool ready = input.loaded && has_enough_points(input.series);

    print_when_ready(ready, input);

    return ready ? 0 : (input.loaded ? fail_short() : fail_read(path));
}

}  // namespace

int main(int argc, char** argv) {
    return run(resolve_path(argc, argv));
}
