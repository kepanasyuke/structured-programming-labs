#!/usr/bin/env python3
"""Нагрузочные тесты для 24 учебных проектов: по 240 сгенерированных кейсов на проект.

Каждый кейс — отдельный запуск программы с независимым оракулом на Python.
Чёрный ящик: проверяем только то, что видно снаружи (вывод, код возврата).

Запуск:
    python tools/test_labs.py                 # все проекты, 240 кейсов
    python tools/test_labs.py --cases 20      # быстрый прогон
    python tools/test_labs.py --task rpn-calc --lang cpp
    python tools/test_labs.py --build cpp/build

Сборка C++ (один раз):
    cmake -S cpp -B build -G "MinGW Makefiles"
"""

import argparse
import csv
import io
import os
import random
import re
import subprocess
import sys
import tempfile
import zlib
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASES_DIR = Path(tempfile.gettempdir()) / "labs-cases"

TASKS = ["text-stats", "csv-profiler", "rpn-calc", "dq-checks",
         "log-parser", "sort-bench", "date-periods", "moving-average"]

PHP_DIR = {
    "text-stats": "01-text-stats", "csv-profiler": "02-csv-profiler", "rpn-calc": "03-rpn-calc",
    "dq-checks": "04-dq-checks", "log-parser": "05-log-parser", "sort-bench": "06-sort-bench",
    "date-periods": "07-date-periods", "moving-average": "08-moving-average",
}
CS_DIR = {
    "text-stats": "TextStats", "csv-profiler": "CsvProfiler", "rpn-calc": "RpnCalc",
    "dq-checks": "DqChecks", "log-parser": "LogParser", "sort-bench": "SortBench",
    "date-periods": "DatePeriods", "moving-average": "MovingAverage",
}
CS_EXE = {
    "text-stats": "text-stats", "csv-profiler": "csv-profiler", "rpn-calc": "rpn-calc",
    "dq-checks": "dq-checks", "log-parser": "log-parser", "sort-bench": "sort-bench",
    "date-periods": "date-periods", "moving-average": "moving-average",
}
CPP_TARGET = {
    "text-stats": "01_text_stats", "csv-profiler": "02_csv_profiler", "rpn-calc": "03_rpn_calc",
    "dq-checks": "04_dq_checks", "log-parser": "05_log_parser", "sort-bench": "06_sort_bench",
    "date-periods": "07_date_periods", "moving-average": "08_moving_average",
}

INNS = ["7707083893", "7743013901", "500100732259", "7728168971",
        "5047082922", "5031001919", "7811033720", "7701363601"]

MINGW_BIN = next(
    (path.parent for path in Path(os.environ.get("LOCALAPPDATA", "")).glob(
        "Microsoft/WinGet/Packages/BrechtSanders.WinLibs*/mingw64/bin/g++.exe")),
    None,
)

WORDS = ["данные", "данных", "отчёт", "клиент", "база", "запрос", "строка",
         "поле", "сервис", "поток", "метрика", "витрина", "и", "в", "с"]
STOP = ["данные", "данных"]


# ---------------------------------------------------------------- утилиты

def write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def parse_label(text: str, label: str):
    match = re.search(rf"{re.escape(label)}\s*:\s*(-?\d+)", text, re.IGNORECASE)
    return int(match.group(1)) if match else None


def parse_result(text: str):
    matches = re.findall(r"Результат:\s*(-?\d+(?:[.,]\d+)?)", text)
    return float(matches[-1].replace(",", ".")) if matches else None


def lines_with_date(text: str):
    return [line for line in text.splitlines() if re.match(r"\d{4}-\d{2}-\d{2}", line.strip())]


# ---------------------------------------------------------------- кейсы

def case_text_stats(rng: random.Random):
    count = rng.randint(8, 40)
    words = [rng.choice(WORDS) for _ in range(count)]
    text = " ".join(words)
    path = CASES_DIR / "sample.txt"
    write_text(path, text + "\n")

    stop_path = CASES_DIR / "stopwords.txt"
    write_text(stop_path, "\n".join(STOP) + "\n")

    tokens = [w for w in re.findall(r"\w+", text.lower()) if len(w) >= 2 and w not in STOP]
    oracle = {
        "chars": len(text) + 1,
        "words": len(tokens),
        "unique": len(set(tokens)),
    }
    return [str(path), str(stop_path)], oracle


