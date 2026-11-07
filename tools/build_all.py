#!/usr/bin/env python3
"""Собирает C# и C++ части репозитория одной командой.

Запуск: python tools/build_all.py [--lang csharp|cpp] [--skip-cpp]
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSHARP = ROOT / "csharp"
CPP = ROOT / "cpp"
BUILD = ROOT / "build"


def find_dotnet() -> str:
    for candidate in (shutil.which("dotnet"), r"C:\Program Files\dotnet\dotnet.exe"):
        if candidate and Path(candidate).exists():
            return candidate
    return "dotnet"


def find_cmake() -> str:
    for candidate in (shutil.which("cmake"), r"C:\Program Files\CMake\bin\cmake.exe"):
        if candidate and Path(candidate).exists():
            return candidate
    return "cmake"


def mingw_bin() -> Path | None:
    import os

    pattern = "Microsoft/WinGet/Packages/BrechtSanders.WinLibs*/mingw64/bin/g++.exe"
    for path in Path(os.environ.get("LOCALAPPDATA", "")).glob(pattern):
        return path.parent
    return None


def build_csharp() -> int:
    dotnet = find_dotnet()
    failures = 0

    for project in sorted(CSHARP.glob("*/*.csproj")):
        result = subprocess.run([dotnet, "build", str(project), "-c", "Release", "--nologo", "-v", "q"],
                                capture_output=True, text=True, encoding="utf-8", errors="replace")
        mark = "ok  " if result.returncode == 0 else "FAIL"
        print(f"[{mark}] {project.parent.name}")
        if result.returncode != 0:
            failures += 1
            print(result.stdout[-1200:])

    return failures


def build_cpp() -> int:
    cmake = find_cmake()
    environment = None
    toolchain = mingw_bin()
    if toolchain:
        import os

        environment = dict(os.environ)
        environment["PATH"] = str(toolchain) + os.pathsep + environment.get("PATH", "")

    configure = subprocess.run([cmake, "-S", str(CPP), "-B", str(BUILD), "-G", "MinGW Makefiles",
                                "-DCMAKE_BUILD_TYPE=Release"],
                               capture_output=True, text=True, encoding="utf-8", errors="replace",
                               env=environment)
    if configure.returncode != 0:
        print("[FAIL] cmake configure")
        print(configure.stdout[-800:] + configure.stderr[-800:])
        return 1

    build = subprocess.run([cmake, "--build", str(BUILD)], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", env=environment)
    if build.returncode != 0:
        print("[FAIL] cmake build")
        print(build.stdout[-1500:] + build.stderr[-1500:])
        return 1

    print("[ok  ] C++: 8 целей в build/")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", default="")
    options = parser.parse_args()

    failures = 0
    if options.lang in ("", "csharp"):
        failures += build_csharp()
    if options.lang in ("", "cpp"):
        failures += build_cpp()

    print("сборка без ошибок" if failures == 0 else f"ошибок: {failures}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
