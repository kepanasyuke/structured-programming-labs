#!/usr/bin/env python3
"""Нагрузочные тесты для 24 учебных проектов: 240 сгенерированных кейсов на проект.

Кейс — отдельный запуск программы с независимым оракулом. Чёрный ящик:
проверяем только то, что видно снаружи (вывод, код возврата).

Запуск:
    python tools/test_labs.py                 # все проекты, 240 кейсов
    python tools/test_labs.py --cases 20      # быстрый прогон
    python tools/test_labs.py --task rpn-calc --lang cpp
    python tools/test_labs.py --build cpp/build

Сборка C++ (один раз):
    cmake -S cpp -B build -G "MinGW Makefiles"
"""

import argparse
import json
import os
import random
import subprocess
import sys
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from labs_cases import CASES, CASES_DIR, WITH_CODE  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

TASKS_FILE = Path(__file__).resolve().parent / "tasks.json"
CONFIG = json.loads(TASKS_FILE.read_text(encoding="utf-8"))
TASK_LIST = CONFIG["tasks"]
TASKS = [task["id"] for task in TASK_LIST]
BY_ID = {task["id"]: task for task in TASK_LIST}

PHP_DIR = {task["id"]: task["php"] for task in TASK_LIST}
CS_DIR = {task["id"]: task["csharp"] for task in TASK_LIST}
CS_EXE = {task["id"]: task["cs_exe"] for task in TASK_LIST}
CPP_TARGET = {task["id"]: task["cpp"] for task in TASK_LIST}

MINGW_BIN = next(
    (path.parent for path in Path(os.environ.get("LOCALAPPDATA", "")).glob(
        "Microsoft/WinGet/Packages/BrechtSanders.WinLibs*/mingw64/bin/g++.exe")),
    None,
)


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


def cyrillic_score(text: str) -> int:
    return sum(1 for char in text if "\u0410" <= char <= "\u044f")


def decode_console(raw: bytes) -> str:
    """Программы пишут UTF-8, а консоль Windows иногда отдаёт cp866/cp1251.

    Сначала пробуем строгий UTF-8: если байты валидны, это и есть правильный
    текст. Иначе перебираем однобайтовые кодировки консоли и берём вариант
    с наибольшим числом кириллических букв.
    """
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        pass

    best = raw.decode("utf-8", "replace")
    best_score = cyrillic_score(best)

    for encoding in ("cp866", "cp1251"):
        try:
            candidate = raw.decode(encoding)
        except UnicodeDecodeError:
            continue
        score = cyrillic_score(candidate)
        if score > best_score:
            best, best_score = candidate, score

    return best


def run_case(lang, task, args, php, build, timeout=25):
    command = command_for(lang, task, args, php, build)
    environment = dict(os.environ)
    if lang == "cpp" and MINGW_BIN:
        environment["PATH"] = str(MINGW_BIN) + os.pathsep + environment.get("PATH", "")
    try:
        result = subprocess.run(command, capture_output=True, timeout=timeout, env=environment)
    except FileNotFoundError:
        return None, "", "binary not found"
    except subprocess.TimeoutExpired:
        return None, "", "timeout"
    return result.returncode, decode_console(result.stdout), decode_console(result.stderr)


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