def check_text_stats(out: str, oracle: dict):
    errors = []
    chars = parse_label(out, "Символов")
    words = parse_label(out, "Слов после фильтрации")
    unique = parse_label(out, "Уникальных")

    if chars != oracle["chars"]:
        errors.append(f"символов {chars} != {oracle['chars']}")
    if words is not None and words != oracle["words"]:
        errors.append(f"слов {words} != {oracle['words']}")
    if unique != oracle["unique"]:
        errors.append(f"уникальных {unique} != {oracle['unique']}")
    return errors


def case_csv_profiler(rng: random.Random):
    columns = ["client_id", "amount", "open_day", "note"]
    rows = []
    for index in range(rng.randint(4, 12)):
        rows.append([
            str(rng.randint(1, 500)),
            f"{rng.randint(100, 9000)}.{rng.randint(0, 99):02d}",
            f"20{rng.randint(10, 24)}-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}",
            rng.choice(["МСБ", "Крупный", "Ретейл", "Средний"]),
        ])

    empty_cells = rng.sample(range(len(rows)), k=min(2, len(rows)))
    for position in empty_cells:
        rows[position][1] = ""

    path = CASES_DIR / "profile.csv"
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter=";", lineterminator="\n")
        writer.writerow(columns)
        writer.writerows(rows)

    oracle = {"columns": len(columns), "types": {
        "client_id": "int", "amount": "float", "open_day": "date", "note": "string"}}
    return [str(path)], oracle


def check_csv_profiler(out: str, oracle: dict):
    errors = []
    total = parse_label(out, "Колонок")
    if total != oracle["columns"]:
        errors.append(f"колонок {total} != {oracle['columns']}")

    for name, kind in oracle["types"].items():
        row = next((line for line in out.splitlines() if line.strip().startswith(name)), "")
        if row == "":
            errors.append(f"нет строки колонки {name}")
        elif kind not in row:
            errors.append(f"{name}: тип не {kind} в строке «{row.strip()[:60]}»")
    return errors


def case_rpn_calc(rng: random.Random):
    def term(depth):
        if depth <= 0 or rng.random() < 0.5:
            return str(rng.randint(1, 99))
        left = term(depth - 1)
        right = term(depth - 1)
        operator = rng.choice(["+", "-", "*", "+", "*"])
        return f"({left}{operator}{right})"

    expression = term(2)
    oracle = {"value": eval(expression, {"__builtins__": {}})}

    def safe(node):
        return node

    oracle["error"] = ""
    try:
        oracle["value"] = eval(expression)  # noqa: S307 — выражение из чисел и + - *
    except Exception as error:  # pragma: no cover
        oracle["error"] = str(error)
    return [expression], oracle


def check_rpn_calc(out: str, oracle: dict):
    if oracle["error"]:
        return []
    value = parse_result(out)
    if value is None:
        return ["нет строки «Результат:»"]
    if abs(value - oracle["value"]) > 1e-6 * max(1.0, abs(oracle["value"])):
        return [f"результат {value} != {oracle['value']}"]
    return []


def case_dq_checks(rng: random.Random):
    header = ["client_id", "inn", "name", "segment", "open_date", "balance_rub", "status"]
    rows = []
    defects = 0

    for index in range(rng.randint(5, 15)):
        client_id = str(rng.randint(1, 400))
        inn = rng.choice(INNS)
        balance = f"{rng.randint(1000, 900000)}.{rng.randint(0, 99):02d}"
        status = "active"
        open_date = "2020-05-05"
        defect = rng.random()

        if defect < 0.18:
            client_id = ""
            defects += 1
        elif defect < 0.34:
            inn = str(rng.randint(10 ** 8, 10 ** 9))
            defects += 1
        elif defect < 0.5:
            balance = f"-{rng.randint(1, 9000)}.{rng.randint(0, 99):02d}"
            defects += 1
        elif defect < 0.62:
            status = "archived"
            defects += 1
        elif defect < 0.74:
            open_date = "2030-01-01"
            defects += 1

        rows.append([client_id, inn, f"ООО {index}", "МСБ", open_date, balance, status])

    if len(rows) > 3 and rng.random() < 0.5:
        rows.append(list(rows[0]))
        defects += 1

    path = CASES_DIR / "clients.csv"
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter=";", lineterminator="\n")
        writer.writerow(header)
        writer.writerows(rows)

    return [str(path)], {"rows": len(rows), "defects": defects}


def check_dq_checks(out: str, oracle: dict, code: int):
    errors = []
    checked = parse_label(out, "Проверено строк")
    found = parse_label(out, "Нарушений")

    if checked != oracle["rows"]:
        errors.append(f"проверено {checked} != {oracle['rows']}")
    if found is None:
        errors.append("нет строки «Нарушений»")
    elif found < oracle["defects"]:
        errors.append(f"нарушений {found} < ожидаемых {oracle['defects']}")
    if oracle["defects"] > 0 and code != 1:
        errors.append(f"код возврата {code}, ожидался 1")
    return errors


