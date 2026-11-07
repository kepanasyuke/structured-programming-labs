/* Объяснялка по структурному стилю: ОПЗ, сортировки, каталог 24 проектов, игры. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  };
  var pad = function (value) { return value < 10 ? "0" + value : String(value); };

  /* ================= вкладки ================= */

  var modes = { opz: null, sorts: null, catalog: null, kids: null, games: null };

  function showMode(name) {
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
      tab.classList.toggle("active", tab.dataset.mode === name);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".mode"), function (panel) {
      panel.classList.toggle("active", panel.id === "mode-" + name);
    });
    if (modes[name]) { modes[name](); }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
    tab.addEventListener("click", function () { showMode(tab.dataset.mode); });
  });

  /* ================= ОПЗ ================= */

  var OPZ = {
    steps: [],
    index: 0,
    timer: null,
    playing: false,
    result: "",
    tokens: []
  };

  var OPS = { "+": 1, "-": 1, "*": 2, "/": 2 };

  function tokenize(expr) {
    var tokens = [];
    var current = "";
    var i;
    var ch;
    var error = "";

    for (i = 0; i < expr.length; i += 1) {
      ch = expr.charAt(i);
      var isDigit = ch >= "0" && ch <= "9";
      var isDot = ch === "." || ch === ",";
      var isOp = OPS[ch] !== undefined;
      var isBracket = ch === "(" || ch === ")";
      var isSpace = ch === " " || ch === "\t";

      if (isDigit || isDot) {
        current += ch;
      } else if (isOp || isBracket || isSpace) {
        if (current !== "") { tokens.push(current); current = ""; }
        if (isOp || isBracket) { tokens.push(ch); }
      } else {
        error = "неизвестный символ: " + ch;
      }
    }
    if (current !== "") { tokens.push(current); }

    return { tokens: tokens, error: error };
  }

  function isNumber(token) {
    var body = token.charAt(0) === "-" ? token.slice(1) : token;
    return body !== "" && body.split("").every(function (ch) { return (ch >= "0" && ch <= "9") || ch === "." || ch === ","; })
      && body.split("").some(function (ch) { return ch >= "0" && ch <= "9"; });
  }

  function toNumber(token) {
    return parseFloat(token.replace(",", "."));
  }

  function pushSnapshot(steps, fn, note, ctx) {
    steps.push({
      fn: fn,
      note: note,
      tokenIndex: ctx.tokenIndex,
      stack: ctx.stack.slice(),
      out: ctx.out.slice(),
      evalStack: ctx.evalStack.slice(),
      phase: ctx.phase,
      result: ctx.result
    });
  }

  function convert(tokens) {
    var ctx = { tokenIndex: -1, stack: [], out: [], evalStack: [], phase: "convert", result: "" };
    var steps = [];
    var i;

    for (i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      ctx.tokenIndex = i;
      pushSnapshot(steps, "convert_token", "берём токен «" + token + "»", ctx);

      if (isNumber(token)) {
        ctx.out.push(token);
        pushSnapshot(steps, "emit_number", "число уходит в выход", ctx);
      } else if (token === "(") {
        ctx.stack.push(token);
        pushSnapshot(steps, "emit_open", "скобка ждёт в стеке", ctx);
      } else if (token === ")") {
        while (ctx.stack.length > 0 && ctx.stack[ctx.stack.length - 1] !== "(") {
          ctx.out.push(ctx.stack.pop());
          pushSnapshot(steps, "drain_step", "закрываем скобку: оператор в выход", ctx);
        }
        if (ctx.stack.length > 0) { ctx.stack.pop(); }
        pushSnapshot(steps, "emit_close", "скобка закрыта", ctx);
      } else {
        while (ctx.stack.length > 0 && OPS[ctx.stack[ctx.stack.length - 1]] >= OPS[token]) {
          ctx.out.push(ctx.stack.pop());
          pushSnapshot(steps, "drain_step", "старшинство: оператор в выход", ctx);
        }
        ctx.stack.push(token);
        pushSnapshot(steps, "emit_operator", "оператор в стек", ctx);
      }
    }

    while (ctx.stack.length > 0) {
      ctx.out.push(ctx.stack.pop());
      pushSnapshot(steps, "drain_step", "хвост стека в выход", ctx);
    }
    pushSnapshot(steps, "to_rpn_checked", "ОПЗ готова: " + ctx.out.join(" "), ctx);

    return steps;
  }

  function evaluate(rpn, steps) {
    var ctx = { tokenIndex: -1, stack: [], out: rpn.slice(), evalStack: [], phase: "eval", result: "" };
    var i;

    for (i = 0; i < rpn.length; i += 1) {
      var token = rpn[i];
      ctx.tokenIndex = i;
      pushSnapshot(steps, "eval_token", "читаем «" + token + "»", ctx);

      if (isNumber(token)) {
        ctx.evalStack.push(toNumber(token));
        pushSnapshot(steps, "eval_operator", "число в стек вычисления", ctx);
      } else {
        var right = ctx.evalStack.pop();
        var left = ctx.evalStack.pop();
        var value = token === "+" ? left + right
          : token === "-" ? left - right
            : token === "*" ? left * right
              : right === 0 ? 0 : left / right;
        ctx.evalStack.push(value);
        pushSnapshot(steps, "apply_operands", left + " " + token + " " + right + " = " + value, ctx);
      }
    }

    ctx.result = ctx.evalStack.length === 1 ? String(ctx.evalStack[0]) : "ошибка";
    pushSnapshot(steps, "final_value", "результат: " + ctx.result, ctx);

    return ctx.result;
  }

  function buildTrace(expr) {
    var scanned = tokenize(expr);
    if (scanned.error) { return { error: scanned.error }; }
    if (scanned.tokens.length === 0) { return { error: "пустое выражение" }; }

    var steps = [];
    steps.push({
      fn: "tokenize",
      note: "разобрали выражение на " + scanned.tokens.length + " токенов",
      tokenIndex: -1, stack: [], out: [], evalStack: [], phase: "convert", result: ""
    });

    steps = steps.concat(convert(scanned.tokens));
    var rpn = steps[steps.length - 1].out.slice();
    var result = evaluate(rpn, steps);

    return { steps: steps, tokens: scanned.tokens, rpn: rpn, result: result };
  }

  function chip(text, cls) {
    return el("span", "chip" + (cls ? " " + cls : ""), text);
  }

  function renderOpzControls() {
    var step = OPZ.steps[OPZ.index] || OPZ.steps[0];
    var percent = Math.round(100 * OPZ.index / Math.max(1, OPZ.steps.length - 1));

    $("opz-bar").style.width = percent + "%";
    $("opz-fn").textContent = step.fn + "()";
    $("opz-note").textContent = step.note;
    $("opz-result").textContent = OPZ.result ? "Результат: " + OPZ.result : "";

    var tokens = $("opz-tokens");
    tokens.innerHTML = "";
    OPZ.tokens.forEach(function (token, index) {
      var cls = isNumber(token) ? "" : "op";
      if (index === step.tokenIndex) { cls += " active"; }
      if (index < step.tokenIndex) { cls += " done"; }
      tokens.appendChild(chip(token, cls));
    });

    var stack = $("opz-stack");
    stack.innerHTML = "";
    step.stack.forEach(function (item) { stack.appendChild(chip(item, "op")); });

    var out = $("opz-out");
    out.innerHTML = "";
    step.out.forEach(function (item) { out.appendChild(chip(item)); });

    var evalStack = $("opz-eval");
    evalStack.innerHTML = "";
    step.evalStack.forEach(function (item) { evalStack.appendChild(chip(String(item))); });

    $("opz-step").disabled = OPZ.index >= OPZ.steps.length - 1;
  }

  function opzReset() {
    stopOpz();
    var expr = $("opz-input").value;
    var trace = buildTrace(expr);

    if (trace.error) {
      $("opz-error").hidden = false;
      $("opz-error").textContent = "Ошибка: " + trace.error;
      OPZ.steps = [];
      OPZ.tokens = [];
      OPZ.index = 0;
      OPZ.result = "";
      return;
    }

    $("opz-error").hidden = true;
    OPZ.steps = trace.steps;
    OPZ.tokens = trace.tokens;
    OPZ.index = 0;
    OPZ.result = trace.result;
    renderOpzControls();
  }

  function stopOpz() {
    OPZ.playing = false;
    if (OPZ.timer) { clearInterval(OPZ.timer); OPZ.timer = null; }
    $("opz-play").textContent = "Пуск";
  }

  function speedDelay() {
    var value = parseInt($("opz-speed").value, 10);
    return Math.round(1400 - value * 120);
  }

  function playOpz() {
    if (OPZ.steps.length === 0) { return; }
    if (OPZ.playing) { stopOpz(); return; }

    OPZ.playing = true;
    $("opz-play").textContent = "Пауза";
    OPZ.timer = setInterval(function () {
      if (OPZ.index >= OPZ.steps.length - 1) { stopOpz(); return; }
      OPZ.index += 1;
      renderOpzControls();
    }, speedDelay());
  }

  function opzStep() {
    stopOpz();
    if (OPZ.index < OPZ.steps.length - 1) {
      OPZ.index += 1;
      renderOpzControls();
    }
  }

  $("opz-play").addEventListener("click", playOpz);
  $("opz-step").addEventListener("click", opzStep);
  $("opz-reset").addEventListener("click", opzReset);
  $("opz-input").addEventListener("change", opzReset);
  $("opz-speed").addEventListener("input", function () {
    if (OPZ.playing) { stopOpz(); playOpz(); }
  });

  modes.opz = opzReset;

  /* ================= СОРТИРОВКИ ================= */

  var SORT = { array: [5, 3, 9, 1, 4], steps: [], index: 0, timer: null, playing: false, algo: "insertion" };

  function snapshot(array, fn, note, marks) {
    return {
      array: array.slice(),
      fn: fn,
      note: note,
      compare: marks && marks.compare ? marks.compare : [],
      move: marks && marks.move ? marks.move : [],
      sorted: marks && marks.sorted ? marks.sorted : []
    };
  }

  function insertionSteps(source) {
    var values = source.slice();
    var steps = [snapshot(values, "insertion_sort", "массив из " + values.length + " чисел")];

    for (var i = 1; i < values.length; i += 1) {
      var current = values[i];
      var j = i - 1;
      steps.push(snapshot(values, "insert_item", "берём values[" + i + "] = " + current, { compare: [i] }));

      while (j >= 0 && values[j] > current) {
        values[j + 1] = values[j];
        steps.push(snapshot(values, "shift_step", "сдвигаем " + values[j] + " вправо", { move: [j, j + 1] }));
        j -= 1;
      }

      values[j + 1] = current;
      steps.push(snapshot(values, "shift_right", "вставляем " + current + " на место " + (j + 1), { move: [j + 1] }));
    }

    steps.push(snapshot(values, "insertion_sort", "готово", { sorted: values.map(function (_, i2) { return i2; }) }));
    return steps;
  }

  function mergeSteps(source) {
    var values = source.slice();
    var steps = [snapshot(values, "merge_sort", "делим массив пополам, пока не останутся пары")];

    function sortRange(from, to) {
      if (to - from < 1) { return values.slice(from, to + 1); }
      var middle = Math.floor((from + to) / 2);
      steps.push(snapshot(values, "merge_sort", "половины [" + from + ".." + middle + "] и [" + (middle + 1) + ".." + to + "]"));

      var left = sortRange(from, middle);
      var right = sortRange(middle + 1, to);
      var merged = mergeHalf(left, right, from);
      return merged;
    }

    function mergeHalf(left, right, start) {
      var result = [];
      var i = 0;
      var j = 0;

      while (i < left.length && j < right.length) {
        steps.push(snapshot(values, "merge_step", "сравниваем " + left[i] + " и " + right[j]));
        if (left[i] <= right[j]) { result.push(left[i]); i += 1; } else { result.push(right[j]); j += 1; }
      }
      while (i < left.length) { result.push(left[i]); i += 1; }
      while (j < right.length) { result.push(right[j]); j += 1; }

      for (var k = 0; k < result.length; k += 1) {
        values[start + k] = result[k];
      }
      steps.push(snapshot(values, "merge", "склеили отрезок с " + start, { move: result.map(function (_, i3) { return start + i3; }) }));
      return result;
    }

    sortRange(0, values.length - 1);
    steps.push(snapshot(values, "merge_sort", "готово", { sorted: values.map(function (_, i4) { return i4; }) }));
    return steps;
  }

  function quickSteps(source) {
    var values = source.slice();
    var steps = [snapshot(values, "quick_sort", "выбираем опорный элемент и делим массив")];

    function sortRange(low, high) {
      if (low >= high) { return; }
      var pivot = values[high];
      var boundary = low - 1;
      steps.push(snapshot(values, "partition", "опорный элемент " + pivot, { compare: [high] }));

      for (var index = low; index < high; index += 1) {
        steps.push(snapshot(values, "partition_step", "сравниваем " + values[index] + " с " + pivot, { compare: [index] }));
        if (values[index] <= pivot) {
          boundary += 1;
          var temp = values[boundary];
          values[boundary] = values[index];
          values[index] = temp;
          steps.push(snapshot(values, "partition_step", "переставляем " + values[boundary], { move: [boundary, index] }));
        }
      }

      var swap = values[boundary + 1];
      values[boundary + 1] = values[high];
      values[high] = swap;
      steps.push(snapshot(values, "partition", "опора встала на место " + (boundary + 1), { move: [boundary + 1, high] }));

      sortRange(low, boundary);
      sortRange(boundary + 2, high);
    }

    sortRange(0, values.length - 1);
    steps.push(snapshot(values, "quick_sort", "готово", { sorted: values.map(function (_, i5) { return i5; }) }));
    return steps;
  }

  function renderSort() {
    var step = SORT.steps[SORT.index] || SORT.steps[0];
    var max = Math.max.apply(null, step.array.concat([1]));
    var bars = $("sort-bars");

    bars.innerHTML = "";
    step.array.forEach(function (value, index) {
      var cls = "bar-col";
      if (step.move.indexOf(index) >= 0) { cls += " move"; } else if (step.compare.indexOf(index) >= 0) { cls += " compare"; } else if (step.sorted.indexOf(index) >= 0) { cls += " sorted"; }

      var col = el("div", cls);
      var body = el("div", "bar-body");
      body.style.height = Math.round(100 * value / max) + "%";
      var label = el("span", "bar-label", String(value));
      col.appendChild(body);
      col.appendChild(label);
      bars.appendChild(col);
    });

    $("sort-fn").textContent = step.fn + "()";
    $("sort-note").textContent = step.note;
    $("sort-status").textContent = "Шаг " + (SORT.index + 1) + " из " + SORT.steps.length;
  }

  function sortReset() {
    SORT.playing = false;
    if (SORT.timer) { clearInterval(SORT.timer); SORT.timer = null; }
    $("sort-play").textContent = "Пуск";

    SORT.steps = SORT.algo === "insertion" ? insertionSteps(SORT.array)
      : SORT.algo === "merge" ? mergeSteps(SORT.array)
        : quickSteps(SORT.array);
    SORT.index = 0;
    renderSort();
  }

  function sortPlay() {
    if (SORT.playing) {
      SORT.playing = false;
      clearInterval(SORT.timer);
      $("sort-play").textContent = "Пуск";
      return;
    }

    SORT.playing = true;
    $("sort-play").textContent = "Пауза";
    SORT.timer = setInterval(function () {
      if (SORT.index >= SORT.steps.length - 1) {
        SORT.playing = false;
        clearInterval(SORT.timer);
        $("sort-play").textContent = "Пуск";
        return;
      }
      SORT.index += 1;
      renderSort();
    }, 420);
  }

  Array.prototype.forEach.call(document.querySelectorAll("#sort-algos .chip-btn"), function (button) {
    button.addEventListener("click", function () {
      SORT.algo = button.dataset.algo;
      Array.prototype.forEach.call(document.querySelectorAll("#sort-algos .chip-btn"), function (other) {
        other.classList.toggle("active", other === button);
      });
      sortReset();
    });
  });

  $("sort-play").addEventListener("click", sortPlay);
  $("sort-step").addEventListener("click", function () {
    SORT.playing = false;
    clearInterval(SORT.timer);
    $("sort-play").textContent = "Пуск";
    if (SORT.index < SORT.steps.length - 1) { SORT.index += 1; renderSort(); }
  });
  $("sort-reset").addEventListener("click", sortReset);
  $("sort-random").addEventListener("click", function () {
    SORT.array = Array.from({ length: 5 }, function () { return 1 + Math.floor(Math.random() * 9); });
    sortReset();
  });

  modes.sorts = sortReset;

  /* ================= КАТАЛОГ ================= */

  var CAT = { lang: "cpp", query: "", project: null };

  function projectFunctions(project) {
    return project.variants[CAT.lang] || { functions: [], path: "", lines: 0, count: 0 };
  }

  function renderCatalog() {
    var grid = $("cat-grid");
    var query = CAT.query.trim().toLowerCase();
    grid.innerHTML = "";
    var shown = 0;

    (window.LABS ? window.LABS.projects : []).forEach(function (project) {
      var variant = projectFunctions(project);
      var matches = query === ""
        || project.title.toLowerCase().indexOf(query) >= 0
        || project.task.indexOf(query) >= 0
        || variant.functions.some(function (item) { return item.name.toLowerCase().indexOf(query) >= 0; });

      if (!matches) { return; }
      shown += 1;

      var card = el("button", "card" + (CAT.project === project.task ? " active" : ""));
      card.appendChild(el("span", "num", "#" + pad(project.number) + " · " + CAT.lang));
      card.appendChild(el("h3", "", project.title));
      card.appendChild(el("p", "", project.purpose));
      card.appendChild(el("div", "meta", "функций: " + variant.count + " · строк: " + variant.lines));
      card.addEventListener("click", function () {
        CAT.project = project.task;
        renderCatalog();
        renderDetail(project);
      });
    });

    $("cat-count").textContent = "показано " + shown + " из " + ((window.LABS ? window.LABS.projects : []).length);
  }

  function renderDetail(project) {
    var variant = projectFunctions(project);
    var box = $("cat-detail");
    box.hidden = false;
    box.innerHTML = "";

    box.appendChild(el("h3", "", "#" + pad(project.number) + " " + project.title + " — " + project.purpose));
    box.appendChild(el("div", "path", variant.path + " · " + variant.lines + " строк · " + variant.count + " функций"));

    var counts = {};
    variant.functions.forEach(function (item) { counts[item.role] = (counts[item.role] || 0) + 1; });
    var roles = el("div", "roles");
    Object.keys(counts).forEach(function (role) {
      roles.appendChild(el("span", "role-badge", role + ": " + counts[role]));
    });
    box.appendChild(roles);

    var list = el("div", "fnlist");
    variant.functions.forEach(function (item) {
      var row = el("div", "fnrow" + (item.size > 6 ? " big" : ""));
      row.appendChild(el("span", "", item.name + "()"));
      row.appendChild(el("span", "size", "стр. " + item.line + " · " + item.size + " шаг."));
      list.appendChild(row);
    });
    box.appendChild(list);
    box.appendChild(el("p", "note", "Карта построена по исходнику: имя, строка, размер тела. Нажми на другую карточку, чтобы сравнить проекты."));
  }

  Array.prototype.forEach.call(document.querySelectorAll("#cat-lang .chip-btn"), function (button) {
    button.addEventListener("click", function () {
      CAT.lang = button.dataset.lang;
      Array.prototype.forEach.call(document.querySelectorAll("#cat-lang .chip-btn"), function (other) {
        other.classList.toggle("active", other === button);
      });
      renderCatalog();
      var current = (window.LABS ? window.LABS.projects : []).filter(function (item) { return item.task === CAT.project; })[0];
      if (current) { renderDetail(current); }
    });
  });

  $("cat-search").addEventListener("input", function (event) {
    CAT.query = event.target.value;
    renderCatalog();
  });

  modes.catalog = renderCatalog;

  /* ================= НОВИЧКАМ ================= */

  var KID = [
    { name: "read_lines()", options: ["читает файл построчно", "печатает заголовок таблицы"], ok: 0 },
    { name: "print_header()", options: ["считает среднее", "печатает заголовок таблицы"], ok: 1 },
    { name: "is_digit_symbol()", options: ["проверяет, цифра ли это", "превращает текст в число"], ok: 0 },
    { name: "to_days()", options: ["переводит дату в номер дня", "открывает файл"], ok: 0 },
    { name: "split()", options: ["сортирует массив", "режет строку по разделителю"], ok: 1 },
    { name: "main()", options: ["собирает шаги программы", "считает проценты"], ok: 0 },
    { name: "percentile()", options: ["считает p50 и p95", "рисует график"], ok: 0 },
    { name: "build_rules()", options: ["запускает проверки", "собирает список правил"], ok: 1 }
  ];

  var kidState = { index: 0, score: 0, answered: false };

  function renderKid() {
    var item = KID[kidState.index];
    kidState.answered = false;

    $("kid-step").textContent = "Вопрос " + (kidState.index + 1) + " из " + KID.length + " · верно: " + kidState.score;
    $("kid-q").textContent = "Что делает эта функция?";
    $("kid-code").textContent = item.name;
    $("kid-feedback").textContent = "";
    $("kid-next").disabled = true;
    $("kid-bar").style.width = Math.round(100 * kidState.index / KID.length) + "%";

    var box = $("kid-answers");
    box.innerHTML = "";
    item.options.forEach(function (text, index) {
      var button = el("button", "", text);
      button.addEventListener("click", function () {
        if (kidState.answered) { return; }
        kidState.answered = true;
        var right = index === item.ok;
        button.classList.add(right ? "right" : "wrong");
        if (right) {
          kidState.score += 1;
          $("kid-feedback").textContent = "Верно. Функция с таким именем делает ровно одно дело.";
        } else {
          $("kid-feedback").textContent = "Не угадал: правильный ответ — «" + item.options[item.ok] + "».";
        }
        $("kid-step").textContent = "Вопрос " + (kidState.index + 1) + " из " + KID.length + " · верно: " + kidState.score;
        $("kid-next").disabled = false;
        $("kid-next").textContent = kidState.index === KID.length - 1 ? "Итог" : "Дальше";
      });
      box.appendChild(button);
    });
  }

  $("kid-next").addEventListener("click", function () {
    if (kidState.index >= KID.length - 1) {
      $("kid-q").textContent = "Готово: " + kidState.score + " из " + KID.length;
      $("kid-code").textContent = "";
      $("kid-answers").innerHTML = "";
      $("kid-feedback").textContent = kidState.score === KID.length
        ? "Отлично: имена функций читаются как действия."
        : "Правило простое: имя функции — это глагол: read, print, is, to, build.";
      $("kid-next").disabled = true;
      $("kid-bar").style.width = "100%";
      return;
    }
    kidState.index += 1;
    renderKid();
  });

  $("kid-restart").addEventListener("click", function () {
    kidState = { index: 0, score: 0, answered: false };
    renderKid();
  });

  modes.kids = renderKid;

  /* ================= ИГРЫ ================= */

  /* --- игра 1: собери ОПЗ --- */
  var G1 = { target: [], source: [], built: [], expression: "" };

  function g1Reset() {
    var variants = [
      { expr: "3+4*2", rpn: ["3", "4", "2", "*", "+"] },
      { expr: "(3+4)*2", rpn: ["3", "4", "+", "2", "*"] },
      { expr: "10-2-3", rpn: ["10", "2", "-", "3", "-"] },
      { expr: "8/2+5", rpn: ["8", "2", "/", "5", "+"] }
    ];
    var pick = variants[Math.floor(Math.random() * variants.length)];
    G1.expression = pick.expr;
    G1.target = pick.rpn;
    G1.source = pick.rpn.slice().sort(function () { return Math.random() - 0.5; });
    G1.built = [];
    $("g1-task").textContent = "Выражение: " + pick.expr + ". Нажимай токены в порядке ОПЗ.";
    $("g1-status").textContent = "";
    g1Render();
  }

  function g1Render() {
    var source = $("g1-source");
    var built = $("g1-built");
    source.innerHTML = "";
    built.innerHTML = "";

    G1.source.forEach(function (token, index) {
      if (token === null) { return; }
      var chipNode = chip(token, "pick");
      chipNode.addEventListener("click", function () {
        G1.built.push(token);
        G1.source[index] = null;
        g1Render();
      });
      source.appendChild(chipNode);
    });

    G1.built.forEach(function (token) { built.appendChild(chip(token, "done")); });
  }

  $("g1-check").addEventListener("click", function () {
    var right = G1.built.join(" ") === G1.target.join(" ");
    $("g1-status").textContent = right
      ? "Верно: " + G1.target.join(" ")
      : "Пока не то. Сравни с правилом: числа — сразу в выход, операторы ждут в стеке.";
  });
  $("g1-reset").addEventListener("click", g1Reset);

  /* --- игра 2: следующая функция --- */
  var G2 = { trace: [], cut: 0, answered: false };

  function g2Next() {
    var expr = ["(1240+8940)*2-1500/3", "3+4*2", "(1+2)*(3+4)"][Math.floor(Math.random() * 3)];
    var trace = buildTrace(expr);
    G2.trace = trace.steps || [];
    G2.cut = Math.max(2, Math.floor(G2.trace.length * 0.45));
    G2.answered = false;

    var current = G2.trace[G2.cut - 1];
    var next = G2.trace[G2.cut];
    $("g2-task").textContent = "Последний шаг: " + current.fn + "() — " + current.note + ". Какая функция сработает следующей?";

    var options = [next.fn];
    G2.trace.forEach(function (step) {
      if (options.length < 3 && options.indexOf(step.fn) < 0) { options.push(step.fn); }
    });
    options.sort(function () { return Math.random() - 0.5; });

    var box = $("g2-options");
    box.innerHTML = "";
    options.forEach(function (name) {
      var button = el("button", "chip pick", name + "()");
      button.addEventListener("click", function () {
        if (G2.answered) { return; }
        G2.answered = true;
        var right = name === next.fn;
        button.classList.add(right ? "done" : "active");
        $("g2-status").textContent = right
          ? "Верно: " + next.fn + "() — " + next.note
          : "Нет: следующая — " + next.fn + "() (" + next.note + ")";
      });
      box.appendChild(button);
    });
  }

  $("g2-task").addEventListener("click", g2Next);

  /* --- игра 3: найди нарушение --- */
  var G3 = [
    {
      lang: "PHP",
      lines: ["function load_words(array $rows): array", "{", "    $words = [];", "    foreach ($rows as $row) {", "        if ($row === '') { continue; }", "        $words[] = $row;", "    }", "    return $words;", "}"],
      bad: 4,
      why: "continue запрещён: цикл должен завершаться условием, а не прерыванием шага."
    },
    {
      lang: "C#",
      lines: ["private static bool TryRead(string path, out string text)", "{", "    if (!File.Exists(path)) { return false; }", "    text = File.ReadAllText(path);", "    if (text.Length == 0) { return false; }", "    return true;", "}"],
      bad: 4,
      why: "Второй return: по правилу выход один, в конце. Результат собирается в переменную."
    },
    {
      lang: "C++",
      lines: ["int find_index(const std::vector<int>& values, int target) {", "    for (std::size_t i = 0; i < values.size(); i += 1) {", "        if (values[i] == target) { break; }", "    }", "    return -1;", "}"],
      bad: 2,
      why: "break в цикле запрещён: вместо него флаг в условии цикла."
    }
  ];

  var g3State = { index: 0, answered: false };

  function g3Render() {
    var item = G3[g3State.index % G3.length];
    g3State.answered = false;
    $("g3-status").textContent = item.lang + ": нажми на строку с нарушением.";

    var code = $("g3-code");
    code.innerHTML = "";
    item.lines.forEach(function (text, index) {
      var line = el("span", "ln", pad(index + 1) + "  " + text);
      line.addEventListener("click", function () {
        if (g3State.answered) { return; }
        g3State.answered = true;
        var right = index === item.bad;
        line.classList.add(right ? "right" : "wrong");
        if (!right) {
          code.children[item.bad].classList.add("right");
        }
        $("g3-status").textContent = (right ? "Верно. " : "Мимо. ") + item.why;
        setTimeout(function () {
          g3State.index += 1;
          g3Render();
        }, 3200);
      });
      code.appendChild(line);
    });
  }

  /* --- игра 4: что делает функция --- */
  var G4 = [
    { name: "build_sample", options: ["собирает примеры значений колонки", "считает среднее"], ok: 0 },
    { name: "matches_ten_digit_checksum", options: ["проверяет контрольное число ИНН", "читает CSV"], ok: 0 },
    { name: "drain_operators", options: ["выгружает операторы из стека в выход", "удаляет файл"], ok: 0 },
    { name: "clamp_end", options: ["ограничивает конец периода датой to", "сортирует даты"], ok: 0 },
    { name: "z_score", options: ["считает отклонение от среднего", "печатает таблицу"], ok: 0 },
    { name: "take_smaller", options: ["берёт меньший из двух элементов", "открывает лог"], ok: 0 },
    { name: "normalize_row", options: ["приводит строку CSV к словарю", "рисует график"], ok: 0 },
    { name: "percentile", options: ["считает квантиль по отсортированным длительностям", "запускает сортировку"], ok: 0 }
  ];

  var g4State = { answered: false };

  function g4Next() {
    var item = G4[Math.floor(Math.random() * G4.length)];
    g4State.answered = false;
    $("g4-task").textContent = "Функция: " + item.name + "()";
    $("g4-status").textContent = "";

    var box = $("g4-options");
    box.innerHTML = "";
    item.options.forEach(function (text, index) {
      var button = el("button", "chip pick", text);
      button.addEventListener("click", function () {
        if (g4State.answered) { return; }
        g4State.answered = true;
        var right = index === item.ok;
        button.classList.add(right ? "done" : "active");
        $("g4-status").textContent = right ? "Верно." : "Нет: правильный ответ — «" + item.options[item.ok] + "».";
        setTimeout(g4Next, 2200);
      });
      box.appendChild(button);
    });
  }

  modes.games = function () {
    g1Reset();
    g2Next();
    g3Render();
    g4Next();
  };

  $("g1-reset").addEventListener("click", g1Reset);

  /* запуск */
  showMode("opz");
})();
