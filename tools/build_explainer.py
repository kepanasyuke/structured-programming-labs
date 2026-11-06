#!/usr/bin/env python3
"""Собирает docs/data.js: список 24 проектов и их функций для страницы-объяснялки.

Запуск: python tools/build_explainer.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

from style_check import find_functions, strip_code  # noqa: E402

TASKS = [
    (1, "text-stats", "Частотный анализ текста", "топ-N слов, стоп-слова"),
    (2, "csv-profiler", "Профиль CSV", "типы, пустые значения, уникальность, min/max"),
    (3, "rpn-calc", "Калькулятор ОПЗ", "выражение → обратная польская запись → результат"),
    (4, "dq-checks", "Правила качества данных", "движок правил над CSV, отчёт нарушений"),
    (5, "log-parser", "Разбор лога", "p50/p95/max по задачам, топ-5 по p95"),
    (6, "sort-bench", "Три сортировки", "проверка корректности и замер времени"),
    (7, "date-periods", "Отчётные периоды", "контроль пересечений и разрывов"),
    (8, "moving-average", "Скользящее среднее", "сглаживание и выбросы по z-score"),
]

SOURCES = {
    "php": ("php/{}/index.php", "01-"),
    "csharp": ("csharp/{}/Program.cs", None),
    "cpp": ("cpp/{}/main.cpp", "_"),
}

CSHARP_DIRS = {
    "text-stats": "TextStats",
    "csv-profiler": "CsvProfiler",
    "rpn-calc": "RpnCalc",
    "dq-checks": "DqChecks",
    "log-parser": "LogParser",
    "sort-bench": "SortBench",
    "date-periods": "DatePeriods",
    "moving-average": "MovingAverage",
}

PHP_DIRS = {
    "text-stats": "01-text-stats",
    "csv-profiler": "02-csv-profiler",
    "rpn-calc": "03-rpn-calc",
    "dq-checks": "04-dq-checks",
    "log-parser": "05-log-parser",
    "sort-bench": "06-sort-bench",
    "date-periods": "07-date-periods",
    "moving-average": "08-moving-average",
}

CPP_DIRS = {task: "0%d_%s" % (number, task.replace("-", "_")) for number, task, _, _ in TASKS}


def roles(name: str) -> str:
    if name.startswith(("print_", "Print")):
        return "печать"
    if name.startswith(("read_", "Read", "load_", "Load", "TryRead", "try_read")):
        return "чтение"
    if name.startswith(("is_", "Is", "has_", "Has", "can_", "Can")):
        return "проверка"
    if name.startswith(("to_", "To", "parse_", "Parse")):
        return "преобразование"
    if name.startswith(("make_", "Make", "build_", "Build", "create_", "Create")):
        return "сборка"
    if name in ("main", "Main", "run", "Run"):
        return "вход"
    return "шаг"


def functions_of(path: Path, lang: str):
    text = path.read_text(encoding="utf-8")
    found = find_functions(strip_code(text), lang)
    items = []
    for name, body, pos, _before in found:
        line = text[:pos].count("\n") + 1
        size = sum(1 for raw in body.splitlines() if raw.strip() and raw.strip() not in ("{", "}"))
        items.append({"name": name, "line": line, "size": size, "role": roles(name)})
    items.sort(key=lambda item: item["line"])
    return items, len(text.splitlines())


def build():
    projects = []
    for number, task, title, purpose in TASKS:
        variants = {}
        for lang in ("php", "csharp", "cpp"):
            if lang == "php":
                path = ROOT / "php" / PHP_DIRS[task] / "index.php"
            elif lang == "csharp":
                path = ROOT / "csharp" / CSHARP_DIRS[task] / "Program.cs"
            else:
                path = ROOT / "cpp" / CPP_DIRS[task] / "main.cpp"
            funcs, total = functions_of(path, lang)
            variants[lang] = {
                "path": path.relative_to(ROOT).as_posix(),
                "lines": total,
                "functions": funcs,
                "count": len(funcs),
            }
        projects.append({
            "number": number,
            "task": task,
            "title": title,
            "purpose": purpose,
            "variants": variants,
        })

    payload = {"projects": projects}
    target = ROOT / "docs" / "data.js"
    target.parent.mkdir(exist_ok=True)
    body = "window.LABS = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    target.write_text(body, encoding="utf-8", newline="\n")
    counts = ", ".join(str(p["variants"]["cpp"]["count"]) for p in projects)
    print(f"docs/data.js: проектов {len(projects)}, функций в C++-версиях: {counts}")


if __name__ == "__main__":
    build()
