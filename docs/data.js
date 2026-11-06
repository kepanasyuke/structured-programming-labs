window.LABS = {
  "projects": [
    {
      "number": 1,
      "task": "text-stats",
      "title": "Частотный анализ текста",
      "purpose": "топ-N слов, стоп-слова",
      "variants": {
        "php": {
          "path": "php/01-text-stats/index.php",
          "lines": 279,
          "functions": [
            {
              "name": "file_is_readable",
              "line": 11,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "load_file_text",
              "line": 16,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "mark_stop_word",
              "line": 21,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "split_tokens",
              "line": 28,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "load_stop_words",
              "line": 33,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "index_words",
              "line": 38,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "is_short_word",
              "line": 49,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_skipped_word",
              "line": 54,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "keep_word",
              "line": 59,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "match_words",
              "line": 64,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "to_words",
              "line": 71,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "flatten_words",
              "line": 76,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "count_word",
              "line": 81,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "count_words",
              "line": 88,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "sorted_word_keys",
              "line": 98,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "sorted_word_values",
              "line": 103,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "sort_by_frequency",
              "line": 108,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "clamp_size",
              "line": 113,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_top",
              "line": 118,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "top_words",
              "line": 128,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "unique_count",
              "line": 137,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_header",
              "line": 142,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_characters",
              "line": 147,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_word_count",
              "line": 152,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_unique_count",
              "line": 157,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 162,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 167,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_top_row",
              "line": 172,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_top_rows",
              "line": 177,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_summary",
              "line": 184,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "print_table",
              "line": 192,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 199,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "read_path",
              "line": 205,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "read_stop_path",
              "line": 210,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "print_read_error",
              "line": 215,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_empty_error",
              "line": 220,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "report_read_error",
              "line": 225,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_words_error",
              "line": 232,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_success",
              "line": 239,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "load_words",
              "line": 246,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "prepare_source",
              "line": 251,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "exit_code",
              "line": 258,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_main",
              "line": 263,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 270,
              "size": 5,
              "role": "вход"
            }
          ],
          "count": 44
        },
        "csharp": {
          "path": "csharp/TextStats/Program.cs",
          "lines": 213,
          "functions": [
            {
              "name": "Main",
              "line": 17,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "Report",
              "line": 28,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "PrintFileError",
              "line": 36,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintWordsError",
              "line": 44,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "TryReadText",
              "line": 60,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "TryFilterWords",
              "line": 67,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "LoadStopWords",
              "line": 78,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "ForEachAt",
              "line": 91,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "SplitWords",
              "line": 100,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddIfSignificant",
              "line": 112,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "IsSignificant",
              "line": 114,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "CountWords",
              "line": 123,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "Increment",
              "line": 135,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "SelectTop",
              "line": 141,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "CollectFirst",
              "line": 156,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "CompareByFrequency",
              "line": 169,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PrintReport",
              "line": 176,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "PrintHeader",
              "line": 184,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "PrintTop",
              "line": 193,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "ForEachTopAt",
              "line": 204,
              "size": 3,
              "role": "шаг"
            }
          ],
          "count": 20
        },
        "cpp": {
          "path": "cpp/01_text_stats/main.cpp",
          "lines": 419,
          "functions": [
            {
              "name": "is_lowercase_candidate",
              "line": 19,
              "size": 5,
              "role": "проверка"
            },
            {
              "name": "is_lower_a",
              "line": 28,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_lower_p",
              "line": 32,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_lower_yo",
              "line": 36,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "push_pair",
              "line": 40,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "push_lower_a",
              "line": 45,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "push_lower_p",
              "line": 49,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "push_lower_yo",
              "line": 53,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "push_lowered",
              "line": 57,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "is_lower_a",
              "line": 58,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_lower_p",
              "line": 60,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "has_next",
              "line": 67,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_pair_start",
              "line": 71,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "copy_pair",
              "line": 75,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "copy_single",
              "line": 80,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "copy_ascii",
              "line": 85,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "lower_cyrillic_pair",
              "line": 90,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_ascii",
              "line": 95,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "copy_tail",
              "line": 99,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "lower_non_ascii",
              "line": 103,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "is_pair_start",
              "line": 104,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "has_next",
              "line": 106,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "lower_step",
              "line": 113,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_ascii",
              "line": 114,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "lower_until_end",
              "line": 121,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "lowercase_utf8",
              "line": 127,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "is_word_byte",
              "line": 136,
              "size": 3,
              "role": "проверка"
            },
            {
              "name": "flush_word",
              "line": 143,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "feed_byte",
              "line": 150,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_word_byte",
              "line": 151,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "split_lowered",
              "line": 159,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "split_words",
              "line": 168,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "utf8_length",
              "line": 175,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "fill_from_streambuf",
              "line": 187,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "read_file",
              "line": 193,
              "size": 5,
              "role": "чтение"
            },
            {
              "name": "probe_file",
              "line": 204,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "path_candidates",
              "line": 210,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_opened",
              "line": 214,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "probe_file",
              "line": 216,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "open_candidates",
              "line": 223,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "first_or_default",
              "line": 231,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "resolve_path",
              "line": 239,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_significant_word",
              "line": 243,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "keep_word",
              "line": 247,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_significant_word",
              "line": 248,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "filter_words",
              "line": 253,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "insert_stream_words",
              "line": 263,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "load_stop_words",
              "line": 271,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "count_words",
              "line": 281,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "ranks_before",
              "line": 291,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "top_words",
              "line": 298,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "print_caption",
              "line": 306,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_characters",
              "line": 310,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_word_count",
              "line": 314,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_unique_count",
              "line": 318,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_word_table_header",
              "line": 322,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_rows_caption",
              "line": 326,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "word_padding",
              "line": 330,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_row",
              "line": 334,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_each_entry",
              "line": 338,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_head",
              "line": 344,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 353,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "report_read_error",
              "line": 358,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_empty_text",
              "line": 362,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_read_and_fail",
              "line": 366,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_empty_and_fail",
              "line": 372,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "failure_status",
              "line": 378,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_when_ready",
              "line": 390,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "prepare",
              "line": 396,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "run",
              "line": 406,
              "size": 4,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 417,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 71
        }
      }
    },
    {
      "number": 2,
      "task": "csv-profiler",
      "title": "Профиль CSV",
      "purpose": "типы, пустые значения, уникальность, min/max",
      "variants": {
        "php": {
          "path": "php/02-csv-profiler/index.php",
          "lines": 392,
          "functions": [
            {
              "name": "file_is_readable",
              "line": 18,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_blank_row",
              "line": 23,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "keep_row",
              "line": 28,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "append_row",
              "line": 33,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "read_stream_rows",
              "line": 38,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "build_table",
              "line": 50,
              "size": 3,
              "role": "сборка"
            },
            {
              "name": "open_csv",
              "line": 58,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "read_csv",
              "line": 70,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "table_reason",
              "line": 78,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "error_messages",
              "line": 86,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "error_suffix",
              "line": 95,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "error_text",
              "line": 100,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "column_values",
              "line": 107,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_int_value",
              "line": 112,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_float_value",
              "line": 117,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_calendar_date",
              "line": 122,
              "size": 2,
              "role": "проверка"
            },
            {
              "name": "is_date_value",
              "line": 129,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_filled",
              "line": 134,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "filled_values",
              "line": 139,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_all_int",
              "line": 144,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_numeric_value",
              "line": 149,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_all_numeric",
              "line": 154,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_all_date",
              "line": 159,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "detect_type",
              "line": 164,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "pick_type",
              "line": 171,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "numeric_type",
              "line": 179,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_date_kind",
              "line": 184,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_numeric_type",
              "line": 189,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "cast_value",
              "line": 194,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "numeric_range",
              "line": 199,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "date_range",
              "line": 206,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "sorted_copy",
              "line": 213,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "profile_range",
              "line": 220,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "sample_values",
              "line": 233,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "count_filled",
              "line": 238,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "count_empty",
              "line": 243,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "count_unique",
              "line": 248,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "profile_head",
              "line": 253,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "add_counts",
              "line": 260,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_range",
              "line": 265,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_sample",
              "line": 270,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "profile_column",
              "line": 275,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "build_column",
              "line": 283,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "build_columns",
              "line": 288,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "build_profile",
              "line": 299,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "empty_share",
              "line": 304,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_line",
              "line": 309,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_title",
              "line": 314,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_column_count",
              "line": 319,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 324,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_profile_row",
              "line": 329,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_sample",
              "line": 335,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_stats",
              "line": 340,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_profiles",
              "line": 346,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_profile",
              "line": 353,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "read_path",
              "line": 361,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "report_state",
              "line": 366,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_table",
              "line": 371,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "is_failure",
              "line": 378,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "main",
              "line": 383,
              "size": 5,
              "role": "вход"
            }
          ],
          "count": 60
        },
        "csharp": {
          "path": "csharp/CsvProfiler/Program.cs",
          "lines": 331,
          "functions": [
            {
              "name": "Main",
              "line": 19,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "PrintReadError",
              "line": 34,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintReport",
              "line": 47,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "TryReadCsv",
              "line": 54,
              "size": 4,
              "role": "чтение"
            },
            {
              "name": "CollectRows",
              "line": 64,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddRow",
              "line": 76,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "TrimPartsFrom",
              "line": 88,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "Proceed",
              "line": 108,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "AppendColumn",
              "line": 122,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "AppendFilled",
              "line": 136,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "Describe",
              "line": 149,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "DescribeWith",
              "line": 156,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "TakeDistinct",
              "line": 167,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "AppendFirst",
              "line": 181,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "BuildDistinct",
              "line": 188,
              "size": 4,
              "role": "сборка"
            },
            {
              "name": "AddDistinct",
              "line": 200,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "FillRange",
              "line": 237,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "FillNumericRange",
              "line": 254,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "FillDateRange",
              "line": 262,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "PrintProfiles",
              "line": 272,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintHeader",
              "line": 278,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintTableHead",
              "line": 286,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintProfile",
              "line": 292,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "FormatRow",
              "line": 298,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "ColumnProfile",
              "line": 307,
              "size": 5,
              "role": "шаг"
            }
          ],
          "count": 25
        },
        "cpp": {
          "path": "cpp/02_csv_profiler/main.cpp",
          "lines": 555,
          "functions": [
            {
              "name": "strip_carriage_return",
              "line": 32,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "keep_line",
              "line": 40,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "read_into",
              "line": 46,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "read_lines",
              "line": 54,
              "size": 5,
              "role": "чтение"
            },
            {
              "name": "probe_file",
              "line": 65,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "client_candidates",
              "line": 71,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_opened",
              "line": 75,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "probe_file",
              "line": 76,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "open_candidates",
              "line": 81,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "pick_opened",
              "line": 89,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "resolve_path",
              "line": 93,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 101,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "advance_begin",
              "line": 105,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 106,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "retreat_end",
              "line": 111,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 112,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_leading_space",
              "line": 117,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_trailing_space",
              "line": 121,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "trim_range",
              "line": 125,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "trim",
              "line": 136,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "next_position",
              "line": 140,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "piece",
              "line": 144,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "split_step",
              "line": 151,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "split",
              "line": 158,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "append_row",
              "line": 170,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fill_rows",
              "line": 176,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "load_table",
              "line": 182,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "is_sign",
              "line": 194,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_digit_char",
              "line": 198,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "number_start",
              "line": 202,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_digit",
              "line": 206,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_digit_char",
              "line": 207,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "scan_digits",
              "line": 212,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_integer",
              "line": 218,
              "size": 4,
              "role": "проверка"
            },
            {
              "name": "is_decimal",
              "line": 227,
              "size": 3,
              "role": "проверка"
            },
            {
              "name": "has_date_shape",
              "line": 234,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "count_digits",
              "line": 238,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_iso_date",
              "line": 247,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "tally_value",
              "line": 257,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "tally_all",
              "line": 265,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "classify",
              "line": 275,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "detect_type",
              "line": 285,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "cell_at",
              "line": 289,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_cell",
              "line": 293,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "select_column",
              "line": 297,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "keep_filled",
              "line": 307,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "only_filled",
              "line": 313,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_numeric_type",
              "line": 323,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "to_double",
              "line": 327,
              "size": 6,
              "role": "преобразование"
            },
            {
              "name": "collect_numbers",
              "line": 337,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "to_numbers",
              "line": 343,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "format_two",
              "line": 353,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "fill_numeric_range",
              "line": 360,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "fill_text_range",
              "line": 368,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fill_range",
              "line": 373,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_numeric_type",
              "line": 374,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "sample_is_full",
              "line": 381,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_sample",
              "line": 385,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "sample_is_full",
              "line": 386,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "sample_set",
              "line": 391,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "append_with_separator",
              "line": 401,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "build_sample",
              "line": 408,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "unique_count",
              "line": 419,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "set_counts",
              "line": 423,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "assign_basic",
              "line": 429,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "filled_profile",
              "line": 436,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "profile_column",
              "line": 445,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "add_profile",
              "line": 453,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "build_profiles",
              "line": 459,
              "size": 3,
              "role": "сборка"
            },
            {
              "name": "profiles_of",
              "line": 467,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "empty_percent",
              "line": 473,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "empty_share",
              "line": 477,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "print_caption",
              "line": 484,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_columns",
              "line": 488,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_header",
              "line": 492,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "print_profile_line",
              "line": 499,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "print_profiles_block",
              "line": 507,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_profiles",
              "line": 513,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "report_read_error",
              "line": 519,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_empty_table",
              "line": 523,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fail_read",
              "line": 527,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fail_empty",
              "line": 533,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "run",
              "line": 539,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 553,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 84
        }
      }
    },
    {
      "number": 3,
      "task": "rpn-calc",
      "title": "Калькулятор ОПЗ",
      "purpose": "выражение → обратная польская запись → результат",
      "variants": {
        "php": {
          "path": "php/03-rpn-calc/index.php",
          "lines": 374,
          "functions": [
            {
              "name": "tokenize",
              "line": 17,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_operator",
              "line": 24,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_number",
              "line": 29,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "should_pop_before",
              "line": 34,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_number",
              "line": 39,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "is_open_bracket",
              "line": 44,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_close_bracket",
              "line": 49,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_plain_token",
              "line": 54,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "push_text",
              "line": 59,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "pop_last",
              "line": 66,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "pop_top",
              "line": 73,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "drain_until_bracket",
              "line": 78,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "close_bracket",
              "line": 88,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "pop_by_precedence",
              "line": 96,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "push_operator",
              "line": 106,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "step_shunting",
              "line": 113,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "route_token",
              "line": 121,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "route_number",
              "line": 126,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "route_bracket",
              "line": 139,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "scan_tokens",
              "line": 152,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "flush_stack",
              "line": 162,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "pick_error",
              "line": 173,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_rpn",
              "line": 178,
              "size": 3,
              "role": "преобразование"
            },
            {
              "name": "apply_plus",
              "line": 186,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "apply_minus",
              "line": 191,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "apply_multiply",
              "line": 196,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "apply_divide",
              "line": 201,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "compute",
              "line": 206,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "is_zero_division",
              "line": 219,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "push_value",
              "line": 224,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "pop_two",
              "line": 231,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "has_operand",
              "line": 239,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "step_rpn",
              "line": 244,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "route_rpn",
              "line": 252,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "apply_rpn_operator",
              "line": 265,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "scan_rpn",
              "line": 273,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "evaluate_rpn",
              "line": 283,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "format_number",
              "line": 291,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_expression",
              "line": 296,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_rpn",
              "line": 301,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_value",
              "line": 306,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_result",
              "line": 311,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "read_expression",
              "line": 318,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "report_error",
              "line": 323,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_empty_rpn",
              "line": 328,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "solve_expression",
              "line": 333,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "describe_failure",
              "line": 341,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 351,
              "size": 5,
              "role": "вход"
            },
            {
              "name": "report_failure",
              "line": 361,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_result",
              "line": 368,
              "size": 2,
              "role": "шаг"
            }
          ],
          "count": 50
        },
        "csharp": {
          "path": "csharp/RpnCalc/Program.cs",
          "lines": 274,
          "functions": [
            {
              "name": "Run",
              "line": 17,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "Weight",
              "line": 29,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PrintError",
              "line": 36,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "CollectTokens",
              "line": 46,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "TryToRpn",
              "line": 62,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "TryToRpnAt",
              "line": 70,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AcceptNumber",
              "line": 85,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "AcceptOpen",
              "line": 92,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "AcceptOperator",
              "line": 105,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "Reject",
              "line": 112,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PopUntilBracket",
              "line": 119,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "PopOne",
              "line": 131,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "PushOperator",
              "line": 147,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "IsReady",
              "line": 149,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "FlushStack",
              "line": 157,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "DrainOne",
              "line": 171,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "TryEvaluate",
              "line": 184,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "EvaluateAt",
              "line": 196,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "IsSingleResult",
              "line": 208,
              "size": 3,
              "role": "проверка"
            },
            {
              "name": "PushValue",
              "line": 220,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "RejectOperand",
              "line": 229,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "TryApply",
              "line": 236,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "PushResult",
              "line": 251,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "ReportDivisionError",
              "line": 258,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PrintResult",
              "line": 265,
              "size": 4,
              "role": "печать"
            }
          ],
          "count": 25
        },
        "cpp": {
          "path": "cpp/03_rpn_calc/main.cpp",
          "lines": 525,
          "functions": [
            {
              "name": "precedence",
              "line": 15,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "is_operator",
              "line": 22,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_digit_symbol",
              "line": 26,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_separator_symbol",
              "line": 30,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_operator_symbol",
              "line": 34,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_space_symbol",
              "line": 38,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_bracket_symbol",
              "line": 42,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_token_separator",
              "line": 46,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "mark_digit",
              "line": 56,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "mark_separator",
              "line": 60,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "mark_invalid",
              "line": 64,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "inspect_symbol",
              "line": 68,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 69,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_separator_symbol",
              "line": 71,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "scan_symbol",
              "line": 78,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "scan_number",
              "line": 84,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "signed_start",
              "line": 92,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_number",
              "line": 98,
              "size": 3,
              "role": "проверка"
            },
            {
              "name": "close_token",
              "line": 105,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "push_symbol",
              "line": 112,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "feed_separator",
              "line": 116,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "tokenize_symbol",
              "line": 121,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_token_separator",
              "line": 122,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "tokenize_range",
              "line": 130,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "tokenize",
              "line": 136,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "pop_top",
              "line": 145,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "pop_until_bracket",
              "line": 154,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "should_pop",
              "line": 164,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "push_operator",
              "line": 172,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "fail_rpn",
              "line": 185,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "emit_number",
              "line": 192,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "is_number",
              "line": 193,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "emit_close",
              "line": 200,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "emit_open",
              "line": 206,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "emit_operator",
              "line": 212,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_known_token",
              "line": 221,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "convert_token",
              "line": 225,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "route_operator",
              "line": 235,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "route_token",
              "line": 240,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "drain_step",
              "line": 244,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "drain_operators",
              "line": 255,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "drain_step",
              "line": 256,
              "size": 0,
              "role": "шаг"
            },
            {
              "name": "convert_all",
              "line": 263,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "to_rpn_checked",
              "line": 271,
              "size": 2,
              "role": "преобразование"
            },
            {
              "name": "add",
              "line": 277,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "subtract",
              "line": 281,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "multiply",
              "line": 285,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "divide",
              "line": 289,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_plus",
              "line": 293,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_minus",
              "line": 297,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_times",
              "line": 301,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_slash",
              "line": 305,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "compute_operator",
              "line": 309,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "apply_operator",
              "line": 322,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "to_number",
              "line": 331,
              "size": 6,
              "role": "преобразование"
            },
            {
              "name": "pop_operands",
              "line": 347,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "apply_step",
              "line": 354,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "missing_operands",
              "line": 363,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "apply_operands",
              "line": 370,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "eval_operator",
              "line": 377,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "eval_token",
              "line": 387,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "is_number",
              "line": 388,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "eval_all",
              "line": 397,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "final_value",
              "line": 405,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "final_error",
              "line": 409,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "evaluate_rpn",
              "line": 416,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "print_value",
              "line": 422,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "expression_of",
              "line": 426,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_expression",
              "line": 430,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "report_error",
              "line": 437,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "missing_value_message",
              "line": 447,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_success",
              "line": 451,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "describe",
              "line": 455,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "status_of",
              "line": 459,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report",
              "line": 463,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "evaluate",
              "line": 471,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "print_expression",
              "line": 481,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_rpn_token",
              "line": 485,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_rpn_all",
              "line": 489,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_rpn",
              "line": 495,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_success",
              "line": 500,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_outcome",
              "line": 506,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "is_success",
              "line": 507,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "compute",
              "line": 512,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 523,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 85
        }
      }
    },
    {
      "number": 4,
      "task": "dq-checks",
      "title": "Правила качества данных",
      "purpose": "движок правил над CSV, отчёт нарушений",
      "variants": {
        "php": {
          "path": "php/04-dq-checks/index.php",
          "lines": 339,
          "functions": [
            {
              "name": "file_is_readable",
              "line": 12,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "normalize_row",
              "line": 17,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "read_stream_rows",
              "line": 24,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "build_table",
              "line": 36,
              "size": 3,
              "role": "сборка"
            },
            {
              "name": "open_csv",
              "line": 44,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "read_csv",
              "line": 56,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "check_not_null",
              "line": 63,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_float",
              "line": 68,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "is_number_value",
              "line": 73,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "check_positive_number",
              "line": 78,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "check_format",
              "line": 89,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "check_allowed_values",
              "line": 97,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_date_shape",
              "line": 102,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "check_not_future_date",
              "line": 107,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "apply_rule",
              "line": 115,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "make_violation",
              "line": 126,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "duplicate_message",
              "line": 131,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_unique",
              "line": 136,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "visit_cell",
              "line": 146,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "remember_value",
              "line": 153,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_rule",
              "line": 158,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "check_row",
              "line": 166,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_row_violations",
              "line": 171,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "collect_unique_violations",
              "line": 181,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "run_checks",
              "line": 191,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "build_rules",
              "line": 199,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "rule_table",
              "line": 204,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "base_rule",
              "line": 211,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "inn_rule",
              "line": 216,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "balance_rule",
              "line": 221,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "status_rule",
              "line": 226,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "date_rule",
              "line": 231,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_checked",
              "line": 236,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_violation_count",
              "line": 241,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_all_passed",
              "line": 246,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 251,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 256,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_violation",
              "line": 261,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_violation_rows",
              "line": 266,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_violation_table",
              "line": 273,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_violations",
              "line": 280,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "read_path",
              "line": 292,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "report_read_error",
              "line": 297,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_empty_table",
              "line": 302,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "table_exit_code",
              "line": 307,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 320,
              "size": 5,
              "role": "вход"
            },
            {
              "name": "report_state",
              "line": 330,
              "size": 4,
              "role": "шаг"
            }
          ],
          "count": 47
        },
        "csharp": {
          "path": "csharp/DqChecks/Program.cs",
          "lines": 354,
          "functions": [
            {
              "name": "Main",
              "line": 23,
              "size": 4,
              "role": "вход"
            },
            {
              "name": "PrintReadError",
              "line": 33,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "Execute",
              "line": 41,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "BuildRules",
              "line": 42,
              "size": 0,
              "role": "сборка"
            },
            {
              "name": "TryReadCsv",
              "line": 50,
              "size": 4,
              "role": "чтение"
            },
            {
              "name": "CollectRows",
              "line": 60,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "AddRecord",
              "line": 73,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "MapCells",
              "line": 84,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "AddCommon",
              "line": 99,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "RuleColumns",
              "line": 103,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "RuleColumns",
              "line": 114,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "RuleNames",
              "line": 116,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "RuleChecks",
              "line": 118,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "CheckInn",
              "line": 127,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "ConvertDigits",
              "line": 140,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "SumUp",
              "line": 155,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "MatchesTenDigitChecksum",
              "line": 168,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "MatchesTwelveDigitChecksum",
              "line": 171,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "CheckDigit",
              "line": 172,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "WeightedSum",
              "line": 172,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "CheckNonNegative",
              "line": 175,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "CheckNotFutureDate",
              "line": 188,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "RunChecks",
              "line": 199,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "CollectRows",
              "line": 209,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "CollectDuplicates",
              "line": 218,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "ForEachRule",
              "line": 230,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "AddRuleViolation",
              "line": 239,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "CellOf",
              "line": 249,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "CheckDuplicates",
              "line": 259,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "TrackValue",
              "line": 268,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "PrintViolations",
              "line": 284,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintTable",
              "line": 292,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintRows",
              "line": 305,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "Rule",
              "line": 320,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "Violation",
              "line": 339,
              "size": 4,
              "role": "шаг"
            }
          ],
          "count": 35
        },
        "cpp": {
          "path": "cpp/04_dq_checks/main.cpp",
          "lines": 611,
          "functions": [
            {
              "name": "null_message",
              "line": 40,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "strip_carriage_return",
              "line": 44,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "keep_line",
              "line": 52,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "read_into",
              "line": 58,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "read_lines",
              "line": 66,
              "size": 5,
              "role": "чтение"
            },
            {
              "name": "probe_file",
              "line": 77,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "client_candidates",
              "line": 83,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_opened",
              "line": 87,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "probe_file",
              "line": 88,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "open_candidates",
              "line": 93,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "pick_opened",
              "line": 101,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "resolve_path",
              "line": 105,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 113,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "advance_begin",
              "line": 117,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 118,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "retreat_end",
              "line": 123,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 124,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_leading_space",
              "line": 129,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_trailing_space",
              "line": 133,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "trim_range",
              "line": 137,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "trim",
              "line": 148,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "piece",
              "line": 152,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "split_step",
              "line": 159,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "split",
              "line": 166,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "append_row",
              "line": 178,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fill_rows",
              "line": 184,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fill_table",
              "line": 190,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "load_table",
              "line": 195,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "is_digit_symbol",
              "line": 207,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "check_digit",
              "line": 211,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 212,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "scan_digits",
              "line": 217,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "all_digits",
              "line": 223,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "digit_at",
              "line": 231,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "weighted_sum",
              "line": 235,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "ten_sum",
              "line": 245,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "matches_ten_digit_checksum",
              "line": 249,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "matches_twelve_digit_checksum",
              "line": 253,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "check_not_null",
              "line": 260,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "has_inn_length",
              "line": 264,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_inn_format_valid",
              "line": 268,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "matches_inn_checksum",
              "line": 272,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "inn_message",
              "line": 276,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "check_inn",
              "line": 283,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "has_trailing_garbage",
              "line": 291,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "normalize_number",
              "line": 295,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "parse_number",
              "line": 302,
              "size": 5,
              "role": "преобразование"
            },
            {
              "name": "non_negative_message",
              "line": 311,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_non_negative",
              "line": 315,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_allowed_status",
              "line": 323,
              "size": 2,
              "role": "проверка"
            },
            {
              "name": "check_status",
              "line": 329,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "has_date_shape",
              "line": 333,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "has_date_digits",
              "line": 337,
              "size": 4,
              "role": "проверка"
            },
            {
              "name": "is_date_shaped",
              "line": 345,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "local_today",
              "line": 349,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "print_digit",
              "line": 359,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_date_part",
              "line": 363,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "date_prefix",
              "line": 368,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "day_suffix",
              "line": 376,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "today_text",
              "line": 383,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "future_date_message",
              "line": 390,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_not_future_date",
              "line": 394,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "build_rules",
              "line": 401,
              "size": 7,
              "role": "сборка"
            },
            {
              "name": "column_index",
              "line": 411,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "cell_at",
              "line": 418,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_violation",
              "line": 422,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "null_message",
              "line": 423,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_rule",
              "line": 428,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "collect_rule",
              "line": 435,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "collect_row_violations",
              "line": 442,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "check_row_at",
              "line": 449,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "check_all_rows",
              "line": 456,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "duplicate_message",
              "line": 463,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "remember_value",
              "line": 469,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "check_duplicate",
              "line": 482,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "scan_duplicates",
              "line": 489,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "collect_duplicate_violations",
              "line": 495,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "collect_unique_column",
              "line": 505,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "run_checks",
              "line": 512,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "print_line",
              "line": 523,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_checked_rows",
              "line": 527,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_violation_count",
              "line": 531,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_all_passed",
              "line": 535,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_header",
              "line": 539,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_violation",
              "line": 545,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_violations_block",
              "line": 550,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_head",
              "line": 556,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_body",
              "line": 561,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "print_violations",
              "line": 572,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "report_read_error",
              "line": 577,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fail_read",
              "line": 581,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "violation_status",
              "line": 587,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "checked",
              "line": 591,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "build_rules",
              "line": 592,
              "size": 0,
              "role": "сборка"
            },
            {
              "name": "run",
              "line": 595,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 609,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 96
        }
      }
    },
    {
      "number": 5,
      "task": "log-parser",
      "title": "Разбор лога",
      "purpose": "p50/p95/max по задачам, топ-5 по p95",
      "variants": {
        "php": {
          "path": "php/05-log-parser/index.php",
          "lines": 296,
          "functions": [
            {
              "name": "read_lines",
              "line": 13,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "split_fields",
              "line": 20,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "has_fields",
              "line": 25,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "parse_duration",
              "line": 30,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "format_time",
              "line": 35,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "build_record",
              "line": 43,
              "size": 6,
              "role": "сборка"
            },
            {
              "name": "parse_line",
              "line": 53,
              "size": 3,
              "role": "преобразование"
            },
            {
              "name": "parse_log",
              "line": 61,
              "size": 6,
              "role": "преобразование"
            },
            {
              "name": "is_empty_series",
              "line": 74,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "percentile_position",
              "line": 79,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_same_index",
              "line": 84,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "cubic_value",
              "line": 89,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "percentile",
              "line": 98,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "average_duration",
              "line": 109,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "last_value",
              "line": 114,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "status_count",
              "line": 119,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_percentiles",
              "line": 124,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "summarize_task",
              "line": 131,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "base_summary",
              "line": 142,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "add_status_book",
              "line": 149,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "append_record",
              "line": 154,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "group_records",
              "line": 164,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "task_keys",
              "line": 174,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "summarize_all",
              "line": 179,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "aggregate",
              "line": 191,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "sort_by_p95",
              "line": 198,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "print_log_line",
              "line": 207,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_counts",
              "line": 212,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 217,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 222,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_summary",
              "line": 227,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_summaries",
              "line": 233,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_footer",
              "line": 240,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 245,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "read_path",
              "line": 255,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "parse_file",
              "line": 260,
              "size": 3,
              "role": "преобразование"
            },
            {
              "name": "report_failure",
              "line": 268,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "failure_message",
              "line": 275,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_failed_parse",
              "line": 280,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "main",
              "line": 285,
              "size": 6,
              "role": "вход"
            }
          ],
          "count": 40
        },
        "csharp": {
          "path": "csharp/LogParser/Program.cs",
          "lines": 278,
          "functions": [
            {
              "name": "Main",
              "line": 17,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "PrintErrors",
              "line": 33,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "PrintRecordsError",
              "line": 43,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "TryReadLines",
              "line": 51,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "CollectLines",
              "line": 58,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddLine",
              "line": 70,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "ParseLog",
              "line": 78,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "AddRecord",
              "line": 90,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "ParseLine",
              "line": 98,
              "size": 2,
              "role": "преобразование"
            },
            {
              "name": "Aggregate",
              "line": 110,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "GroupByTask",
              "line": 123,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddToGroup",
              "line": 135,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "Summarize",
              "line": 147,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "ApplyPercentiles",
              "line": 163,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "Percentile",
              "line": 176,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "Interpolate",
              "line": 183,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "PrintReport",
              "line": 198,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintHeader",
              "line": 207,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "ForEachRow",
              "line": 216,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PrintFooter",
              "line": 227,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "LogRecord",
              "line": 235,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "TaskSummary",
              "line": 253,
              "size": 4,
              "role": "шаг"
            }
          ],
          "count": 22
        },
        "cpp": {
          "path": "cpp/05_log_parser/main.cpp",
          "lines": 474,
          "functions": [
            {
              "name": "strip_carriage_return",
              "line": 32,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "keep_line",
              "line": 40,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "read_into",
              "line": 46,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "read_lines",
              "line": 54,
              "size": 5,
              "role": "чтение"
            },
            {
              "name": "probe_file",
              "line": 65,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "log_candidates",
              "line": 71,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_opened",
              "line": 75,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "probe_file",
              "line": 76,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "open_candidates",
              "line": 81,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "pick_opened",
              "line": 89,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "resolve_path",
              "line": 93,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 101,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "advance_begin",
              "line": 105,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 106,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "retreat_end",
              "line": 111,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_space_at",
              "line": 112,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_leading_space",
              "line": 117,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_trailing_space",
              "line": 121,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "trim_range",
              "line": 125,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "trim",
              "line": 136,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "piece",
              "line": 140,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "split_step",
              "line": 147,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "split",
              "line": 154,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 166,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "keep_digit",
              "line": 170,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 171,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "collect_digits",
              "line": 176,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "digit_string",
              "line": 182,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "parse_duration",
              "line": 190,
              "size": 5,
              "role": "преобразование"
            },
            {
              "name": "to_upper_char",
              "line": 199,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "upper_byte",
              "line": 203,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_upper",
              "line": 207,
              "size": 3,
              "role": "преобразование"
            },
            {
              "name": "field_at",
              "line": 215,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "has_enough_parts",
              "line": 219,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "assign_record",
              "line": 223,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "parse_line",
              "line": 229,
              "size": 6,
              "role": "преобразование"
            },
            {
              "name": "keep_record",
              "line": 241,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "parse_line",
              "line": 244,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "parse_log",
              "line": 249,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "locate",
              "line": 265,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "interpolate",
              "line": 274,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "percentile",
              "line": 281,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "rounded",
              "line": 289,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "tally",
              "line": 298,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "tally_all",
              "line": 304,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "fill_percentiles",
              "line": 312,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fill_summary",
              "line": 317,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "summarize",
              "line": 326,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "group_by_task",
              "line": 337,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "summarize_group",
              "line": 346,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "aggregate",
              "line": 350,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "ranks_before",
              "line": 362,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "sort_by_p95",
              "line": 369,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "truncate",
              "line": 373,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_log_path",
              "line": 377,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_counts",
              "line": 381,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_header",
              "line": 385,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "print_summary",
              "line": 392,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_summaries",
              "line": 398,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_footer",
              "line": 404,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_block",
              "line": 408,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 415,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "top_summaries",
              "line": 421,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "report_read_error",
              "line": 429,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_parse_error",
              "line": 433,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fail_read",
              "line": 437,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fail_parse",
              "line": 443,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "failure_status",
              "line": 449,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_when_parsed",
              "line": 453,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "run",
              "line": 459,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 472,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 71
        }
      }
    },
    {
      "number": 6,
      "task": "sort-bench",
      "title": "Три сортировки",
      "purpose": "проверка корректности и замер времени",
      "variants": {
        "php": {
          "path": "php/06-sort-bench/index.php",
          "lines": 288,
          "functions": [
            {
              "name": "build_random_list",
              "line": 10,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "shift_right",
              "line": 21,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "shift_while_greater",
              "line": 28,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "shift_step",
              "line": 38,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "insertion_pass",
              "line": 46,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "insert_item",
              "line": 57,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "insertion_sort",
              "line": 67,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "take_left",
              "line": 72,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "take_right",
              "line": 79,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "merge_while",
              "line": 86,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "merge_step",
              "line": 96,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "merge",
              "line": 107,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "merge_sort",
              "line": 114,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "swap",
              "line": 122,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "partition_pass",
              "line": 129,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "partition_step",
              "line": 140,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "quick_sort_partition",
              "line": 148,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "quick_sort_range",
              "line": 156,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "quick_sort",
              "line": 168,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_sorted",
              "line": 173,
              "size": 5,
              "role": "проверка"
            },
            {
              "name": "measure",
              "line": 184,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "collect_measurement",
              "line": 193,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "sort_copy",
              "line": 200,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "collect_measurements",
              "line": 207,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "measure_array_sort",
              "line": 217,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "print_size",
              "line": 224,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 229,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 234,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_measurement",
              "line": 239,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_rows",
              "line": 244,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 251,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "read_size",
              "line": 259,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "report_size_error",
              "line": 264,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 269,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "run_bench",
              "line": 282,
              "size": 3,
              "role": "шаг"
            }
          ],
          "count": 35
        },
        "csharp": {
          "path": "csharp/SortBench/Program.cs",
          "lines": 278,
          "functions": [
            {
              "name": "Main",
              "line": 14,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "PrintSizeError",
              "line": 31,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "RunBenchmark",
              "line": 39,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "AddAll",
              "line": 49,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "SortCopy",
              "line": 62,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "Fill",
              "line": 73,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "insertionSort",
              "line": 84,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "SortByInsertion",
              "line": 93,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "ShiftRight",
              "line": 102,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "MergeInto",
              "line": 123,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "CopyLeftovers",
              "line": 130,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "TakeSmaller",
              "line": 137,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "CopyFrom",
              "line": 149,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "quickSort",
              "line": 162,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "SortRange",
              "line": 170,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "Partition",
              "line": 181,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PlaceLeft",
              "line": 188,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "StepLeft",
              "line": 200,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "Swap",
              "line": 212,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "SwapAndReturn",
              "line": 219,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "BuiltInSort",
              "line": 226,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "Measure",
              "line": 234,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "PrintReport",
              "line": 248,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "PrintMeasurement",
              "line": 258,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "Measurement",
              "line": 266,
              "size": 3,
              "role": "шаг"
            }
          ],
          "count": 25
        },
        "cpp": {
          "path": "cpp/06_sort_bench/main.cpp",
          "lines": 339,
          "functions": [
            {
              "name": "fill_random",
              "line": 25,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fill_values",
              "line": 29,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "build_random_array",
              "line": 35,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "is_out_of_place",
              "line": 44,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "place_element",
              "line": 48,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "insertion_pass",
              "line": 58,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "insertion_sort",
              "line": 64,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "left_is_next",
              "line": 76,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "take_left",
              "line": 80,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "take_right",
              "line": 85,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "merge_step",
              "line": 90,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "left_is_next",
              "line": 91,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "merge_loop",
              "line": 98,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "to_index",
              "line": 104,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "append_rest",
              "line": 108,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "merge_tails",
              "line": 113,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "merge_lists",
              "line": 120,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "head",
              "line": 129,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "tail",
              "line": 133,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "merge_sort",
              "line": 137,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "swap_pivot",
              "line": 144,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "partition_step",
              "line": 148,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "partition",
              "line": 157,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "sort_higher",
              "line": 171,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "quick_sort_range",
              "line": 177,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "quick_sort",
              "line": 187,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "library_sort",
              "line": 196,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "is_out_of_order",
              "line": 203,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "mark_out_of_order",
              "line": 207,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_out_of_order",
              "line": 208,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_sorted",
              "line": 213,
              "size": 4,
              "role": "проверка"
            },
            {
              "name": "now",
              "line": 225,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "elapsed_ms",
              "line": 229,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "make_measurement",
              "line": 234,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "measure",
              "line": 244,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "sorted_copy",
              "line": 252,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "run_all",
              "line": 259,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "print_size",
              "line": 268,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_header",
              "line": 272,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "correctness_text",
              "line": 278,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_measurement",
              "line": 282,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_measurements",
              "line": 288,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_report",
              "line": 294,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "requested_size",
              "line": 300,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "report_size_error",
              "line": 308,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "status_of",
              "line": 312,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_when_ok",
              "line": 316,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "run",
              "line": 324,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 337,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 49
        }
      }
    },
    {
      "number": 7,
      "task": "date-periods",
      "title": "Отчётные периоды",
      "purpose": "контроль пересечений и разрывов",
      "variants": {
        "php": {
          "path": "php/07-date-periods/index.php",
          "lines": 340,
          "functions": [
            {
              "name": "create_date",
              "line": 16,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "has_date_errors",
              "line": 21,
              "size": 2,
              "role": "проверка"
            },
            {
              "name": "parse_date",
              "line": 28,
              "size": 2,
              "role": "преобразование"
            },
            {
              "name": "month_start",
              "line": 35,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "first_quarter_month",
              "line": 40,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "quarter_start",
              "line": 45,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "year_start",
              "line": 50,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "shift_months",
              "line": 55,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "shift_quarters",
              "line": 60,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "shift_years",
              "line": 65,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_unknown_granularity",
              "line": 70,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "next_period_start",
              "line": 75,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "align_start",
              "line": 85,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "clamp_end",
              "line": 95,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "make_period",
              "line": 100,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "collect_periods",
              "line": 105,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "period_step",
              "line": 114,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "generate_periods",
              "line": 120,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "format_date",
              "line": 127,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "overlap_message",
              "line": 132,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "find_overlap",
              "line": 137,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "intersection_loop",
              "line": 142,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "find_intersections",
              "line": 153,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "expected_start",
              "line": 158,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "gap_message",
              "line": 163,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "find_gap",
              "line": 168,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "gap_loop",
              "line": 173,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "find_gaps",
              "line": 184,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "period_days",
              "line": 189,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "total_days",
              "line": 194,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "print_summary",
              "line": 204,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 209,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 214,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_period_row",
              "line": 219,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_period_rows",
              "line": 224,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_problems",
              "line": 231,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_continuity",
              "line": 238,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "print_periods",
              "line": 248,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "read_argument",
              "line": 258,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "parse_bounds",
              "line": 263,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "grant_granularity",
              "line": 268,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_bad_bounds",
              "line": 273,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "date_error_message",
              "line": 278,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_granularity_error",
              "line": 285,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_empty_error",
              "line": 292,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "build_code",
              "line": 297,
              "size": 2,
              "role": "сборка"
            },
            {
              "name": "solve",
              "line": 304,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "report_outcome",
              "line": 314,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 323,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "print_outcome",
              "line": 334,
              "size": 2,
              "role": "печать"
            }
          ],
          "count": 50
        },
        "csharp": {
          "path": "csharp/DatePeriods/Program.cs",
          "lines": 236,
          "functions": [
            {
              "name": "Main",
              "line": 14,
              "size": 4,
              "role": "вход"
            },
            {
              "name": "Report",
              "line": 25,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "PrintInputError",
              "line": 37,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "TryParseRange",
              "line": 44,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "PrintParseError",
              "line": 54,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintGranularityError",
              "line": 62,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintOrderError",
              "line": 70,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintReport",
              "line": 78,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "AlignStart",
              "line": 95,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "QuarterStart",
              "line": 103,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "NextStart",
              "line": 110,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "FillPeriods",
              "line": 121,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "FindIntersections",
              "line": 138,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddIntersection",
              "line": 150,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "FindGaps",
              "line": 158,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddGap",
              "line": 170,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "TotalDays",
              "line": 182,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "PrintPeriods",
              "line": 194,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintHeader",
              "line": 202,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintRows",
              "line": 210,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintProblems",
              "line": 221,
              "size": 4,
              "role": "печать"
            }
          ],
          "count": 21
        },
        "cpp": {
          "path": "cpp/07_date_periods/main.cpp",
          "lines": 543,
          "functions": [
            {
              "name": "is_leap_year",
              "line": 20,
              "size": 4,
              "role": "проверка"
            },
            {
              "name": "month_length",
              "line": 28,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "days_in_month",
              "line": 34,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "adjusted_year",
              "line": 40,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "era_of",
              "line": 46,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "shifted_month",
              "line": 53,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "day_of_year",
              "line": 57,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "day_of_era",
              "line": 63,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_days",
              "line": 67,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "era_from_shifted",
              "line": 75,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "year_of_era_at",
              "line": 79,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "year_offset",
              "line": 87,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "month_index",
              "line": 91,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fill_date",
              "line": 95,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "split_shifted",
              "line": 106,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "days_to_date",
              "line": 112,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "from_days",
              "line": 123,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 127,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "check_digit",
              "line": 131,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_digit_symbol",
              "line": 132,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "scan_digits",
              "line": 137,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_digits",
              "line": 143,
              "size": 3,
              "role": "проверка"
            },
            {
              "name": "has_date_shape",
              "line": 151,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "has_date_digits",
              "line": 155,
              "size": 4,
              "role": "проверка"
            },
            {
              "name": "digit",
              "line": 163,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_int",
              "line": 167,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "is_valid_month",
              "line": 177,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_valid_day",
              "line": 181,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_valid_range",
              "line": 185,
              "size": 2,
              "role": "проверка"
            },
            {
              "name": "assign_fields",
              "line": 191,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "parse_date",
              "line": 197,
              "size": 4,
              "role": "преобразование"
            },
            {
              "name": "padded",
              "line": 207,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "year_part",
              "line": 211,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "month_part",
              "line": 215,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "format_date",
              "line": 219,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "starts_month",
              "line": 223,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "starts_quarter",
              "line": 227,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "quarter_month",
              "line": 231,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "align_start",
              "line": 235,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "quarter_month",
              "line": 241,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "next_month",
              "line": 244,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "next_quarter",
              "line": 248,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "next_start",
              "line": 254,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "starts_month",
              "line": 257,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "next_month",
              "line": 257,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "starts_quarter",
              "line": 257,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "next_quarter",
              "line": 257,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "clamp_end",
              "line": 260,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "make_period",
              "line": 266,
              "size": 2,
              "role": "сборка"
            },
            {
              "name": "append_period",
              "line": 272,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "generate_range",
              "line": 277,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "generate_periods",
              "line": 286,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "overlaps",
              "line": 292,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "overlap_text",
              "line": 296,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "check_overlap",
              "line": 301,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "scan_overlaps",
              "line": 311,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "find_intersections",
              "line": 319,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "gap_text",
              "line": 325,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "check_gap",
              "line": 329,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "to_days",
              "line": 333,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "scan_gaps",
              "line": 339,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "find_gaps",
              "line": 347,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "period_days",
              "line": 353,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_period",
              "line": 357,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "sum_days",
              "line": 361,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "total_days",
              "line": 369,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_caption",
              "line": 373,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_header",
              "line": 377,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_row",
              "line": 383,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_rows",
              "line": 388,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_problem",
              "line": 394,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_problems",
              "line": 398,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_continuity",
              "line": 404,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "print_periods",
              "line": 416,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "argument",
              "line": 423,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "from_text",
              "line": 427,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "to_text",
              "line": 431,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "granularity_text",
              "line": 435,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_known_granularity",
              "line": 439,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "gather_problems",
              "line": 443,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "report_bad_date",
              "line": 451,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_bad_granularity",
              "line": 455,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_reversed_range",
              "line": 459,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fail_bad_date",
              "line": 463,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fail_bad_granularity",
              "line": 469,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fail_reversed",
              "line": 475,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "parse_pair",
              "line": 490,
              "size": 3,
              "role": "преобразование"
            },
            {
              "name": "make_arguments",
              "line": 497,
              "size": 6,
              "role": "сборка"
            },
            {
              "name": "is_ready",
              "line": 507,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "failure_status",
              "line": 511,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "periods_of",
              "line": 519,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "report_ready",
              "line": 524,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "run",
              "line": 532,
              "size": 3,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 541,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 94
        }
      }
    },
    {
      "number": 8,
      "task": "moving-average",
      "title": "Скользящее среднее",
      "purpose": "сглаживание и выбросы по z-score",
      "variants": {
        "php": {
          "path": "php/08-moving-average/index.php",
          "lines": 274,
          "functions": [
            {
              "name": "file_is_readable",
              "line": 14,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "read_lines",
              "line": 19,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "split_fields",
              "line": 26,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "parse_value",
              "line": 31,
              "size": 2,
              "role": "преобразование"
            },
            {
              "name": "build_point",
              "line": 38,
              "size": 3,
              "role": "сборка"
            },
            {
              "name": "collect_points",
              "line": 46,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "read_series",
              "line": 57,
              "size": 2,
              "role": "чтение"
            },
            {
              "name": "window_start",
              "line": 64,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "window_slice",
              "line": 69,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "window_mean",
              "line": 76,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "average_step",
              "line": 81,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "average_loop",
              "line": 86,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "moving_average",
              "line": 97,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "mean",
              "line": 102,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "square_deviation",
              "line": 107,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "squared_values",
              "line": 112,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "standard_deviation",
              "line": 123,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "z_score",
              "line": 132,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "add_outlier",
              "line": 139,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "find_outliers",
              "line": 144,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "build_bar",
              "line": 156,
              "size": 1,
              "role": "сборка"
            },
            {
              "name": "print_parameters",
              "line": 161,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table_head",
              "line": 166,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_separator",
              "line": 171,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_row",
              "line": 176,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "row_score",
              "line": 182,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "row_mark",
              "line": 187,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_rows",
              "line": 192,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_outlier_count",
              "line": 199,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_series",
              "line": 204,
              "size": 5,
              "role": "печать"
            },
            {
              "name": "build_context",
              "line": 213,
              "size": 4,
              "role": "сборка"
            },
            {
              "name": "series_values",
              "line": 222,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "read_path",
              "line": 227,
              "size": 1,
              "role": "чтение"
            },
            {
              "name": "report_read_error",
              "line": 232,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_window_error",
              "line": 237,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_short_series",
              "line": 242,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "report_failure",
              "line": 247,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "main",
              "line": 257,
              "size": 5,
              "role": "вход"
            },
            {
              "name": "print_report",
              "line": 267,
              "size": 3,
              "role": "печать"
            }
          ],
          "count": 39
        },
        "csharp": {
          "path": "csharp/MovingAverage/Program.cs",
          "lines": 204,
          "functions": [
            {
              "name": "Main",
              "line": 17,
              "size": 6,
              "role": "вход"
            },
            {
              "name": "PrintReadError",
              "line": 32,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintSizeError",
              "line": 40,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "PrintReport",
              "line": 48,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "TryReadSeries",
              "line": 60,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "CollectPoints",
              "line": 69,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "AddPoint",
              "line": 81,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "FillAverages",
              "line": 104,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "FindOutliers",
              "line": 133,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "CollectOutliers",
              "line": 144,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "PrintSeries",
              "line": 162,
              "size": 6,
              "role": "печать"
            },
            {
              "name": "PrintHeader",
              "line": 173,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "PrintRows",
              "line": 183,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "FormatRow",
              "line": 191,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "PrintFooter",
              "line": 198,
              "size": 2,
              "role": "печать"
            }
          ],
          "count": 15
        },
        "cpp": {
          "path": "cpp/08_moving_average/main.cpp",
          "lines": 455,
          "functions": [
            {
              "name": "strip_carriage_return",
              "line": 24,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "keep_line",
              "line": 32,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "read_into",
              "line": 38,
              "size": 3,
              "role": "чтение"
            },
            {
              "name": "read_lines",
              "line": 46,
              "size": 5,
              "role": "чтение"
            },
            {
              "name": "probe_file",
              "line": 57,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "balance_candidates",
              "line": 63,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "collect_opened",
              "line": 67,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "probe_file",
              "line": 68,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "open_candidates",
              "line": 73,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "pick_opened",
              "line": 81,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "resolve_path",
              "line": 85,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "is_blank_at",
              "line": 93,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "advance_begin",
              "line": 97,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_blank_at",
              "line": 98,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "retreat_end",
              "line": 103,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "is_blank_at",
              "line": 104,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_leading_blank",
              "line": 109,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "is_trailing_blank",
              "line": 113,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "trim_range",
              "line": 117,
              "size": 5,
              "role": "шаг"
            },
            {
              "name": "trim",
              "line": 128,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "replace_comma",
              "line": 132,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "normalize_value",
              "line": 138,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "fully_parsed",
              "line": 148,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "parse_value",
              "line": 152,
              "size": 6,
              "role": "преобразование"
            },
            {
              "name": "separator_at",
              "line": 162,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "has_separator",
              "line": 166,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "period_part",
              "line": 170,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "value_part",
              "line": 174,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_point",
              "line": 178,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "has_separator",
              "line": 182,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "parse_value",
              "line": 182,
              "size": 1,
              "role": "преобразование"
            },
            {
              "name": "value_part",
              "line": 182,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "read_series",
              "line": 187,
              "size": 4,
              "role": "чтение"
            },
            {
              "name": "push_value",
              "line": 197,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "extract_values",
              "line": 201,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "mean_or",
              "line": 211,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "mean",
              "line": 217,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "squared_gap",
              "line": 221,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "add_square",
              "line": 227,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "square_sum",
              "line": 231,
              "size": 3,
              "role": "шаг"
            },
            {
              "name": "variance",
              "line": 239,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "standard_deviation",
              "line": 247,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "window_begin",
              "line": 251,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "window_sum",
              "line": 255,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "window_mean",
              "line": 260,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "add_average",
              "line": 264,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "moving_average",
              "line": 269,
              "size": 4,
              "role": "шаг"
            },
            {
              "name": "z_score",
              "line": 279,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "is_outlier",
              "line": 283,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "add_outlier",
              "line": 287,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "find_outliers",
              "line": 291,
              "size": 6,
              "role": "шаг"
            },
            {
              "name": "bar_length",
              "line": 303,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "positive_length",
              "line": 307,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "build_bar",
              "line": 311,
              "size": 3,
              "role": "сборка"
            },
            {
              "name": "outlier_mark",
              "line": 318,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "count_flags",
              "line": 322,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "maximum_of",
              "line": 326,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "print_caption",
              "line": 330,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_header",
              "line": 335,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_row",
              "line": 341,
              "size": 4,
              "role": "печать"
            },
            {
              "name": "print_one",
              "line": 357,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "print_rows",
              "line": 364,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "print_summary",
              "line": 370,
              "size": 1,
              "role": "печать"
            },
            {
              "name": "print_table",
              "line": 374,
              "size": 3,
              "role": "печать"
            },
            {
              "name": "make_chart",
              "line": 381,
              "size": 5,
              "role": "сборка"
            },
            {
              "name": "print_series",
              "line": 391,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "has_enough_points",
              "line": 396,
              "size": 1,
              "role": "проверка"
            },
            {
              "name": "report_read_error",
              "line": 400,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "report_short_series",
              "line": 404,
              "size": 1,
              "role": "шаг"
            },
            {
              "name": "fail_read",
              "line": 408,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "fail_short",
              "line": 414,
              "size": 2,
              "role": "шаг"
            },
            {
              "name": "load_input",
              "line": 426,
              "size": 6,
              "role": "чтение"
            },
            {
              "name": "print_when_ready",
              "line": 436,
              "size": 2,
              "role": "печать"
            },
            {
              "name": "run",
              "line": 442,
              "size": 4,
              "role": "вход"
            },
            {
              "name": "main",
              "line": 453,
              "size": 1,
              "role": "вход"
            }
          ],
          "count": 75
        }
      }
    }
  ]
};
