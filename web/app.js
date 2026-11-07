/* Клиент для локального API: выбор программы, форма, запуск, вывод. */
(function () {
  "use strict";

  var state = { lang: "php", task: "rpn-calc", schema: null, busy: false };

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

  function readHash() {
    var parts = (location.hash || "").replace(/^#\/?/, "").split("/");

    return parts.length === 2 ? parts : null;
  }

  function applyHash() {
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
      button.appendChild(el("span", "", data.title));
      button.appendChild(el("small", "", task));
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
          return;
        }
        showResult(result);
        pushHistory(taskTitle(state.task), result);
        $("status").textContent = "";
      })
      .catch(function (error) {
        $("status").textContent = "сеть: " + error.message;
      })
      .finally(function () {
        state.busy = false;
        $("run").disabled = false;
      });
  }

  function reset() {
    renderForm();
    $("status").textContent = "";
  }

  $("run").addEventListener("click", run);
  $("reset").addEventListener("click", reset);

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
    });

  window.addEventListener("hashchange", function () {
    applyHash();
    renderLangs();
    renderTasks();
    renderForm();
  });
})();
