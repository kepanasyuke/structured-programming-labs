#include <algorithm>
#include <chrono>
#include <cstddef>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <random>
#include <string>
#include <vector>

namespace {

constexpr std::size_t kDefaultSize = 2000;
constexpr unsigned int kDefaultSeed = 42;
constexpr long kMinimumSize = 2;

struct Measurement {
    std::string name;
    double milliseconds = 0.0;
    bool correct = false;
};

using SortFunction = std::vector<int> (*)(const std::vector<int>&);

void fill_random(std::uniform_int_distribution<int>& distribution, std::mt19937& generator, int& value) {
    value = distribution(generator);
}

void fill_values(std::vector<int>& values, std::uniform_int_distribution<int>& distribution, std::mt19937& generator) {
    for (int& value : values) {
        fill_random(distribution, generator, value);
    }
}

std::vector<int> build_random_array(std::size_t size, unsigned int seed) {
    std::mt19937 generator(seed);
    std::uniform_int_distribution<int> distribution(0, static_cast<int>(size) * 10);
    std::vector<int> values(size);
    fill_values(values, distribution, generator);

    return values;
}

bool is_out_of_place(const std::vector<int>& values, std::size_t index, int current) {
    return index > 0 && values[index - 1] > current;
}

void place_element(std::vector<int>& values, std::size_t index) {
    const int current = values[index];
    std::size_t position = index;

    for (; is_out_of_place(values, position, current); position -= 1) {
        values[position] = values[position - 1];
    }
    values[position] = current;
}

void insertion_pass(std::vector<int>& values) {
    for (std::size_t index = 1; index < values.size(); index += 1) {
        place_element(values, index);
    }
}

std::vector<int> insertion_sort(const std::vector<int>& source) {
    std::vector<int> values(source);
    insertion_pass(values);

    return values;
}

struct Cursor {
    std::size_t left = 0;
    std::size_t right = 0;
};

bool left_is_next(const std::vector<int>& left, const std::vector<int>& right, const Cursor& cursor) {
    return left[cursor.left] <= right[cursor.right];
}

void take_left(const std::vector<int>& left, Cursor& cursor, std::vector<int>& result) {
    result.push_back(left[cursor.left]);
    cursor.left += 1;
}

void take_right(const std::vector<int>& right, Cursor& cursor, std::vector<int>& result) {
    result.push_back(right[cursor.right]);
    cursor.right += 1;
}

void merge_step(const std::vector<int>& left, const std::vector<int>& right, Cursor& cursor, std::vector<int>& result) {
    if (left_is_next(left, right, cursor)) {
        take_left(left, cursor, result);
    } else {
        take_right(right, cursor, result);
    }
}

void merge_loop(const std::vector<int>& left, const std::vector<int>& right, Cursor& cursor, std::vector<int>& result) {
    for (; cursor.left < left.size() && cursor.right < right.size();) {
        merge_step(left, right, cursor, result);
    }
}

std::ptrdiff_t to_index(std::size_t value) {
    return static_cast<std::ptrdiff_t>(value);
}

void append_rest(const std::vector<int>& source, std::size_t from, std::vector<int>& result) {
    result.insert(result.end(), source.begin() + to_index(from), source.end());
}

std::vector<int> merge_tails(const std::vector<int>& left, const std::vector<int>& right, const Cursor& cursor,
                             std::vector<int> result) {
    append_rest(left, cursor.left, result);
    append_rest(right, cursor.right, result);

    return result;
}

std::vector<int> merge_lists(const std::vector<int>& left, const std::vector<int>& right) {
    std::vector<int> result;
    Cursor cursor;
    result.reserve(left.size() + right.size());
    merge_loop(left, right, cursor, result);

    return merge_tails(left, right, cursor, result);
}

std::vector<int> head(const std::vector<int>& values, std::size_t middle) {
    return std::vector<int>(values.begin(), values.begin() + to_index(middle));
}

std::vector<int> tail(const std::vector<int>& values, std::size_t middle) {
    return std::vector<int>(values.begin() + to_index(middle), values.end());
}

std::vector<int> merge_sort(const std::vector<int>& values) {
    const std::size_t middle = values.size() / 2;
    const bool trivial = values.size() < 2;

    return trivial ? values : merge_lists(merge_sort(head(values, middle)), merge_sort(tail(values, middle)));
}

void swap_pivot(std::vector<int>& values, std::size_t border, std::size_t high) {
    std::swap(values[border], values[high]);
}

std::size_t partition_step(std::vector<int>& values, std::size_t& border, std::size_t index, int pivot) {
    if (values[index] <= pivot) {
        std::swap(values[index], values[border]);
        border += 1;
    }

    return border;
}

std::size_t partition(std::vector<int>& values, std::size_t low, std::size_t high) {
    const int pivot = values[high];
    std::size_t border = low;

    for (std::size_t index = low; index < high; index += 1) {
        partition_step(values, border, index, pivot);
    }
    swap_pivot(values, border, high);

    return border;
}

void sort_higher(std::vector<int>& values, std::size_t pivot, std::size_t high) {
    if (pivot + 1 <= high) {
        quick_sort_range(values, pivot + 1, high);
    }
}

void quick_sort_range(std::vector<int>& values, std::size_t low, std::size_t high) {
    if (low < high) {
        const std::size_t pivot = partition(values, low, high);
        if (pivot > 0) {
            quick_sort_range(values, low, pivot - 1);
        }
        sort_higher(values, pivot, high);
    }
}

std::vector<int> quick_sort(const std::vector<int>& source) {
    std::vector<int> values(source);
    if (!values.empty()) {
        quick_sort_range(values, 0, values.size() - 1);
    }

    return values;
}

std::vector<int> library_sort(const std::vector<int>& source) {
    std::vector<int> values(source);
    std::sort(values.begin(), values.end());

    return values;
}

bool is_out_of_order(const std::vector<int>& values, std::size_t index) {
    return values[index - 1] > values[index];
}

void mark_out_of_order(const std::vector<int>& values, std::size_t index, bool& sorted) {
    if (index < values.size() && is_out_of_order(values, index)) {
        sorted = false;
    }
}

bool is_sorted(const std::vector<int>& values) {
    bool sorted = true;

    for (std::size_t index = 1; index < values.size(); index += 1) {
        mark_out_of_order(values, index, sorted);
    }

    return sorted;
}

using Clock = std::chrono::steady_clock;

std::chrono::time_point<Clock> now() {
    return Clock::now();
}

double elapsed_ms(const std::chrono::time_point<Clock>& from, const std::chrono::time_point<Clock>& to) {
    return std::chrono::duration<double, std::milli>(to - from).count();
}

Measurement make_measurement(const std::string& name, const std::vector<int>& result, const std::vector<int>& reference,
                             double milliseconds) {
    Measurement measurement;
    measurement.name = name;
    measurement.milliseconds = milliseconds;
    measurement.correct = result == reference;

    return measurement;
}

Measurement measure(const std::string& name, SortFunction algorithm, const std::vector<int>& values,
                    const std::vector<int>& reference) {
    const std::chrono::time_point<Clock> started = now();
    const std::vector<int> result = algorithm(values);
    const std::chrono::time_point<Clock> finished = now();

    return make_measurement(name, result, reference, elapsed_ms(started, finished));
}

std::vector<int> sorted_copy(const std::vector<int>& values) {
    std::vector<int> reference(values);
    std::sort(reference.begin(), reference.end());

    return reference;
}

std::vector<Measurement> run_all(const std::vector<int>& values, const std::vector<int>& reference) {
    return {
        measure("вставки", insertion_sort, values, reference),
        measure("слияние", merge_sort, values, reference),
        measure("быстрая", quick_sort, values, reference),
        measure("std::sort", library_sort, values, reference),
    };
}

void print_size(std::size_t size) {
    std::cout << "Размер массива: " << size << " элементов\n\n";
}

void print_header() {
    std::cout << std::left << std::setw(16) << "АЛГОРИТМ" << std::right << std::setw(12) << "ВРЕМЯ, МС" << std::setw(12)
              << "КОРРЕКТНО\n";
    std::cout << std::string(42, '-') << '\n';
}

const char* correctness_text(bool correct) {
    return correct ? "да" : "НЕТ";
}

void print_measurement(const Measurement& measurement) {
    std::cout << std::left << std::setw(16) << measurement.name << std::right << std::fixed << std::setprecision(2)
              << std::setw(12) << measurement.milliseconds << std::setw(12) << correctness_text(measurement.correct)
              << '\n';
}

void print_measurements(const std::vector<Measurement>& measurements) {
    for (const Measurement& measurement : measurements) {
        print_measurement(measurement);
    }
}

void print_report(const std::vector<Measurement>& measurements, std::size_t size) {
    print_size(size);
    print_header();
    print_measurements(measurements);
}

std::size_t requested_size(int argc, char** argv, bool& ok) {
    const bool overridden = argc > 1;
    const long parsed = overridden ? std::strtol(argv[1], nullptr, 10) : static_cast<long>(kDefaultSize);
    ok = parsed >= kMinimumSize;

    return ok && overridden ? static_cast<std::size_t>(parsed) : kDefaultSize;
}

void report_size_error() {
    std::cerr << "Ошибка: размер массива должен быть не меньше 2\n";
}

int status_of(bool ok, const std::vector<int>& reference) {
    return ok && is_sorted(reference) ? 0 : 1;
}

void print_when_ok(bool ok, const std::vector<int>& values, const std::vector<int>& reference, std::size_t size) {
    if (ok) {
        print_report(run_all(values, reference), size);
    } else {
        report_size_error();
    }
}

int run(int argc, char** argv) {
    bool ok = true;
    const std::size_t size = requested_size(argc, argv, ok);
    const std::vector<int> values = build_random_array(size, kDefaultSeed);
    const std::vector<int> reference = sorted_copy(values);

    print_when_ok(ok, values, reference, size);

    return status_of(ok, reference);
}

}  // namespace

int main(int argc, char** argv) {
    return run(argc, argv);
}