def case_log_parser(rng: random.Random):
    names = ["load_clients", "load_accounts", "build_mart", "refresh_dash", "dq_check"]
    count = rng.randint(4, 20)
    lines = []
    for index in range(count):
        name = rng.choice(names)
        duration = rng.randint(10, 40000)
        status = rng.choice(["OK", "OK", "OK", "WARN", "FAIL"])
        lines.append(f"2026-10-01T02:{index:02d}:00Z | {name} | {duration} ms | {status}")

    path = CASES_DIR / "queries.log"
    write_text(path, "\n".join(lines) + "\n")
    return [str(path)], {"records": count, "tasks": len(set(line.split("|")[1].strip() for line in lines))}


def check_log_parser(out: str, oracle: dict):
    records = parse_label(out, "Записей")
    tasks = parse_label(out, "Задач")
    errors = []
    if records != oracle["records"]:
        errors.append(f"записей {records} != {oracle['records']}")
    if tasks != oracle["tasks"]:
        errors.append(f"задач {tasks} != {oracle['tasks']}")
    return errors


def case_sort_bench(rng: random.Random):
    size = rng.randint(20, 120)
    return [str(size)], {"size": size}


def check_sort_bench(out: str, oracle: dict, code: int):
    errors = []
    size = parse_label(out, "Размер массива")
    if size != oracle["size"]:
        errors.append(f"размер {size} != {oracle['size']}")
    if code != 0:
        errors.append(f"код возврата {code}")
    if re.search(r"\bНЕТ\b|\bнет\b", out):
        errors.append("алгоритм отсортировал неверно")
    good = len(re.findall(r"\bда\b", out))
    if good < 4:
        errors.append(f"подтверждений «да» {good} < 4")
    return errors


