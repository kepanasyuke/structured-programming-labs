#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <sstream>
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

    const std::string candidates[] = {"data/balance.csv", "../../data/balance.csv"};
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

    while (begin < end && (value[begin] == ' ' || value[begin] == '\t')) {
        begin += 1;
    }
    while (end > begin && (value[end - 1] == ' ' || value[end - 1] == '\t')) {
        end -= 1;
    }

    return value.substr(begin, end - begin);
}

bool parse_value(const std::string& raw, double& value) {
    std::string normalized = trim(raw);
    for (char& symbol : normalized) {
        if (symbol == ',') {
            symbol = '.';
        }
    }

    char* end = nullptr;
    const double parsed = std::strtod(normalized.c_str(), &end);
    if (end == nullptr || *end != '\0' || normalized.empty()) {
        return false;
    }

    value = parsed;

    return true;
}

std::vector<SeriesPoint> read_series(const std::vector<std::string>& lines) {
    std::vector<SeriesPoint> series;

    for (std::size_t i = 1; i < lines.size(); ++i) {
        const std::size_t position = lines[i].find(kDelimiter);
        if (position == std::string::npos) {
            continue;
        }

        double value = 0.0;
        if (parse_value(lines[i].substr(position + 1), value)) {
            series.push_back({trim(lines[i].substr(0, position)), value});
        }
    }

    return series;
}

std::vector<double> extract_values(const std::vector<SeriesPoint>& series) {
    std::vector<double> values;
    values.reserve(series.size());

    for (const SeriesPoint& point : series) {
        values.push_back(point.value);
    }

    return values;
}

double mean(const std::vector<double>& values) {
    if (values.empty()) {
        return 0.0;
    }

    return std::accumulate(values.begin(), values.end(), 0.0) / static_cast<double>(values.size());
}

double standard_deviation(const std::vector<double>& values) {
    if (values.size() < 2) {
        return 0.0;
    }

    const double average = mean(values);
    double sum_of_squares = 0.0;
    for (double value : values) {
        sum_of_squares += (value - average) * (value - average);
    }

    return std::sqrt(sum_of_squares / static_cast<double>(values.size() - 1));
}

std::vector<double> moving_average(const std::vector<double>& values, std::size_t window) {
    std::vector<double> result;
    result.reserve(values.size());

    for (std::size_t i = 0; i < values.size(); ++i) {
        const std::size_t from = i + 1 > window ? i + 1 - window : 0;
        double sum = 0.0;
        for (std::size_t j = from; j <= i; ++j) {
            sum += values[j];
        }
        result.push_back(sum / static_cast<double>(i - from + 1));
    }

    return result;
}

double z_score(double value, double average, double deviation) {
    return deviation == 0.0 ? 0.0 : (value - average) / deviation;
}

std::vector<bool> find_outliers(const std::vector<double>& values, double threshold) {
    const double average = mean(values);
    const double deviation = standard_deviation(values);

    std::vector<bool> flags(values.size(), false);
    for (std::size_t i = 0; i < values.size(); ++i) {
        flags[i] = std::fabs(z_score(values[i], average, deviation)) > threshold;
    }

    return flags;
}

std::string build_bar(double value, double maximum) {
    if (maximum <= 0.0) {
        return std::string();
    }

    const int length = static_cast<int>(std::lround(kBarWidth * value / maximum));

    return std::string(static_cast<std::size_t>(length < 0 ? 0 : length), '#');
}

void print_series(const std::vector<SeriesPoint>& series, const std::vector<double>& values,
                  const std::vector<double>& averages, const std::vector<bool>& outliers) {
    const double maximum = *std::max_element(values.begin(), values.end());
    const double average = mean(values);
    const double deviation = standard_deviation(values);

    std::cout << "Окно сглаживания: " << kWindowSize << ", порог z-score: " << std::fixed << std::setprecision(1)
              << kZThreshold << "\n\n";
    std::cout << std::left << std::setw(12) << "ПЕРИОД" << std::right << std::setw(12) << "ЗНАЧЕНИЕ" << std::setw(12)
              << "СРЕДНЕЕ" << std::setw(8) << "Z" << "  " << std::left << std::setw(26) << "ДИНАМИКА\n";
    std::cout << std::string(74, '-') << '\n';

    std::size_t outlier_count = 0;
    for (std::size_t i = 0; i < series.size(); ++i) {
        const double score = z_score(values[i], average, deviation);
        const std::string mark = outliers[i] ? "  <-- ВЫБРОС" : "";
        if (outliers[i]) {
            outlier_count += 1;
        }

        std::cout << std::left << std::setw(12) << series[i].period << std::right << std::fixed << std::setprecision(0)
                  << std::setw(12) << values[i] << std::setw(12) << averages[i] << std::setprecision(2) << std::setw(8)
                  << score << "  " << std::left << std::setw(26) << build_bar(values[i], maximum) << mark << '\n';
    }

    std::cout << "\nВыбросов найдено: " << outlier_count << '\n';
}

}  // namespace

int main(int argc, char** argv) {
    const std::string path = resolve_path(argc, argv);
    std::vector<std::string> lines;

    if (!read_lines(path, lines)) {
        std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
        return 1;
    }

    const std::vector<SeriesPoint> series = read_series(lines);
    if (series.size() < kWindowSize) {
        std::cerr << "Ошибка: для сглаживания нужно минимум " << kWindowSize << " точки\n";
        return 1;
    }

    const std::vector<double> values = extract_values(series);

    print_series(series, values, moving_average(values, kWindowSize), find_outliers(values, kZThreshold));

    return 0;
}
