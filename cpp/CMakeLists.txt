cmake_minimum_required(VERSION 3.16)
project(structured_programming_labs_cpp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (MSVC)
    add_compile_options(/W4 /utf-8)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

set(LAB_TARGETS
    01_text_stats
    02_csv_profiler
    03_rpn_calc
    04_dq_checks
    05_log_parser
    06_sort_bench
    07_date_periods
    08_moving_average
)

foreach(target IN LISTS LAB_TARGETS)
    add_executable(${target} ${target}/main.cpp)
    target_compile_features(${target} PRIVATE cxx_std_17)
endforeach()
