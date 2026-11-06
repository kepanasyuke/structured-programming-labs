#include <algorithm>
#include <chrono>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>

namespace {

constexpr std::size_t kDefaultSize = 2000;
constexpr unsigned int kDefaultSeed = 42;

struct Measurement {
    std::string name;
    double milliseconds = 0.0;
    bool correct = false;
};

std::vector<int> build_random_array(std::size_t size, unsigned int seed) {
    std::mt19937 generator(seed);
    std::uniform_int_distribution<int> distribution(0, static_cast<int>(size) * 10);

    std::vector<int> values(size);
    for (int& value : values) {
        value = distribution(generator);
    }

    return values;
}

std::vector<int> insertion_sort(const std::vector<int>& source) {
    std::vector<int> values(source);

    for (std::size_t i = 1; i < values.size(); ++i) {
        const int current = values[i];
        std::size_t j = i;

        while (j > 0 && values[j - 1] > current) {
            values[j] = values[j - 1];
            j -= 1;
        }
        values[j] = current;
    }

    return values;
}

std::vector<int> merge_lists(const std::vector<int>& left, const std::vector<int>& right) {
    std::vector<int> result;
    result.reserve(left.size() + right.size());

    std::size_t i = 0;
    std::size_t j = 0;

    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i]);
            i += 1;
        } else {
            result.push_back(right[j]);
            j += 1;
        }
    }

    result.insert(result.end(), left.begin() + static_cast<std::ptrdiff_t>(i), left.end());
    result.insert(result.end(), right.begin() + static_cast<std::ptrdiff_t>(j), right.end());

    return result;
}

std::vector<int> merge_sort(const std::vector<int>& values) {
    if (values.size() < 2) {
        return values;
    }

    const std::size_t middle = values.size() / 2;
    const std::vector<int> left(values.begin(), values.begin() + static_cast<std::ptrdiff_t>(middle));
    const std::vector<int> right(values.begin() + static_cast<std::ptrdiff_t>(middle), values.end());

    return merge_lists(merge_sort(left), merge_sort(right));
}

std::size_t partition(std::vector<int>& values, std::size_t low, std::size_t high) {
    const int pivot = values[high];
    std::size_t border = low;

    for (std::size_t i = low; i < high; ++i) {
        if (values[i] <= pivot) {
            std::swap(values[i], values[border]);
            border += 1;
        }
    }

    std::swap(values[border], values[high]);

    return border;
}

void quick_sort_range(std::vector<int>& values, std::size_t low, std::size_t high) {
    if (low >= high) {
        return;
    }

    const std::size_t pivot = partition(values, low, high);
    if (pivot > 0) {
        quick_sort_range(values, low, pivot - 1);
    }
    quick_sort_range(values, pivot + 1, high);
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

bool is_sorted(const std::vector<int>& values) {
    bool sorted = true;

    for (std::size_t i = 1; i < values.size(); ++i) {
        if (values[i - 1] > values[i]) {
            sorted = false;
        }
    }

    return sorted;
}

Measurement measure(const std::string& name, std::vector<int> (*algorithm)(const std::vector<int>&),
                    const std::vector<int>& values, const std::vector<int>& reference) {
    const auto started = std::chrono::steady_clock::now();
    const std::vector<int> result = algorithm(values);
    const auto finished = std::chrono::steady_clock::now();

    Measurement measurement;
    measurement.name = name;
    measurement.milliseconds = std::chrono::duration<double, std::milli>(finished - started).count();
    measurement.correct = (result == reference);

    return measurement;
}

void print_report(const std::vector<Measurement>& measurements, std::size_t size) {
    std::cout << "Размер массива: " << size << " элементов\n\n";
    std::cout << std::left << std::setw(16) << "АЛГОРИТМ" << std::right << std::setw(12) << "ВРЕМЯ, МС" << std::setw(12)
              << "КОРРЕКТНО\n";
    std::cout << std::string(42, '-') << '\n';

    for (const Measurement& measurement : measurements) {
        std::cout << std::left << std::setw(16) << measurement.name << std::right << std::fixed << std::setprecision(2)
                  << std::setw(12) << measurement.milliseconds << std::setw(12)
                  << (measurement.correct ? "да" : "НЕТ") << '\n';
    }
}

}  // namespace

int main(int argc, char** argv) {
    std::size_t size = kDefaultSize;

    if (argc > 1) {
        const long parsed = std::strtol(argv[1], nullptr, 10);
        if (parsed < 2) {
            std::cerr << "Ошибка: размер массива должен быть не меньше 2\n";
            return 1;
        }
        size = static_cast<std::size_t>(parsed);
    }

    const std::vector<int> values = build_random_array(size, kDefaultSeed);
    std::vector<int> reference(values);
    std::sort(reference.begin(), reference.end());

    const std::vector<Measurement> measurements = {
        measure("вставки", insertion_sort, values, reference),
        measure("слияние", merge_sort, values, reference),
        measure("быстрая", quick_sort, values, reference),
        measure("std::sort", library_sort, values, reference),
    };

    print_report(measurements, size);

    return is_sorted(reference) ? 0 : 1;
}
