/* Клиент для локального API: выбор программы, форма, запуск, вывод. */
(function () {
  "use strict";

  var state = { lang: "php", task: "rpn-calc", schema: null, busy: false };

  var ICONS = {
    "text-stats": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/><path d="M5.8 7.4h4.4M5.8 9.6h4.4M5.8 11.8h2.8"/></svg>',
    "csv-profiler": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.2" y="3" width="11.6" height="10"/><path d="M2.2 6.2h11.6M6 3v10M10 3v10"/></svg>',
    "rpn-calc": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="1.8" width="10" height="12.4"/><path d="M5.4 4.6h5.2"/><path d="M5.6 7.8h.8M8 7.8h.8M10.4 7.8h.8M5.6 10.4h.8M8 10.4h.8M10.4 10.4h.8"/></svg>',
    "dq-checks": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 1.6l5 1.9v4.2c0 3-2 5.1-5 6.7-3-1.6-5-3.7-5-6.7V3.5z"/><path d="M5.6 7.8l1.7 1.7 3.1-3.4"/></svg>',
    "log-parser": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.6 3.6h10.8M2.6 6.4h10.8M2.6 9.2h7.8M2.6 12h5"/></svg>',
    "sort-bench": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.4 13V9.2M6.4 13V6.4M9.4 13V3.8M12.4 13V7.4"/></svg>',
    "date-periods": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.2" y="3.2" width="11.6" height="10.2"/><path d="M2.2 6.2h11.6M5.4 1.8v2.6M10.6 1.8v2.6"/><path d="M5.8 8.8h1M8.2 8.8h1M10.6 8.8h1M5.8 11h1M8.2 11h1"/></svg>',
    "moving-average": '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.2 2.4v11.2h11.6"/><path d="M3.6 10.6l2.6-3 2.2 1.8 3.6-5.2"/></svg>'
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  };

  function taskTitle(task) {
    return state.schema.tasks[task].title;
  }

  /* ---------- окно, диалоги, тосты ---------- */

  function openDialog(options) {
    var overlay = $("overlay");
    $("dialog-title").textContent = options.title || "";

    var body = $("dialog-body");
    body.innerHTML = "";
    (options.text || []).forEach(function (chunk) {
      var paragraph = document.createElement("p");
      if (chunk && chunk.html) {
        paragraph.innerHTML = chunk.html;
      } else {
        paragraph.textContent = String(chunk);
      }
      body.appendChild(paragraph);
    });

    var actions = $("dialog-actions");
    actions.innerHTML = "";
    (options.buttons || [{ label: "OK", kind: "primary" }]).forEach(function (item) {
      var button = el("button", item.kind === "primary" ? "primary" : "secondary", item.label);
      button.type = "button";
      button.addEventListener("click", function () {
        closeDialog();
        if (item.action) { item.action(); }
      });
      actions.appendChild(button);
    });

    overlay.hidden = false;
    var first = actions.querySelector("button");
    if (first) { first.focus(); }
  }

  function closeDialog() {
    $("overlay").hidden = true;
  }

  function toast(title, text, kind) {
    var box = el("div", "toast" + (kind ? " " + kind : ""));
    box.appendChild(el("span", "toast-title", title));
    if (text) { box.appendChild(el("span", "toast-text", text)); }
    $("toasts").appendChild(box);
    setTimeout(function () {
      if (box.parentNode) { box.parentNode.removeChild(box); }
    }, 4200);
  }

  function showAbout() {
    openDialog({
      title: "О программе",
      text: [
        "24 учебные программы на PHP, C# и C++ — запуск из браузера без консоли.",
        { html: "Сервер: <code>tools/serve.py</code>, список задач — <code>tools/tasks.json</code>." },
        { html: "Остановить: <code>Ctrl+C</code> в окне сервера или <code>make serve</code> закрыть." },
        "Объяснялка с анимациями и картой функций — по ссылке в шапке."
      ],
      buttons: [{ label: "Закрыть", kind: "primary" }]
    });
  }

  function readHash() {
    var parts = (location.hash || "").replace(/^#\/?/, "").split("/");

    return parts.length === 2 ? parts : null;
  }

  function applyHash() {
    if (location.hash === "#about") {
      showAbout();
      return;
    }

    var parts = readHash();
    if (!parts || !state.schema) { return; }
    if (!state.schema.paths[parts[0]] || !state.schema.tasks[parts[1]]) { return; }

    state.lang = parts[0];
    state.task = parts[1];
  }

  function syncHash() {
    var hash = "#" + state.lang + "/" + state.task;
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }

  function renderLangs() {
    var box = $("langs");
    box.innerHTML = "";

    state.schema.langs.forEach(function (pair) {
      var button = el("button", "lang-btn" + (pair[0] === state.lang ? " active" : ""), pair[1]);
      button.type = "button";
      button.addEventListener("click", function () {
        state.lang = pair[0];
        syncHash();
        renderLangs();
        renderForm();
      });
      box.appendChild(button);
    });
  }

  function renderTasks() {
    var nav = $("tasks");
    nav.innerHTML = "";

    Object.keys(state.schema.tasks).forEach(function (task) {
      var data = state.schema.tasks[task];
      var button = el("button", "task-btn" + (task === state.task ? " active" : ""));
      button.type = "button";

      var icon = el("span", "task-icon");
      icon.innerHTML = ICONS[task] || "";
      button.appendChild(icon);

      var text = el("span", "task-text");
      text.appendChild(el("span", "task-title", data.title));
      text.appendChild(el("small", "", task));
      button.appendChild(text);

      button.addEventListener("click", function () {
        state.task = task;
        syncHash();
        renderTasks();
        renderForm();
      });
      nav.appendChild(button);
    });
  }

  function fieldNode(field) {
    var wrap = el("div", "field");
    var id = "field-" + field.name;
    var label = el("label", "field-label", field.label);
    label.htmlFor = id;

    var control;

    if (field.kind === "textarea") {
      control = el("textarea");
      control.rows = field.rows || 6;
      control.value = field.value || "";
      control.spellcheck = false;
    } else if (field.kind === "select") {
      control = el("select");
      (field.options || []).forEach(function (option) {
        var item = el("option", "", option[1]);
        item.value = option[0];
        control.appendChild(item);
      });
      control.value = field.value;
    } else {
      control = el("input");
      control.type = field.kind === "number" ? "number" : "text";
      if (field.kind === "number") {
        control.min = field.min;
        control.max = field.max;
      }
      control.value = field.value || "";
    }

    control.id = id;
    control.dataset.name = field.name;

    wrap.appendChild(label);
    wrap.appendChild(control);

    return wrap;
  }

  function renderForm() {
    var data = state.schema.tasks[state.task];
    $("task-title").textContent = data.title;
    $("task-hint").textContent = data.hint;
    $("task-path").textContent = state.schema.paths[state.lang][state.task] + " · " + state.lang;

    var form = $("form");
    form.innerHTML = "";

    var inline = data.fields.filter(function (field) { return field.kind !== "textarea"; });
    var wide = data.fields.filter(function (field) { return field.kind === "textarea"; });

    if (inline.length > 0) {
      var row = el("div", "row-inline");
      inline.forEach(function (field) { row.appendChild(fieldNode(field)); });
      form.appendChild(row);
    }
    wide.forEach(function (field) { form.appendChild(fieldNode(field)); });

    $("stdout").textContent = "";
    $("stderr").textContent = "";
    $("stderr").hidden = true;
    $("stderr-head").hidden = true;
    $("meta").textContent = "";
    $("status").textContent = "";
  }

  function collect() {
    var fields = {};
    Array.prototype.forEach.call($("form").querySelectorAll("[data-name]"), function (control) {
      fields[control.dataset.name] = control.value;
    });
    return fields;
  }

  function showResult(result) {
    var ok = result.ok && result.code === 0;

    $("stdout").textContent = result.stdout || "(пусто)";
    $("meta").innerHTML = "";

    var badge = el("span", "badge" + (ok ? "" : " bad"),
      result.ok ? "exit " + result.code : "ошибка запуска");
    $("meta").appendChild(badge);
    $("meta").appendChild(el("span", "note", " · " + result.ms + " мс"));

    var failed = (result.stderr || "").trim() !== "";
    $("stderr").hidden = !failed;
    $("stderr-head").hidden = !failed;
    $("stderr").textContent = result.stderr || "";
  }

  function pushHistory(name, result) {
    var list = $("history");
    var item = el("li");
    item.appendChild(el("span", "name", name + " · " + state.lang));
    item.appendChild(el("span", "time", (result.ms || 0) + " мс · exit " + result.code));
    list.insertBefore(item, list.firstChild);

    while (list.children.length > 8) {
      list.removeChild(list.lastChild);
    }
  }

  function run() {
    if (state.busy) { return; }

    state.busy = true;
    $("run").disabled = true;
    $("status").textContent = "выполняется…";

    fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: state.lang, task: state.task, fields: collect() })
    })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (result.error) {
          $("status").textContent = result.error;
          toast("Не запустилось", result.error, "bad");
          return;
        }
        showResult(result);
        pushHistory(taskTitle(state.task), result);
        $("status").textContent = "";
        toast(result.code === 0 ? "Готово" : "Код возврата " + result.code,
          taskTitle(state.task) + " · " + result.ms + " мс",
          result.code === 0 ? "ok" : "bad");
      })
      .catch(function (error) {
        $("status").textContent = "сеть: " + error.message;
        toast("Сеть недоступна", error.message, "bad");
      })
      .finally(function () {
        state.busy = false;
        $("run").disabled = false;
      });
  }

  function reset() {
    openDialog({
      title: "Сбросить поля?",
      text: ["Вернутся значения по умолчанию для этой программы."],
      buttons: [
        { label: "Отмена", kind: "secondary" },
        {
          label: "Сбросить", kind: "primary", action: function () {
            renderForm();
            $("status").textContent = "";
            toast("Поля сброшены", taskTitle(state.task), "");
          }
        }
      ]
    });
  }

  $("run").addEventListener("click", run);
  $("reset").addEventListener("click", reset);
  $("about").addEventListener("click", showAbout);

  $("form").addEventListener("submit", function (event) {
    event.preventDefault();
    run();
  });

  $("win-min").addEventListener("click", function () {
    $("window").classList.toggle("minimized");
  });

  $("win-max").addEventListener("click", function () {
    $("window").classList.toggle("maximized");
  });

  $("win-close").addEventListener("click", function () {
    openDialog({
      title: "Закрыть окно?",
      text: [
        "Вкладку браузера страница закрыть не может — это делает сам браузер.",
        { html: "Сервер останавливается в своём окне: <code>Ctrl+C</code>." }
      ],
      buttons: [
        { label: "Отмена", kind: "secondary" },
        {
          label: "Свернуть окно", kind: "primary", action: function () {
            $("window").classList.add("minimized");
          }
        }
      ]
    });
  });

  $("overlay").addEventListener("click", function (event) {
    if (event.target === $("overlay")) { closeDialog(); }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !$("overlay").hidden) { closeDialog(); }
  });

  fetch("/api/schema")
    .then(function (response) { return response.json(); })
    .then(function (schema) {
      state.schema = schema;
      applyHash();
      renderLangs();
      renderTasks();
      renderForm();
      syncHash();
    })
    .catch(function (error) {
      $("status").textContent = "не удалось загрузить схему: " + error.message;
      toast("Схема не загрузилась", error.message, "bad");
    });

  window.addEventListener("hashchange", function () {
    applyHash();
    renderLangs();
    renderTasks();
    renderForm();
  });
})();
