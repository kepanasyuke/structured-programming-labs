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

int month_length(int month) {
    const int lengths[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    return lengths[month - 1];
}

int days_in_month(int year, int month) {
    const bool leap_february = month == 2 && is_leap_year(year);

    return leap_february ? 29 : month_length(month);
}

int adjusted_year(const Date& date) {
    const bool before_march = date.month <= 2;

    return date.year - (before_march ? 1 : 0);
}

int era_of(int year, int divisor, int shift) {
    const bool negative = year < 0;
    const int shifted = negative ? year - shift : year;

    return shifted / divisor;
}

int shifted_month(const Date& date) {
    return date.month + (date.month > 2 ? -3 : 9);
}

int day_of_year(const Date& date) {
    const int month = shifted_month(date);

    return (153 * month + 2) / 5 + date.day - 1;
}

int day_of_era(int year, const Date& date) {
    return year * 365 + year / 4 - year / 100 + day_of_year(date);
}

int to_days(const Date& date) {
    const int year = adjusted_year(date);
    const int era = era_of(year, 400, 399);
    const int year_of_era = year - era * 400;

    return era * 146097 + day_of_era(year_of_era, date);
}

int era_from_shifted(int shifted) {
    return era_of(shifted, 146097, 146096);
}

int year_of_era_at(int day_of_era_value) {
    const int first = day_of_era_value / 1460;
    const int second = day_of_era_value / 36524;
    const int third = day_of_era_value / 146096;

    return (day_of_era_value - first + second - third) / 365;
}

int year_offset(int year_of_era) {
    return 365 * year_of_era + year_of_era / 4 - year_of_era / 100;
}

int month_index(int day_of_year_value) {
    return (5 * day_of_year_value + 2) / 153;
}

void fill_date(Date& date, int year_of_era, int era, int day_of_year_value, int month) {
    date.day = day_of_year_value - (153 * month + 2) / 5 + 1;
    date.month = month + (month < 10 ? 3 : -9);
    date.year = year_of_era + era * 400 + (date.month <= 2 ? 1 : 0);
}

struct Shifted {
    int era = 0;
    int day_of_era = 0;
};

Shifted split_shifted(int days) {
    const int era = era_from_shifted(days);

    return {era, days - era * 146097};
}

Date days_to_date(const Shifted& parts) {
    const int year_of_era = year_of_era_at(parts.day_of_era);
    const int day_of_year_value = parts.day_of_era - year_offset(year_of_era);
    const int month = month_index(day_of_year_value);
    Date date;

    fill_date(date, year_of_era, parts.era, day_of_year_value, month);

    return date;
}

Date from_days(int days) {
    return days_to_date(split_shifted(days));
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

bool is_digits(const std::string& value) {
    bool result = !value.empty();

    scan_digits(value, 0, result);

    return result;
}

bool has_date_shape(const std::string& value) {
    return value.size() == 10 && value[4] == '-' && value[7] == '-';
}

bool has_date_digits(const std::string& value) {
    const bool year = is_digits(value.substr(0, 4));
    const bool month = is_digits(value.substr(5, 2));
    const bool day = is_digits(value.substr(8, 2));

    return year && month && day;
}

int digit(char symbol) {
    return symbol - '0';
}

int to_int(const std::string& value) {
    int result = 0;

    for (char symbol : value) {
        result = result * 10 + digit(symbol);
    }

    return result;
}

bool is_valid_month(int month) {
    return month >= 1 && month <= 12;
}

bool is_valid_day(const Date& date) {
    return date.day >= 1 && date.day <= days_in_month(date.year, date.month);
}

bool is_valid_range(const Date& date) {
    const bool month_ok = is_valid_month(date.month);

    return month_ok && is_valid_day(date);
}

void assign_fields(const std::string& value, Date& date) {
    date.year = to_int(value.substr(0, 4));
    date.month = to_int(value.substr(5, 2));
    date.day = to_int(value.substr(8, 2));
}

bool parse_date(const std::string& value, Date& date) {
    const bool shaped = has_date_shape(value) && has_date_digits(value);

    if (shaped) {
        assign_fields(value, date);
    }

    return shaped && is_valid_range(date);
}

std::string padded(int value) {
    return value < 10 ? "0" + std::to_string(value) : std::to_string(value);
}

std::string year_part(const Date& date) {
    return std::to_string(date.year) + "-";
}

std::string month_part(const Date& date) {
    return padded(date.month) + "-";
}

std::string format_date(const Date& date) {
    return year_part(date) + month_part(date) + padded(date.day);
}

bool starts_month(const std::string& granularity) {
    return granularity == "month";
}

bool starts_quarter(const std::string& granularity) {
    return granularity == "quarter";
}

int quarter_month(int month) {
    return (month - 1) / 3 * 3 + 1;
}

Date align_start(const Date& date, const std::string& granularity) {
    const bool month = starts_month(granularity);
    const bool quarter = starts_quarter(granularity);

    return month ? Date{date.year, date.month, 1}
         : quarter ? Date{date.year, quarter_month(date.month), 1}
                   : Date{date.year, 1, 1};
}

Date next_month(const Date& start) {
    return start.month == 12 ? Date{start.year + 1, 1, 1} : Date{start.year, start.month + 1, 1};
}

Date next_quarter(const Date& start) {
    const int month = start.month + 3;

    return month > 12 ? Date{start.year + 1, month - 12, 1} : Date{start.year, month, 1};
}

Date next_start(const Date& start, const std::string& granularity) {
    return starts_month(granularity) ? next_month(start)
         : starts_quarter(granularity) ? next_quarter(start)
                                       : Date{start.year + 1, 1, 1};
}

Date clamp_end(const Date& candidate, const Date& to) {
    const bool beyond = to_days(candidate) > to_days(to);

    return beyond ? to : candidate;
}

Period make_period(const Date& start, const Date& to, const std::string& granularity) {
    const Date next = next_start(start, granularity);

    return {start, clamp_end(from_days(to_days(next) - 1), to)};
}

void append_period(const Date& cursor, const Date& to, const std::string& granularity, std::vector<Period>& periods) {
    periods.push_back(make_period(cursor, to, granularity));
}

std::vector<Period> generate_range(Date cursor, const Date& to, const std::string& granularity,
                                   std::vector<Period>& periods) {
    for (; to_days(cursor) <= to_days(to);) {
        append_period(cursor, to, granularity, periods);
        cursor = next_start(cursor, granularity);
    }

    return periods;
}

std::vector<Period> generate_periods(const Date& from, const Date& to, const std::string& granularity) {
    std::vector<Period> periods;

    return generate_range(align_start(from, granularity), to, granularity, periods);
}

bool overlaps(const Period& previous, const Period& current) {
    return to_days(current.start) <= to_days(previous.end);
}

std::string overlap_text(const Period& previous, const Period& current) {
    return "пересечение: " + format_date(previous.start) + " — " + format_date(previous.end) + " и " +
           format_date(current.start) + " — " + format_date(current.end);
}

void check_overlap(const std::vector<Period>& periods, std::size_t index, std::vector<std::string>& problems) {
    const bool safe = index >= 1 && index < periods.size();
    const bool hitting = safe && overlaps(periods[index - 1], periods[index]);

    if (hitting) {
        problems.push_back(overlap_text(periods[index - 1], periods[index]));
    }
}

std::vector<std::string> scan_overlaps(const std::vector<Period>& periods, std::size_t index,
                                       std::vector<std::string>& problems) {
    for (; index < periods.size(); index += 1) {
        check_overlap(periods, index, problems);
    }

    return problems;
}

std::vector<std::string> find_intersections(const std::vector<Period>& periods) {
    std::vector<std::string> problems;

    return scan_overlaps(periods, 1, problems);
}

std::string gap_text(const Period& previous, const Period& current) {
    return "разрыв между " + format_date(previous.end) + " и " + format_date(current.start);
}

void check_gap(const std::vector<Period>& periods, std::size_t index, std::vector<std::string>& problems) {
    const bool safe = index >= 1 && index < periods.size();
    const int expected = safe ? to_days(periods[index - 1].end) + 1 : 0;

    if (safe && to_days(periods[index].start) != expected) {
        problems.push_back(gap_text(periods[index - 1], periods[index]));
    }
}

std::vector<std::string> scan_gaps(const std::vector<Period>& periods, std::size_t index,
                                   std::vector<std::string>& problems) {
    for (; index < periods.size(); index += 1) {
        check_gap(periods, index, problems);
    }

    return problems;
}

std::vector<std::string> find_gaps(const std::vector<Period>& periods) {
    std::vector<std::string> problems;

    return scan_gaps(periods, 1, problems);
}

int period_days(const Period& period) {
    return to_days(period.end) - to_days(period.start) + 1;
}

int add_period(int days, const Period& period) {
    return days + period_days(period);
}

int sum_days(const std::vector<Period>& periods, std::size_t index, int days) {
    for (; index < periods.size(); index += 1) {
        days = add_period(days, periods[index]);
    }

    return days;
}

int total_days(const std::vector<Period>& periods) {
    return sum_days(periods, 0, 0);
}

void print_caption(const std::string& granularity, std::size_t count, int days) {
    std::cout << "Гранулярность: " << granularity << ", периодов: " << count << ", дней всего: " << days << "\n\n";
}

void print_header() {
    std::cout << std::left << std::setw(4) << "№" << std::setw(13) << "НАЧАЛО" << std::setw(13) << "КОНЕЦ" << std::right
              << std::setw(6) << "ДНЕЙ\n";
    std::cout << std::string(40, '-') << '\n';
}

void print_row(std::size_t index, const Period& period) {
    std::cout << std::left << std::setw(4) << (index + 1) << std::setw(13) << format_date(period.start) << std::setw(13)
              << format_date(period.end) << std::right << std::setw(6) << period_days(period) << '\n';
}

void print_rows(const std::vector<Period>& periods, std::size_t index) {
    for (; index < periods.size(); index += 1) {
        print_row(index, periods[index]);
    }
}

void print_problem(const std::string& problem) {
    std::cout << "Проблема: " << problem << '\n';
}

void print_problems(const std::vector<std::string>& problems) {
    for (const std::string& problem : problems) {
        print_problem(problem);
    }
}

void print_continuity(const std::vector<std::string>& problems) {
    const bool empty = problems.empty();

    std::cout << '\n';
    if (empty) {
        std::cout << "Периоды непрерывны и не пересекаются.\n";
    } else {
        print_problems(problems);
    }
}

void print_periods(const std::vector<Period>& periods, const std::vector<std::string>& problems,
                   const std::string& granularity) {
    print_caption(granularity, periods.size(), total_days(periods));
    print_header();
    print_rows(periods, 0);
    print_continuity(problems);
}

std::string argument(int argc, char** argv, int index, const char* fallback) {
    return argc > index ? std::string(argv[index]) : std::string(fallback);
}

std::string from_text(int argc, char** argv) {
    return argument(argc, argv, 1, "2025-11-15");
}

std::string to_text(int argc, char** argv) {
    return argument(argc, argv, 2, "2026-06-30");
}

std::string granularity_text(int argc, char** argv) {
    return argument(argc, argv, 3, "quarter");
}

bool is_known_granularity(const std::string& granularity) {
    return granularity == "month" || granularity == "quarter" || granularity == "year";
}

std::vector<std::string> gather_problems(const std::vector<Period>& periods) {
    std::vector<std::string> problems = find_intersections(periods);
    const std::vector<std::string> gaps = find_gaps(periods);
    problems.insert(problems.end(), gaps.begin(), gaps.end());

    return problems;
}

void report_bad_date() {
    std::cerr << "Ошибка: некорректная дата, ожидается формат yyyy-MM-dd\n";
}

void report_bad_granularity(const std::string& granularity) {
    std::cerr << "Ошибка: неизвестная гранулярность " << granularity << '\n';
}

void report_reversed_range() {
    std::cerr << "Ошибка: начало диапазона позже его конца\n";
}

int fail_bad_date() {
    report_bad_date();

    return 1;
}

int fail_bad_granularity(const std::string& granularity) {
    report_bad_granularity(granularity);

    return 1;
}

int fail_reversed() {
    report_reversed_range();

    return 1;
}

struct Arguments {
    Date from;
    Date to;
    std::string granularity;
    bool dates_ok = false;
    bool granularity_ok = false;
    bool range_ok = false;
};

bool parse_pair(const std::string& from, const std::string& to, Date& first, Date& second) {
    const bool first_ok = parse_date(from, first);
    const bool second_ok = parse_date(to, second);

    return first_ok && second_ok;
}

Arguments make_arguments(int argc, char** argv) {
    Arguments arguments;
    arguments.granularity = granularity_text(argc, argv);
    arguments.dates_ok = parse_pair(from_text(argc, argv), to_text(argc, argv), arguments.from, arguments.to);
    arguments.granularity_ok = is_known_granularity(arguments.granularity);
    arguments.range_ok = arguments.dates_ok && to_days(arguments.from) <= to_days(arguments.to);

    return arguments;
}

bool is_ready(const Arguments& arguments) {
    return arguments.dates_ok && arguments.granularity_ok && arguments.range_ok;
}

int failure_status(const Arguments& arguments) {
    const bool granularity_failed = arguments.dates_ok && !arguments.granularity_ok;

    return !arguments.dates_ok ? fail_bad_date()
           : granularity_failed ? fail_bad_granularity(arguments.granularity)
                                : fail_reversed();
}

std::vector<Period> periods_of(const Arguments& arguments) {
    return is_ready(arguments) ? generate_periods(arguments.from, arguments.to, arguments.granularity)
                               : std::vector<Period>();
}

int report_ready(const Arguments& arguments, const std::vector<Period>& periods) {
    const std::vector<std::string> problems = gather_problems(periods);

    print_periods(periods, problems, arguments.granularity);

    return problems.empty() ? 0 : 1;
}

int run(int argc, char** argv) {
    const Arguments arguments = make_arguments(argc, argv);
    const std::vector<Period> periods = periods_of(arguments);

    return is_ready(arguments) ? report_ready(arguments, periods) : failure_status(arguments);
}

}  // namespace

int main(int argc, char** argv) {
    return run(argc, argv);
}
