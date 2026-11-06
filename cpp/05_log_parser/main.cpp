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

    const std::string candidates[] = {"data/queries.log", "../../data/queries.log"};
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
        const std::size_t position = line.find(kFieldSeparator, start);
        if (position == std::string::npos) {
            parts.push_back(trim(line.substr(start)));
            break;
        }
        parts.push_back(trim(line.substr(start, position - start)));
        start = position + 1;
    }

    return parts;
}

bool parse_duration(const std::string& field, int& duration) {
    std::string digits;
    for (char symbol : field) {
        if (std::isdigit(static_cast<unsigned char>(symbol)) != 0) {
            digits.push_back(symbol);
        }
    }

    if (digits.empty()) {
        return false;
    }

    duration = std::stoi(digits);

    return true;
}

std::string to_upper(std::string value) {
    for (char& symbol : value) {
        symbol = static_cast<char>(std::toupper(static_cast<unsigned char>(symbol)));
    }

    return value;
}

bool parse_line(const std::string& line, LogRecord& record) {
    const std::vector<std::string> parts = split(line);
    if (parts.size() < 4) {
        return false;
    }

    int duration = 0;
    if (!parse_duration(parts[2], duration)) {
        return false;
    }

    record.task = parts[1];
    record.duration = duration;
    record.status = to_upper(parts[3]);

    return true;
}

std::vector<LogRecord> parse_log(const std::vector<std::string>& lines) {
    std::vector<LogRecord> records;

    for (const std::string& line : lines) {
        LogRecord record;
        if (parse_line(line, record)) {
            records.push_back(record);
        }
    }

    return records;
}

double percentile(const std::vector<int>& sorted_values, int percent) {
    if (sorted_values.empty()) {
        return 0.0;
    }

    const double position = percent / 100.0 * static_cast<double>(sorted_values.size() - 1);
    const std::size_t lower = static_cast<std::size_t>(position);
    const std::size_t upper = lower + 1 < sorted_values.size() ? lower + 1 : lower;
    const double weight = position - static_cast<double>(lower);

    return static_cast<double>(sorted_values[lower]) * (1.0 - weight) + static_cast<double>(sorted_values[upper]) * weight;
}

TaskSummary summarize(const std::string& task, const std::vector<LogRecord>& records) {
    std::vector<int> durations;
    durations.reserve(records.size());

    TaskSummary summary;
    summary.task = task;
    summary.runs = records.size();

    int total = 0;
    for (const LogRecord& record : records) {
        durations.push_back(record.duration);
        total += record.duration;
        if (record.status == "FAIL") {
            summary.failures += 1;
        }
    }

    std::sort(durations.begin(), durations.end());
    summary.average = total / static_cast<int>(records.size());
    summary.maximum = durations.back();
    summary.p50 = static_cast<int>(percentile(durations, 50) + 0.5);
    summary.p95 = static_cast<int>(percentile(durations, 95) + 0.5);

    return summary;
}

std::vector<TaskSummary> aggregate(const std::vector<LogRecord>& records) {
    std::map<std::string, std::vector<LogRecord>> grouped;

    for (const LogRecord& record : records) {
        grouped[record.task].push_back(record);
    }

    std::vector<TaskSummary> summaries;
    summaries.reserve(grouped.size());

    for (const auto& group : grouped) {
        summaries.push_back(summarize(group.first, group.second));
    }

    return summaries;
}

void sort_by_p95(std::vector<TaskSummary>& summaries) {
    std::stable_sort(summaries.begin(), summaries.end(), [](const TaskSummary& left, const TaskSummary& right) {
        if (left.p95 != right.p95) {
            return left.p95 > right.p95;
        }
        return left.task < right.task;
    });
}

void print_report(const std::string& path, const std::vector<LogRecord>& records, std::vector<TaskSummary> summaries) {
    std::cout << "Лог: " << path << '\n';
    std::cout << "Записей: " << records.size() << ", задач: " << summaries.size() << "\n\n";

    sort_by_p95(summaries);
    if (summaries.size() > kTopSize) {
        summaries.resize(kTopSize);
    }

    std::cout << std::left << std::setw(22) << "ЗАДАЧА" << std::right << std::setw(6) << "ЗАП." << std::setw(8)
              << "СРЕДН." << std::setw(8) << "P50" << std::setw(8) << "P95" << std::setw(8) << "MAX" << std::setw(6)
              << "FAIL\n";
    std::cout << std::string(78, '-') << '\n';

    for (const TaskSummary& summary : summaries) {
        std::cout << std::left << std::setw(22) << summary.task << std::right << std::setw(6) << summary.runs
                  << std::setw(8) << summary.average << std::setw(8) << summary.p50 << std::setw(8) << summary.p95
                  << std::setw(8) << summary.maximum << std::setw(6) << summary.failures << '\n';
    }

    std::cout << "\nОтсортировано по p95, показаны первые " << kTopSize << '\n';
}

}  // namespace

int main(int argc, char** argv) {
    const std::string path = resolve_path(argc, argv);
    std::vector<std::string> lines;

    if (!read_lines(path, lines)) {
        std::cerr << "Ошибка: не удалось прочитать файл " << path << '\n';
        return 1;
    }

    const std::vector<LogRecord> records = parse_log(lines);
    if (records.empty()) {
        std::cerr << "Ошибка: не удалось разобрать ни одной записи\n";
        return 1;
    }

    print_report(path, records, aggregate(records));

    return 0;
}
