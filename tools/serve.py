#!/usr/bin/env python3
"""Локальный веб-интерфейс для 24 учебных программ.

Запуск: python tools/serve.py --open   (или make run)
Страница: http://127.0.0.1:8765/

Сервер принимает поля формы, пишет входные файлы во временную папку,
запускает нужную программу (PHP / C# / C++) и возвращает её вывод.
Только локальная работа: никакого доступа к произвольным путям нет.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import test_labs as labs  # noqa: E402

ROOT = labs.ROOT
WEB = ROOT / "web"
PORT = 8765

SCHEMAS = {
    "text-stats": {
        "title": "Частотный анализ текста",
        "hint": "Вставь текст — программа посчитает символы, слова и топ-10 частот.",
        "fields": [
            {"name": "text", "label": "Текст", "kind": "textarea", "file": "sample.txt",
             "rows": 8, "value": "Данные и данные: отчёт по данным. Клиент, клиент, клиент — база и запрос."},
            {"name": "stopwords", "label": "Стоп-слова (по одному в строке)", "kind": "textarea",
             "file": "stopwords.txt", "rows": 3, "value": "данные\nданных"},
        ],
    },
    "csv-profiler": {
        "title": "Профиль CSV",
        "hint": "Таблица с разделителем «;». Программа покажет типы колонок, пустые значения, уникальность и min/max.",
        "fields": [
            {"name": "csv", "label": "CSV", "kind": "textarea", "file": "profile.csv", "rows": 8,
             "value": "client_id;amount;open_day;note\n1;1500.50;2020-01-31;МСБ\n2;;2021-05-17;Крупный\n3;980.00;2019-12-01;МСБ"},
        ],
    },
    "rpn-calc": {
        "title": "Калькулятор ОПЗ",
        "hint": "Выражение с + − × ÷ и скобками: программа покажет ОПЗ и результат.",
        "fields": [
            {"name": "expr", "label": "Выражение", "kind": "text", "value": "(1240+8940)*2-1500/3"},
        ],
    },
    "dq-checks": {
        "title": "Правила качества данных",
        "hint": "CSV с дефектами: пустой client_id, кривой ИНН, минус в балансе, неизвестный статус, дата в будущем.",
        "fields": [
            {"name": "csv", "label": "CSV", "kind": "textarea", "file": "clients.csv", "rows": 8,
             "value": "client_id;inn;name;segment;open_date;balance_rub;status\n"
                      "1;7707083893;ООО Ромашка;МСБ;2019-04-12;158000.50;active\n"
                      "2;7743013901;АО Вектор;Крупный;2018-01-30;;active\n"
                      ";500100732259;ИП Смирнов;МСБ;2021-09-01;-3500.00;archived"},
        ],
    },
    "log-parser": {
        "title": "Разбор лога",
        "hint": "Строки вида: время | задача | длительность | статус.",
        "fields": [
            {"name": "log", "label": "Лог", "kind": "textarea", "file": "queries.log", "rows": 7,
             "value": "2026-10-01T02:00:03Z | load_clients | 1240 ms | OK\n"
                      "2026-10-01T02:10:11Z | load_accounts | 8940 ms | OK\n"
                      "2026-10-01T02:20:45Z | build_client_mart | 21300 ms | WARN\n"
                      "2026-10-01T02:35:02Z | dq_check_clients | 640 ms | FAIL"},
        ],
    },
    "sort-bench": {
        "title": "Три сортировки",
        "hint": "Размер массива: программа проверит три алгоритма и замерит время.",
        "fields": [
            {"name": "size", "label": "Размер массива", "kind": "number", "value": "2000", "min": 2, "max": 5000},
        ],
    },
    "date-periods": {
        "title": "Отчётные периоды",
        "hint": "Границы диапазона и шаг: месяц, квартал или год.",
        "fields": [
            {"name": "from", "label": "С даты", "kind": "text", "value": "2025-11-15"},
            {"name": "to", "label": "По дату", "kind": "text", "value": "2026-06-30"},
            {"name": "granularity", "label": "Шаг", "kind": "select", "value": "quarter",
             "options": [["month", "месяц"], ["quarter", "квартал"], ["year", "год"]]},
        ],
    },
    "moving-average": {
        "title": "Скользящее среднее",
        "hint": "Ряд «период;значение»: программа сгладит его окном 3 и найдёт выбросы по z-score.",
        "fields": [
            {"name": "csv", "label": "CSV", "kind": "textarea", "file": "balance.csv", "rows": 8,
             "value": "period;balance_rub\n2025-01-31;1240000\n2025-02-28;1285000\n"
                      "2025-03-31;1255000\n2025-04-30;1310000\n2025-05-31;980000"},
        ],
    },
}


def php_path() -> Path:
    for candidate in Path(os.environ.get("LOCALAPPDATA", "")).glob(
            "Microsoft/WinGet/Packages/PHP.PHP*/php.exe"):
        return candidate
    return Path("php")


def run_program(lang: str, task: str, fields: dict) -> dict:
    schema = SCHEMAS[task]
    workspace = Path(tempfile.mkdtemp(prefix="labs-web-"))
    args = []

    for field in schema["fields"]:
        value = str(fields.get(field["name"], field.get("value", "")))
        if field.get("file"):
            target = workspace / field["file"]
            target.write_text(value, encoding="utf-8", newline="\n")
            args.append(str(target))
        else:
            args.append(value)

    started = time.perf_counter()
    code, out, err = labs.run_case(lang, task, args, php_path(), labs.find_build(""), timeout=30)
    elapsed = round((time.perf_counter() - started) * 1000)

    if code is None:
        return {"ok": False, "code": None, "stdout": out, "stderr": err, "ms": elapsed}

    return {"ok": True, "code": code, "stdout": out, "stderr": err, "ms": elapsed}


class Handler(BaseHTTPRequestHandler):
    server_version = "LabsUI/1.0"

    def log_message(self, fmt, *args):  # тише в консоли
        if "/api/" not in self.path:
            super().log_message(fmt, *args)

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path: Path):
        if not path.exists() or not path.is_file():
            self.send_error(404)
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    @staticmethod
    def guess_type(path: Path) -> str:
        return {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".gif": "image/gif",
            ".png": "image/png",
            ".svg": "image/svg+xml",
        }.get(path.suffix, "application/octet-stream")

    def do_GET(self):
        route = self.path.split("?")[0]

        if route == "/api/schema":
            self.send_json({
                "langs": [["php", "PHP"], ["csharp", "C#"], ["cpp", "C++"]],
                "tasks": SCHEMAS,
            })
            return

        if route in ("/", "/index.html"):
            self.send_file(WEB / "index.html")
            return

        if route.startswith("/web/"):
            name = route[len("/web/"):]
            self.send_file(WEB / name)
            return

        if route.startswith("/docs/"):
            self.send_file(ROOT / "docs" / route[len("/docs/"):])
            return

        self.send_error(404)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/run":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_json({"error": "плохой JSON"}, 400)
            return

        lang = payload.get("lang")
        task = payload.get("task")
        fields = payload.get("fields") or {}

        if lang not in ("php", "csharp", "cpp") or task not in SCHEMAS:
            self.send_json({"error": "неизвестный язык или задача"}, 400)
            return

        try:
            self.send_json(run_program(lang, task, fields))
        except subprocess.TimeoutExpired:
            self.send_json({"ok": False, "code": None, "stdout": "", "stderr": "таймаут 30 с", "ms": 30000})
        except Exception as error:  # pragma: no cover
            self.send_json({"error": str(error)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--open", action="store_true")
    options = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", options.port), Handler)
    address = f"http://127.0.0.1:{options.port}/"
    print(f"24 программы на {address}  (Ctrl+C — остановить)")
    if options.open:
        webbrowser.open(address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nостановлено")
    return 0


if __name__ == "__main__":
    sys.exit(main())
