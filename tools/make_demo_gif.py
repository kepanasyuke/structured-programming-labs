#!/usr/bin/env python3
"""Рисует GIF-демо для README: сортировку вставками и шаги ОПЗ.

Для каждого языка — свой набор имён функций, поэтому демо честно показывает
именно тот код, который лежит в php/, csharp/ и cpp/.

Запуск: python tools/make_demo_gif.py
Результат: docs/demo-sort-<lang>.gif, docs/demo-opz-<lang>.gif
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs"

W, H = 720, 380
BG = (246, 244, 239)
PAPER = (255, 255, 255)
INK = (29, 36, 51)
MUTED = (93, 103, 121)
LINE = (220, 215, 204)
ACCENT = (47, 109, 246)
ACCENT_SOFT = (230, 238, 255)
WARN = (224, 134, 0)
WARN_SOFT = (255, 242, 218)
OK = (31, 138, 76)
OK_SOFT = (226, 245, 233)
MOVE = (217, 102, 61)

FONT_DIR = Path("C:/Windows/Fonts")


def load(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_DIR / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


F_MONO = load("consola.ttf", 17)
F_TEXT = load("segoeui.ttf", 16)
F_SMALL = load("segoeui.ttf", 13)
F_TITLE = load("segoeuib.ttf", 18)

DELAY = 110
HOLD = 700

LANGS = {
    "php": {
        "title": "PHP",
        "sort_path": "php/06-sort-bench",
        "opz_path": "php/03-rpn-calc",
        "sort": {
            "start": "insertion_sort",
            "take": "insert_item",
            "shift": "shift_step",
            "place": "shift_right",
        },
        "opz": {
            "tokenize": "tokenize",
            "convert": "to_rpn",
            "number": "to_rpn",
            "open": "to_rpn",
            "close": "to_rpn",
            "operator": "to_rpn",
            "drain": "to_rpn",
            "rpn": "to_rpn",
            "eval_token": "evaluate_rpn",
            "eval_number": "evaluate_rpn",
            "apply": "apply_rpn_operator",
            "result": "evaluate_rpn",
        },
    },
    "csharp": {
        "title": "C#",
        "sort_path": "csharp/SortBench",
        "opz_path": "csharp/RpnCalc",
        "sort": {
            "start": "insertionSort",
            "take": "SortByInsertion",
            "shift": "ShiftRight",
            "place": "ShiftRight",
        },
        "opz": {
            "tokenize": "Tokenize",
            "convert": "TryToRpn",
            "number": "TryToRpn",
            "open": "TryToRpn",
            "close": "TryToRpn",
            "operator": "TryToRpn",
            "drain": "PushOperator",
            "rpn": "TryToRpn",
            "eval_token": "EvaluateAt",
            "eval_number": "EvaluateAt",
            "apply": "ApplyToken",
            "result": "TryEvaluate",
        },
    },
    "cpp": {
        "title": "C++",
        "sort_path": "cpp/06_sort_bench",
        "opz_path": "cpp/03_rpn_calc",
        "sort": {
            "start": "insertion_sort",
            "take": "insert_item",
            "shift": "shift_step",
            "place": "shift_right",
        },
        "opz": {
            "tokenize": "tokenize",
            "convert": "convert_token",
            "number": "emit_number",
            "open": "emit_open",
            "close": "emit_close",
            "operator": "emit_operator",
            "drain": "drain_step",
            "rpn": "to_rpn_checked",
            "eval_token": "eval_token",
            "eval_number": "eval_operator",
            "apply": "apply_operands",
            "result": "final_value",
        },
    },
}


def canvas() -> tuple:
    image = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((14, 12, W - 14, H - 12), radius=16, fill=PAPER, outline=LINE)
    return image, draw


def text_width(draw, text: str, font) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def pill(draw, x: int, y: int, text: str, fill, outline, color, padding=(9, 4)) -> int:
    width = text_width(draw, text, F_MONO)
    height = F_MONO.size + padding[1] * 2
    draw.rounded_rectangle((x, y, x + width + padding[0] * 2, y + height), radius=9, fill=fill, outline=outline)
    draw.text((x + padding[0], y + padding[1] - 1), text, font=F_MONO, fill=color)
    return width + padding[0] * 2


def header(draw, title: str, subtitle: str) -> None:
    draw.text((36, 26), title, font=F_TITLE, fill=INK)
    draw.text((36, 52), subtitle, font=F_SMALL, fill=MUTED)


# ---------------------------------------------------------------- сортировка


def sort_steps(values, names):
    array = list(values)
    steps = [{"a": list(array), "fn": names["start"], "note": "массив из 5 чисел", "cmp": [], "mv": [], "ok": []}]

    for i in range(1, len(array)):
        current = array[i]
        j = i - 1
        steps.append({"a": list(array), "fn": names["take"], "note": f"берём values[{i}] = {current}", "cmp": [i], "mv": [], "ok": []})
        while j >= 0 and array[j] > current:
            array[j + 1] = array[j]
            steps.append({"a": list(array), "fn": names["shift"], "note": f"сдвигаем {array[j]} вправо", "cmp": [], "mv": [j, j + 1], "ok": []})
            j -= 1
        array[j + 1] = current
        steps.append({"a": list(array), "fn": names["place"], "note": f"вставляем {current} на место {j + 1}", "cmp": [], "mv": [j + 1], "ok": []})

    steps.append({"a": list(array), "fn": names["start"], "note": "готово: массив отсортирован", "cmp": [], "mv": [], "ok": list(range(len(array)))})
    return steps


def draw_sort(step, subtitle: str) -> Image.Image:
    image, draw = canvas()
    header(draw, "Сортировка вставками · " + subtitle, "каждый шаг — одна микрофункция с одним return")

    pill(draw, 36, 82, step["fn"] + "()", ACCENT_SOFT, ACCENT, ACCENT)
    draw.text((36 + text_width(draw, step["fn"] + "()", F_MONO) + 32, 88), step["note"], font=F_TEXT, fill=INK)

    base = 300
    left = 60
    slot = (W - 120) // len(step["a"])
    bar_w = int(slot * 0.56)
    top = 120
    height = base - top
    maximum = max(step["a"]) or 1

    for index, value in enumerate(step["a"]):
        x = left + index * slot + (slot - bar_w) // 2
        h = int(height * value / maximum)
        if index in step["mv"]:
            color = MOVE
        elif index in step["cmp"]:
            color = WARN
        elif index in step["ok"]:
            color = OK
        else:
            color = ACCENT
        draw.rounded_rectangle((x, base - h, x + bar_w, base), radius=8, fill=color)
        label = str(value)
        draw.text((x + (bar_w - text_width(draw, label, F_MONO)) // 2, base + 10), label, font=F_MONO, fill=MUTED)

    draw.line((40, base + 2, W - 40, base + 2), fill=LINE, width=2)
    draw.text((36, H - 44), "синий — ждёт, оранжевый — сравнение, тёмный — сдвиг, зелёный — на месте", font=F_SMALL, fill=MUTED)
    return image


# ---------------------------------------------------------------- ОПЗ

OPS = {"+": 1, "-": 1, "*": 2, "/": 2}


def tokenize(expr):
    tokens, current = [], ""
    for ch in expr:
        if ch.isdigit() or ch == ".":
            current += ch
        elif ch in OPS or ch in "()":
            if current:
                tokens.append(current)
                current = ""
            tokens.append(ch)
        elif ch == " ":
            if current:
                tokens.append(current)
                current = ""
    if current:
        tokens.append(current)
    return tokens


def is_number(token: str) -> bool:
    body = token[1:] if token.startswith("-") else token
    return bool(body) and any(c.isdigit() for c in body) and all(c.isdigit() or c == "." for c in body)


def opz_steps(expr, names):
    tokens = tokenize(expr)
    steps = [{"tokens": tokens, "idx": -1, "stack": [], "out": [], "eval": [],
              "fn": names["tokenize"], "note": f"разобрали на {len(tokens)} токенов", "result": ""}]
    stack, out, evals = [], [], []

    def snap(fn, note):
        steps.append({"tokens": tokens, "idx": i, "stack": list(stack), "out": list(out),
                      "eval": list(evals), "fn": fn, "note": note, "result": ""})

    for i, token in enumerate(tokens):
        snap(names["convert"], f"берём токен «{token}»")
        if is_number(token):
            out.append(token)
            snap(names["number"], "число сразу в выход")
        elif token == "(":
            stack.append(token)
            snap(names["open"], "скобка ждёт в стеке")
        elif token == ")":
            while stack and stack[-1] != "(":
                out.append(stack.pop())
                snap(names["drain"], "оператор из стека в выход")
            if stack:
                stack.pop()
            snap(names["close"], "скобка закрыта")
        else:
            while stack and OPS.get(stack[-1], 0) >= OPS[token]:
                out.append(stack.pop())
                snap(names["drain"], "старшинство: оператор в выход")
            stack.append(token)
            snap(names["operator"], "оператор в стек")

    while stack:
        out.append(stack.pop())
        snap(names["drain"], "хвост стека в выход")

    snap(names["rpn"], "ОПЗ готова: " + " ".join(out))

    for i, token in enumerate(out):
        steps.append({"tokens": out, "idx": i, "stack": [], "out": list(out), "eval": list(evals),
                      "fn": names["eval_token"], "note": f"читаем «{token}»", "result": ""})
        if is_number(token):
            evals.append(float(token))
            steps.append({"tokens": out, "idx": i, "stack": [], "out": list(out), "eval": list(evals),
                          "fn": names["eval_number"], "note": "число в стек вычисления", "result": ""})
        else:
            right = evals.pop()
            left = evals.pop()
            value = left + right if token == "+" else left - right if token == "-" else left * right if token == "*" else (0 if right == 0 else left / right)
            evals.append(value)
            steps.append({"tokens": out, "idx": i, "stack": [], "out": list(out), "eval": list(evals),
                          "fn": names["apply"], "note": f"{left:g} {token} {right:g} = {value:g}", "result": ""})

    result = evals[0] if len(evals) == 1 else 0
    steps.append({"tokens": out, "idx": -1, "stack": [], "out": list(out), "eval": list(evals),
                  "fn": names["result"], "note": "результат", "result": f"{result:g}"})
    return steps


def draw_opz(step, subtitle: str) -> Image.Image:
    image, draw = canvas()
    header(draw, "ОПЗ-калькулятор · " + subtitle, "(1240+8940)*2-1500/3 → обратная польская запись → результат")

    x, y = 36, 80
    for index, token in enumerate(step["tokens"]):
        fill, outline, color = (252, 251, 248), LINE, INK
        if index == step["idx"]:
            fill, outline, color = ACCENT_SOFT, ACCENT, ACCENT
        x += pill(draw, x, y, token, fill, outline, color) + 6
        if x > W - 60:
            x, y = 36, y + 36

    draw.text((36, 160), "СТЕК ОПЕРАТОРОВ", font=F_SMALL, fill=MUTED)
    draw.text((300, 160), "ОПЗ НА ВЫХОДЕ", font=F_SMALL, fill=MUTED)
    draw.text((560, 160), "СТЕК ВЫЧИСЛЕНИЯ", font=F_SMALL, fill=MUTED)

    draw.rounded_rectangle((36, 182, 270, 282), radius=10, outline=LINE, fill=(252, 251, 248))
    draw.rounded_rectangle((300, 182, 532, 282), radius=10, outline=LINE, fill=(252, 251, 248))
    draw.rounded_rectangle((560, 182, W - 36, 282), radius=10, outline=LINE, fill=(252, 251, 248))

    x = 44
    for token in step["stack"]:
        x += pill(draw, x, 190, token, WARN_SOFT, WARN, WARN) + 5

    x, y2 = 308, 190
    for token in step["out"]:
        width = pill(draw, x, y2, token, PAPER, LINE, INK)
        x += width + 5
        if x > 500:
            x, y2 = 308, y2 + 32

    x = 568
    for value in step["eval"]:
        x += pill(draw, x, 190, f"{value:g}", OK_SOFT, OK, OK) + 5

    pill(draw, 36, 300, step["fn"] + "()", ACCENT_SOFT, ACCENT, ACCENT)
    draw.text((36 + text_width(draw, step["fn"] + "()", F_MONO) + 30, 305), step["note"], font=F_TEXT, fill=INK)

    if step["result"]:
        draw.text((36, H - 44), "Результат: " + step["result"], font=F_TITLE, fill=OK)
    return image


def save_gif(frames, path: Path) -> None:
    converted = [frame.convert("P", palette=Image.ADAPTIVE, colors=64) for frame in frames]
    durations = [DELAY] * len(converted)
    durations[-1] = HOLD
    converted[0].save(path, save_all=True, append_images=converted[1:], duration=durations, loop=0, optimize=True, disposal=2)


def build_language(lang: str, config: dict) -> None:
    sort_frames = [draw_sort(step, config["sort_path"]) for step in sort_steps([5, 3, 9, 1, 4], config["sort"])]
    save_gif(sort_frames, OUT / f"demo-sort-{lang}.gif")

    opz_frames = [draw_opz(step, config["opz_path"]) for step in opz_steps("(1240+8940)*2-1500/3", config["opz"])]
    save_gif(opz_frames, OUT / f"demo-opz-{lang}.gif")

    sort_size = (OUT / f"demo-sort-{lang}.gif").stat().st_size
    opz_size = (OUT / f"demo-opz-{lang}.gif").stat().st_size
    print(f"{lang}: sort {len(sort_frames)} кадров / {sort_size // 1024} КБ, "
          f"opz {len(opz_frames)} кадров / {opz_size // 1024} КБ")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for lang, config in LANGS.items():
        build_language(lang, config)


if __name__ == "__main__":
    main()
