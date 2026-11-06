#include <cctype>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

namespace {

struct Date {
    int year = 1970;
    int month = 1;
    int day = 1;
};

struct Period {
    Date start;
    Date end;
};

bool is_leap_year(int year) {
    const bool divisible_by_four = year % 4 == 0;
    const bool century = year % 100 == 0;
    const bool divisible_by_four_hundred = year % 400 == 0;

    return divisible_by_four && (!century || divisible_by_four_hundred);
}

int days_in_month(int year, int month) {
    const int lengths[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    return (month == 2 && is_leap_year(year)) ? 29 : lengths[month - 1];
}

int to_days(const Date& date) {
    const int adjusted_year = date.year - (date.month <= 2 ? 1 : 0);
    const int era = (adjusted_year >= 0 ? adjusted_year : adjusted_year - 399) / 400;
    const int year_of_era = adjusted_year - era * 400;
    const int shifted_month = date.month + (date.month > 2 ? -3 : 9);
    const int day_of_year = (153 * shifted_month + 2) / 5 + date.day - 1;
    const int day_of_era = year_of_era * 365 + year_of_era / 4 - year_of_era / 100 + day_of_year;

    return era * 146097 + day_of_era;
}

Date from_days(int days) {
    const int shifted = days + 719468;
    const int era = (shifted >= 0 ? shifted : shifted - 146096) / 146097;
    const int day_of_era = shifted - era * 146097;
    const int year_of_era = (day_of_era - day_of_era / 1460 + day_of_era / 36524 - day_of_era / 146096) / 365;
    const int day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    const int shifted_month = (5 * day_of_year + 2) / 153;

    Date date;
    date.day = day_of_year - (153 * shifted_month + 2) / 5 + 1;
    date.month = shifted_month + (shifted_month < 10 ? 3 : -9);
    date.year = year_of_era + era * 400 + (date.month <= 2 ? 1 : 0);

    return date;
}

bool is_digits(const std::string& value) {
    bool result = !value.empty();
    for (char symbol : value) {
        if (std::isdigit(static_cast<unsigned char>(symbol)) == 0) {
            result = false;
        }
    }

    return result;
}

bool parse_date(const std::string& value, Date& date) {
    const bool valid = value.size() == 10 && value[4] == '-' && value[7] == '-' && is_digits(value.substr(0, 4)) &&
                       is_digits(value.substr(5, 2)) && is_digits(value.substr(8, 2));

    if (!valid) {
        return false;
    }

    date.year = std::stoi(value.substr(0, 4));
    date.month = std::stoi(value.substr(5, 2));
    date.day = std::stoi(value.substr(8, 2));

    const bool month_valid = date.month >= 1 && date.month <= 12;
    const bool day_valid = month_valid && date.day >= 1 && date.day <= days_in_month(date.year, date.month);

    return month_valid && day_valid;
}

std::string format_date(const Date& date) {
    std::string text;
    text += std::to_string(date.year);
    text += '-';
    text += (date.month < 10 ? "0" : "") + std::to_string(date.month);
    text += '-';
    text += (date.day < 10 ? "0" : "") + std::to_string(date.day);

    return text;
}

Date align_start(const Date& date, const std::string& granularity) {
    if (granularity == "month") {
        return {date.year, date.month, 1};
    }
    if (granularity == "quarter") {
        const int first_month = (date.month - 1) / 3 * 3 + 1;
        return {date.year, first_month, 1};
    }

    return {date.year, 1, 1};
}

Date next_start(const Date& start, const std::string& granularity) {
    if (granularity == "month") {
        return start.month == 12 ? Date{start.year + 1, 1, 1} : Date{start.year, start.month + 1, 1};
    }
    if (granularity == "quarter") {
        const int month = start.month + 3;
        return month > 12 ? Date{start.year + 1, month - 12, 1} : Date{start.year, month, 1};
    }

    return {start.year + 1, 1, 1};
}

std::vector<Period> generate_periods(const Date& from, const Date& to, const std::string& granularity) {
    std::vector<Period> periods;
    Date cursor = align_start(from, granularity);

    while (to_days(cursor) <= to_days(to)) {
        const Date next = next_start(cursor, granularity);
        Date end = from_days(to_days(next) - 1);

        if (to_days(end) > to_days(to)) {
            end = to;
        }

        periods.push_back({cursor, end});
        cursor = next;
    }

    return periods;
}

std::vector<std::string> find_intersections(const std::vector<Period>& periods) {
    std::vector<std::string> problems;

    for (std::size_t i = 1; i < periods.size(); ++i) {
        const Period& previous = periods[i - 1];
        const Period& current = periods[i];

        if (to_days(current.start) <= to_days(previous.end)) {
            problems.push_back("пересечение: " + format_date(previous.start) + " — " + format_date(previous.end) + " и " +
                               format_date(current.start) + " — " + format_date(current.end));
        }
    }

    return problems;
}

std::vector<std::string> find_gaps(const std::vector<Period>& periods) {
    std::vector<std::string> problems;

    for (std::size_t i = 1; i < periods.size(); ++i) {
        const int expected = to_days(periods[i - 1].end) + 1;

        if (to_days(periods[i].start) != expected) {
            problems.push_back("разрыв между " + format_date(periods[i - 1].end) + " и " + format_date(periods[i].start));
        }
    }

    return problems;
}

int total_days(const std::vector<Period>& periods) {
    int days = 0;

    for (const Period& period : periods) {
        days += to_days(period.end) - to_days(period.start) + 1;
    }

    return days;
}

void print_periods(const std::vector<Period>& periods, const std::vector<std::string>& problems, const std::string& granularity) {
    std::cout << "Гранулярность: " << granularity << ", периодов: " << periods.size()
              << ", дней всего: " << total_days(periods) << "\n\n";
    std::cout << std::left << std::setw(4) << "№" << std::setw(13) << "НАЧАЛО" << std::setw(13) << "КОНЕЦ" << std::right
              << std::setw(6) << "ДНЕЙ\n";
    std::cout << std::string(40, '-') << '\n';

    for (std::size_t i = 0; i < periods.size(); ++i) {
        const int days = to_days(periods[i].end) - to_days(periods[i].start) + 1;
        std::cout << std::left << std::setw(4) << (i + 1) << std::setw(13) << format_date(periods[i].start) << std::setw(13)
                  << format_date(periods[i].end) << std::right << std::setw(6) << days << '\n';
    }

    std::cout << '\n';
    if (problems.empty()) {
        std::cout << "Периоды непрерывны и не пересекаются.\n";
        return;
    }

    for (const std::string& problem : problems) {
        std::cout << "Проблема: " << problem << '\n';
    }
}

}  // namespace

int main(int argc, char** argv) {
    const std::string from_text = argc > 1 ? argv[1] : "2025-11-15";
    const std::string to_text = argc > 2 ? argv[2] : "2026-06-30";
    const std::string granularity = argc > 3 ? argv[3] : "quarter";

    Date from;
    Date to;

    if (!parse_date(from_text, from) || !parse_date(to_text, to)) {
        std::cerr << "Ошибка: некорректная дата, ожидается формат yyyy-MM-dd\n";
        return 1;
    }

    if (granularity != "month" && granularity != "quarter" && granularity != "year") {
        std::cerr << "Ошибка: неизвестная гранулярность " << granularity << '\n';
        return 1;
    }

    if (to_days(from) > to_days(to)) {
        std::cerr << "Ошибка: начало диапазона позже его конца\n";
        return 1;
    }

    const std::vector<Period> periods = generate_periods(from, to, granularity);
    std::vector<std::string> problems = find_intersections(periods);
    const std::vector<std::string> gaps = find_gaps(periods);
    problems.insert(problems.end(), gaps.begin(), gaps.end());

    print_periods(periods, problems, granularity);

    return problems.empty() ? 0 : 1;
}
