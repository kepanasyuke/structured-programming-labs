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

TASKS_FILE = Path(__file__).resolve().parent / "tasks.json"
CONFIG = json.loads(TASKS_FILE.read_text(encoding="utf-8"))
TASK_LIST = CONFIG["tasks"]

SOURCES = {
    "php": "php/{}/index.php",
    "csharp": "csharp/{}/Program.cs",
    "cpp": "cpp/{}/main.cpp",
}


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
    for task in TASK_LIST:
        variants = {}
        for lang, template in SOURCES.items():
            path = ROOT / template.format(task[lang])
            funcs, total = functions_of(path, lang)
            variants[lang] = {
                "path": path.relative_to(ROOT).as_posix(),
                "lines": total,
                "functions": funcs,
                "count": len(funcs),
            }
        projects.append({
            "number": task["number"],
            "task": task["id"],
            "title": task["title"],
            "purpose": task["purpose"],
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
