PYTHON ?= python
PORT ?= 8765

.DEFAULT_GOAL := help

.PHONY: help run serve gifs pages check test quick build clean

help:
	@echo "24 учебных проекта — что можно сделать:"
	@echo "  make run     собрать, поднять интерфейс и открыть браузер"
	@echo "  make serve   поднять интерфейс без открытия браузера"
	@echo "  make gifs    перерисовать GIF-демо для README"
	@echo "  make pages   пересобрать карту функций для объяснялки"
	@echo "  make check   проверить структурный стиль (один return, без continue)"
	@echo "  make test    полный прогон 5760 тестов"
	@echo "  make quick   быстрый прогон тестов (20 кейсов на проект)"
	@echo "  make build   собрать C# и C++"
	@echo "  make clean   удалить артефакты сборки"

run: build gifs
	$(PYTHON) tools/serve.py --open --port $(PORT)

serve: build
	$(PYTHON) tools/serve.py --port $(PORT)

gifs:
	$(PYTHON) tools/make_demo_gif.py

pages:
	$(PYTHON) tools/build_explainer.py

check:
	$(PYTHON) tools/style_check.py

test:
	$(PYTHON) tools/test_labs.py

quick:
	$(PYTHON) tools/test_labs.py --cases 20

build:
	$(PYTHON) tools/build_all.py

clean:
	$(PYTHON) -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').glob('build')]"
	$(PYTHON) -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('csharp').glob('*/bin')]"
	$(PYTHON) -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('csharp').glob('*/obj')]"
