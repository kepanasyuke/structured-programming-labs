#!/usr/bin/env python3
"""Проверка строгого структурного стиля в учебных проектах.

Правила:
  1. Ровно один return на функцию (в void-функциях допускается 0).
     Исключение: return внутри switch-case.
  2. Нет continue.
  3. Нет break вне switch.
  4. Нет while(0)/do{}while(0), for(;;), goto.
  5. Тело функции: не более MAX_BODY_LINES строк; помечаются функции длиннее SOFT_LIMIT.

Запуск: python tools/style_check.py [корень]
"""

import re
import sys
from pathlib import Path

MAX_BODY_LINES = 6
SOFT_LIMIT = 2
CONTROL_WORDS = {
    "if", "for", "foreach", "while", "switch", "catch", "using", "lock",
    "return", "new", "sizeof", "decltype", "static_cast", "reinterpret_cast",
    "const_cast", "dynamic_cast", "function", "else", "do", "try", "finally",
    "alignof", "noexcept", "throw", "delete", "operator",
}


def strip_code(src: str) -> str:
    """Заменяет комментарии и строковые литералы пробелами, сохраняя переводы строк."""
    out = []
    i = 0
    n = len(src)
    while i < n:
        ch = src[i]
        two = src[i:i + 2]
        if two == "//":
            j = src.find("\n", i)
            j = n if j < 0 else j
            out.append(" " * (j - i))
            i = j
            continue
        if two == "/*":
            j = src.find("*/", i + 2)
            j = n if j < 0 else j + 2
            out.append("".join("\n" if c == "\n" else " " for c in src[i:j]))
            i = j
            continue
        if ch == "#" and src[i:i + 2] != "#{":
            j = src.find("\n", i)
            j = n if j < 0 else j
            out.append(" " * (j - i))
            i = j
            continue
        if ch in "\"'`":
            j = i + 1
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if src[j] == ch:
                    j += 1
                    break
                j += 1
            out.append("".join("\n" if c == "\n" else " " for c in src[i:j]))
            i = j
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def match_brace(src: str, open_pos: int) -> int:
    depth = 0
    for idx in range(open_pos, len(src)):
        if src[idx] == "{":
            depth += 1
        elif src[idx] == "}":
            depth -= 1
            if depth == 0:
                return idx
    return len(src) - 1


def close_paren(src: str, open_pos: int) -> int:
    depth = 0
    for idx in range(open_pos, len(src)):
        if src[idx] == "(":
            depth += 1
        elif src[idx] == ")":
            depth -= 1
            if depth == 0:
                return idx
    return open_pos


def find_functions_php(src: str):
    result = []
    for match in re.finditer(r"\bfunction\s+([A-Za-z_]\w*)\s*\(", src):
        paren = src.find("(", match.end() - 1)
        end_paren = close_paren(src, paren)
        tail = src[end_paren + 1:end_paren + 400]
        body_start = tail.find("{")
        if body_start < 0:
            continue
        open_pos = end_paren + 1 + body_start
        close_pos = match_brace(src, open_pos)
        result.append((match.group(1), src[open_pos + 1:close_pos], open_pos, ""))
    return result


def find_functions(src: str, lang: str):
    """Возвращает список (имя, тело, позиция_тела)."""
    if lang == "php":
        return find_functions_php(src)
    result = []
    for match in re.finditer(r"\b([A-Za-z_]\w*)\s*\(", src):
        name = match.group(1)
        if name in CONTROL_WORDS:
            continue
        before = src[:match.start()].rstrip()
        if before.endswith(".") or before.endswith("->") or before.endswith("::"):
            continue
        paren = src.find("(", match.start())
        end_paren = close_paren(src, paren)
        tail = src[end_paren + 1:end_paren + 400]
        body_start = tail.find("{")
        if body_start < 0 or ";" in tail[:body_start]:
            continue
        if lang == "php" and not re.search(r"\bfunction\s+$", src[:match.start()] + name):
            continue
        open_pos = end_paren + 1 + body_start
        close_pos = match_brace(src, open_pos)
        result.append((name, src[open_pos + 1:close_pos], open_pos, before))
    return result


def body_lines(body: str):
    lines = []
    for raw in body.splitlines():
        text = raw.strip()
        if not text or text in ("{", "}", "};", "else", "else {"):
            continue
        lines.append(text)
    return lines


def span_positions(body: str):
    """Возвращает список интервалов (start, end) для switch-блоков."""
    spans = []
    for match in re.finditer(r"\bswitch\s*\(", body):
        paren_end = close_paren(body, match.start() + len("switch "))
        brace = body.find("{", paren_end)
        if brace < 0:
            continue
        spans.append((brace, match_brace(body, brace)))
    return spans


def in_spans(pos: int, spans) -> bool:
    return any(start <= pos <= end for start, end in spans)


def check_function(name, body):
    issues = []
    cleaned = body
    spans = span_positions(cleaned)
    returns = [m.start() for m in re.finditer(r"\breturn\b", cleaned)]
    outside = [pos for pos in returns if not in_spans(pos, spans)]
    if len(outside) > 1:
        issues.append(f"return ×{len(outside)} (нужен один)")
    if re.search(r"\bcontinue\b", cleaned):
        issues.append("continue")
    breaks = [m.start() for m in re.finditer(r"\bbreak\b", cleaned)]
    if any(not in_spans(pos, spans) for pos in breaks):
        issues.append("break вне switch")
    if re.search(r"\bwhile\s*\(\s*(0|false|false\s*===\s*false)\s*\)", cleaned):
        issues.append("while(0)")
    if re.search(r"\bfor\s*\(\s*;\s*;\s*\)", cleaned):
        issues.append("for(;;)")
    if re.search(r"\bgoto\b", cleaned):
        issues.append("goto")
    lines = body_lines(cleaned)
    if len(lines) > MAX_BODY_LINES:
        issues.append(f"тело {len(lines)} строк (> {MAX_BODY_LINES})")
    soft = len(lines) > SOFT_LIMIT
    return issues, len(lines), soft


def scan(path: Path, lang: str):
    src = path.read_text(encoding="utf-8")
    cleaned = strip_code(src)
    funcs = find_functions(cleaned, lang)
    problems = []
    soft_count = 0
    for name, body, _pos, _before in funcs:
        issues, size, soft = check_function(name, body)
        soft_count += 1 if soft and not issues else 0
        if issues:
            problems.append((name, size, issues))
    return len(funcs), problems, soft_count


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent)
    targets = []
    for pattern, lang in ((r"php\*/index.php", "php"), (r"csharp\*/*.cs", "csharp"),
                          (r"cpp\*/*.cpp", "cpp")):
        targets.extend((p, lang) for p in sorted(root.glob(pattern)))
    total_funcs = 0
    total_problems = 0
    total_soft = 0
    for path, lang in targets:
        funcs, problems, soft = scan(path, lang)
        total_funcs += funcs
        total_soft += soft
        rel = path.relative_to(root)
        if problems:
            total_problems += len(problems)
            print(f"[FAIL] {rel}  функций={funcs} нарушений={len(problems)}")
            for name, size, issues in problems:
                print(f"        {name}(): {', '.join(issues)}")
        else:
            print(f"[ok]   {rel}  функций={funcs}")
    print()
    print(f"Файлов: {len(targets)}  функций: {total_funcs}  нарушений: {total_problems}  "
          f"функций длиннее {SOFT_LIMIT} строк (без нарушений): {total_soft}")
    return 1 if total_problems else 0


if __name__ == "__main__":
    sys.exit(main())