def case_date_periods(rng: random.Random):
    start = date(2024, 1, 1) + timedelta(days=rng.randint(0, 700))
    end = start + timedelta(days=rng.randint(30, 600))
    granularity = rng.choice(["month", "quarter", "year"])

    def align(day, gran):
        if gran == "year":
            return date(day.year, 1, 1)
        if gran == "quarter":
            month = 3 * ((day.month - 1) // 3) + 1
            return date(day.year, month, 1)
        return date(day.year, day.month, 1)

    def step(day, gran):
        if gran == "year":
            return date(day.year + 1, 1, 1)
        if gran == "quarter":
            month = day.month + 3
            return date(day.year + (month - 1) // 12, (month - 1) % 12 + 1, 1)
        month = day.month + 1
        return date(day.year + (month - 1) // 12, (month - 1) % 12 + 1, 1)

    cursor = align(start, granularity)
    count = 0
    days = 0
    while cursor <= end:
        following = step(cursor, granularity)
        finish = min(following - timedelta(days=1), end)
        count += 1
        days += (finish - cursor).days + 1
        cursor = following

    return [start.isoformat(), end.isoformat(), granularity], {"count": count, "days": days}


def check_date_periods(out: str, oracle: dict):
    match = re.search(r"периодов:\s*(\d+),\s*дней всего:\s*(\d+)", out)
    if not match:
        return ["нет строки «периодов: N, дней всего: D»"]
    count, days = int(match.group(1)), int(match.group(2))
    errors = []
    if count != oracle["count"]:
        errors.append(f"периодов {count} != {oracle['count']}")
    if days != oracle["days"]:
        errors.append(f"дней {days} != {oracle['days']}")
    return errors


def case_moving_average(rng: random.Random):
    count = rng.randint(5, 18)
    rows = []
    day = date(2025, 1, 1)
    value = rng.randint(500, 2000)
    for _ in range(count):
        value += rng.randint(-120, 150)
        rows.append((day, value))
        month = day.month + 1
        year = day.year + (month - 1) // 12
        month = (month - 1) % 12 + 1
        day = date(year, month, 1)

    path = CASES_DIR / "balance.csv"
    with path.open("w", encoding="utf-8", newline="") as handle:
        handle.write("period;balance_rub\n")
        for item, amount in rows:
            handle.write(f"{item.isoformat()};{amount}\n")

    return [str(path)], {"rows": len(rows), "values": [amount for _, amount in rows]}


def check_moving_average(out: str, oracle: dict, code: int):
    errors = []
    if "Окно сглаживания: 3" not in out:
        errors.append("не указано окно сглаживания")
    data = lines_with_date(out)
    if len(data) != oracle["rows"]:
        errors.append(f"строк таблицы {len(data)} != {oracle['rows']}")
    for line, value in zip(data, oracle["values"]):
        if str(value) not in line:
            errors.append(f"значение {value} не найдено в строке «{line.strip()[:50]}»")
            break
    if code != 0:
        errors.append(f"код возврата {code}")
    return errors


CASES = {
    "text-stats": (case_text_stats, check_text_stats),
    "csv-profiler": (case_csv_profiler, check_csv_profiler),
    "rpn-calc": (case_rpn_calc, check_rpn_calc),
    "dq-checks": (case_dq_checks, check_dq_checks),
    "log-parser": (case_log_parser, check_log_parser),
    "sort-bench": (case_sort_bench, check_sort_bench),
    "date-periods": (case_date_periods, check_date_periods),
    "moving-average": (case_moving_average, check_moving_average),
}

WITH_CODE = {"dq-checks", "sort-bench", "moving-average"}


# ---------------------------------------------------------------- запуск

def find_php():
    for candidate in Path(os.environ.get("LOCALAPPDATA", "")).glob(
            "Microsoft/WinGet/Packages/PHP.PHP*/php.exe"):
        return candidate
    return Path("php")


def find_build(explicit: str):
    if explicit:
        return Path(explicit)
    for candidate in (ROOT / "build", ROOT / "cpp" / "build"):
        if candidate.exists():
            return candidate
    return ROOT / "build"


def command_for(lang: str, task: str, args, php, build):
    if lang == "php":
        return [str(php), "-d", f"extension_dir={php.parent / 'ext'}", "-d", "extension=mbstring",
                str(ROOT / "php" / PHP_DIR[task] / "index.php")] + args
    if lang == "csharp":
        exe = ROOT / "csharp" / CS_DIR[task] / "bin" / "Release" / "net8.0" / (CS_EXE[task] + ".exe")
        return [str(exe)] + args
    exe = build / (CPP_TARGET[task] + ".exe")
    return [str(exe)] + args


def run_case(lang, task, args, php, build, timeout=25):
    command = command_for(lang, task, args, php, build)
    environment = dict(os.environ)
    if lang == "cpp" and MINGW_BIN:
        environment["PATH"] = str(MINGW_BIN) + os.pathsep + environment.get("PATH", "")
    try:
        result = subprocess.run(command, capture_output=True, timeout=timeout, text=True,
                                encoding="utf-8", errors="replace", env=environment)
    except FileNotFoundError:
        return None, "", "binary not found"
    except subprocess.TimeoutExpired:
        return None, "", "timeout"
    return result.returncode, result.stdout, result.stderr


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=int, default=240)
    parser.add_argument("--task", default="")
    parser.add_argument("--lang", default="")
    parser.add_argument("--build", default="")
    parser.add_argument("--show", type=int, default=3)
    options = parser.parse_args()

    CASES_DIR.mkdir(parents=True, exist_ok=True)
    php = find_php()
    build = find_build(options.build)
    tasks = [options.task] if options.task else TASKS
    langs = [options.lang] if options.lang else ["php", "csharp", "cpp"]

    total_pass = 0
    total_fail = 0
    problems = []

    for task in tasks:
        make_case, check = CASES[task]
        for lang in langs:
            passed = 0
            failed = 0
            shown = 0
            for index in range(options.cases):
                rng = random.Random(zlib.crc32(f"{task}|{lang}|{index}".encode()) & 0xFFFFFFFF)
                args, oracle = make_case(rng)
                code, out, err = run_case(lang, task, args, php, build)

                if code is None:
                    failed += 1
                    problems.append((task, lang, index, err))
                    continue

                errors = check(out, oracle, code) if task in WITH_CODE else check(out, oracle)
                if errors:
                    failed += 1
                    if shown < options.show:
                        shown += 1
                        problems.append((task, lang, index, "; ".join(errors[:3]),
                                         out.strip().splitlines()[:2], err.strip().splitlines()[:2]))
                else:
                    passed += 1

            total_pass += passed
            total_fail += failed
            mark = "ok  " if failed == 0 else "FAIL"
            print(f"[{mark}] {task:14s} {lang:7s} прошло {passed:4d}  упало {failed:3d}")

    print()
    print(f"Всего: прошло {total_pass}, упало {total_fail}")
    for item in problems[:12]:
        print("  проблема:", item)
    return 0 if total_fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
