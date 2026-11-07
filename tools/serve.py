#!/usr/bin/env python3
"""Локальный веб-интерфейс для 24 учебных программ.

Запуск: python tools/serve.py --open   (или make dev)
Страница: http://127.0.0.1:8765/

Сервер принимает поля формы, пишет входные файлы во временную папку,
запускает нужную программу (PHP / C# / C++) и возвращает её вывод.
Только локальная работа: пути и имена программ берутся из tools/tasks.json,
произвольные файлы не отдаются и не исполняются.
"""

import argparse
import json
import subprocess
import sys
import tempfile
import time
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import test_labs as labs  # noqa: E402

ROOT = labs.ROOT
WEB = ROOT / "web"
DOCS = ROOT / "docs"
PORT = 8765
MAX_BODY = 5 * 1024 * 1024
TIMEOUT_SECONDS = 30

CONFIG = json.loads((Path(__file__).resolve().parent / "tasks.json").read_text(encoding="utf-8"))
LANGS = CONFIG["langs"]
TASK_LIST = CONFIG["tasks"]
SCHEMAS = {task["id"]: {"title": task["title"], "hint": task["hint"], "fields": task["fields"]}
           for task in TASK_LIST}
PATHS = {
    "php": {task["id"]: f"php/{task['php']}/index.php" for task in TASK_LIST},
    "csharp": {task["id"]: f"csharp/{task['csharp']}/Program.cs" for task in TASK_LIST},
    "cpp": {task["id"]: f"cpp/{task['cpp']}/main.cpp" for task in TASK_LIST},
}


def php_path() -> Path:
    import os

    for candidate in Path(os.environ.get("LOCALAPPDATA", "")).glob(
            "Microsoft/WinGet/Packages/PHP.PHP*/php.exe"):
        return candidate
    return Path("php")


def collect_args(task_id: str, fields: dict, workspace: Path) -> list:
    """Раскладывает поля формы по файлам и аргументам командной строки."""
    schema = SCHEMAS[task_id]
    args = []

    for field in schema["fields"]:
        if field["name"] not in fields:
            raise ValueError(f"не заполнено поле «{field['label']}»")

        value = str(fields[field["name"]])
        if field.get("file"):
            target = workspace / field["file"]
            target.write_text(value, encoding="utf-8", newline="\n")
            args.append(str(target))
        else:
            args.append(value)

    return args


def run_program(lang: str, task_id: str, fields: dict) -> dict:
    workspace = Path(tempfile.mkdtemp(prefix="labs-web-"))

    try:
        args = collect_args(task_id, fields, workspace)
        started = time.perf_counter()
        code, out, err = labs.run_case(lang, task_id, args, php_path(), labs.find_build(""),
                                       timeout=TIMEOUT_SECONDS)
        elapsed = round((time.perf_counter() - started) * 1000)

        if code is None:
            return {"ok": False, "code": None, "stdout": out, "stderr": err, "ms": elapsed}

        return {"ok": True, "code": code, "stdout": out, "stderr": err, "ms": elapsed}
    finally:
        import shutil

        shutil.rmtree(workspace, ignore_errors=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "LabsUI/1.1"

    def log_message(self, fmt, *args):
        if "/api/" not in self.path:
            super().log_message(fmt, *args)

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status: int, message: str):
        self.send_json({"error": message}, status)

    def discard_body(self, length: int, limit: int = 32 * 1024 * 1024) -> None:
        """Дочитывает тело, чтобы клиент получил честный ответ, а не обрыв связи."""
        remaining = min(length, limit)

        while remaining > 0:
            chunk = self.rfile.read(min(65536, remaining))
            if not chunk:
                return
            remaining -= len(chunk)

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

    def send_file(self, base: Path, relative: str):
        """Отдаёт файл только из разрешённой папки: без выхода через «..» и «%2e%2e»."""
        decoded = urllib.parse.unquote(relative)
        target = (base / decoded).resolve()
        allowed = base.resolve()

        if allowed not in target.parents or not target.is_file():
            self.send_error(404)
            return

        body = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(target))
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        route = self.path.split("?")[0]

        if route == "/api/schema":
            self.send_json({"langs": LANGS, "tasks": SCHEMAS, "paths": PATHS})
            return

        if route in ("/", "/index.html"):
            self.send_file(WEB, "index.html")
            return

        if route.startswith("/web/"):
            self.send_file(WEB, route[len("/web/"):])
            return

        if route.startswith("/docs/"):
            self.send_file(DOCS, route[len("/docs/"):])
            return

        self.send_error(404)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/run":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error_json(400, "плохой Content-Length")
            return

        if length > MAX_BODY:
            self.discard_body(length)
            self.send_error_json(413, f"тело больше {MAX_BODY // (1024 * 1024)} МБ")
            return

        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_error_json(400, "плохой JSON")
            return

        lang = payload.get("lang")
        task_id = payload.get("task")
        fields = payload.get("fields") or {}

        if lang not in PATHS or task_id not in SCHEMAS:
            self.send_error_json(400, "неизвестный язык или задача")
            return

        try:
            self.send_json(run_program(lang, task_id, fields))
        except ValueError as error:
            self.send_error_json(400, str(error))
        except Exception as error:  # pragma: no cover
            self.send_error_json(500, str(error))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--open", action="store_true")
    options = parser.parse_args()

    ThreadingHTTPServer.daemon_threads = True
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
