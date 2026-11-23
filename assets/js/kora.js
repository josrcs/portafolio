/* =========================================================
   kora.js
   Intro, comparación "sin Kora / con Kora", perfiles,
   vistas previas (con la planilla que calcula sola) y la
   cuenta regresiva al lanzamiento.
   ========================================================= */
(function () {
  "use strict";

  var C = window.PORTFOLIO_CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmt(n) { return n.toFixed(1).replace(".", ","); }

  /* Escala del Decreto 1290 que usa la mayoría de colegios */
  function desempeno(n) {
    if (n >= 4.6) return ["Superior", "perf--sup"];
    if (n >= 4.0) return ["Alto", "perf--alto"];
    if (n >= 3.0) return ["Básico", "perf--bas"];
    return ["Bajo", "perf--bajo"];
  }

  /* ---------- Sin Kora / Con Kora ---------- */
  function initCompare() {
    var box = document.querySelector("[data-compare]");
    if (!box) return;
    box.setAttribute("data-side", "kora");
    box.querySelectorAll("[data-side]").forEach(function (b) {
      if (b === box) return;
      b.addEventListener("click", function () {
        var side = b.getAttribute("data-side");
        box.setAttribute("data-side", side);
        box.querySelectorAll("button[data-side]").forEach(function (o) {
          var on = o === b;
          o.classList.toggle("is-on", on);
          o.setAttribute("aria-selected", on ? "true" : "false");
        });
        box.querySelectorAll("[data-list]").forEach(function (l) {
          l.hidden = l.getAttribute("data-list") !== side;
        });
      });
    });
  }

  /* ---------- Pestañas genéricas ---------- */
  function tabs(buttons, panels, attr, onChange) {
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        buttons.forEach(function (o, j) {
          o.classList.toggle("is-on", i === j);
          o.setAttribute("aria-selected", i === j ? "true" : "false");
        });
        panels.forEach(function (p, j) {
          p.hidden = i !== j;
          p.classList.toggle("is-on", i === j);
        });
        if (onChange) onChange(i, panels[i]);
      });
    });
  }

  function initRoles() {
    var root = document.querySelector("[data-roles]");
    if (!root) return;
    tabs(Array.from(root.querySelectorAll("[data-role]")), Array.from(root.querySelectorAll("[data-panel]")));
  }

  /* ---------- Planilla: llena las notas y calcula la definitiva ---------- */
  var sheetTimer = null;
  function buildSheet(animate) {
    var rows = document.querySelectorAll("[data-sheet] tbody tr");
    clearTimeout(sheetTimer);
    var queue = [];
    rows.forEach(function (tr) {
      var g = tr.getAttribute("data-g").split(" ").map(parseFloat);
      while (tr.children.length > 1) tr.removeChild(tr.lastChild);
      var cells = g.map(function () {
        var td = document.createElement("td");
        var s = document.createElement("span");
        s.className = "cell";
        s.textContent = animate ? "–" : "";
        td.appendChild(s);
        tr.appendChild(td);
        return s;
      });
      // Definitiva en centésimas para evitar errores de redondeo
      var cent = Math.round(g[0] * 30 + g[1] * 30 + g[2] * 40); // = nota × 100
      var def = Math.round(cent / 10) / 10;
      var tdDef = document.createElement("td");
      var sDef = document.createElement("span");
      sDef.className = "def" + (def < 3 ? " is-low" : "");
      tdDef.appendChild(sDef);
      tr.appendChild(tdDef);
      var tdP = document.createElement("td");
      var p = desempeno(def);
      var sP = document.createElement("span");
      sP.className = "perf " + p[1];
      tdP.appendChild(sP);
      tr.appendChild(tdP);

      cells.forEach(function (s, i) { queue.push(function () { s.textContent = fmt(g[i]); s.classList.add("is-typing"); setTimeout(function () { s.classList.remove("is-typing"); }, 260); }); });
      queue.push(function () { sDef.textContent = fmt(def); sP.textContent = p[0]; });
    });
    if (!animate) { queue.forEach(function (fn) { fn(); }); return; }
    var i = 0;
    (function step() {
      if (i >= queue.length) return;
      queue[i++]();
      sheetTimer = setTimeout(step, 70);
    })();
  }

  /* ---------- Vistas previas ---------- */
  var CAPTIONS = [
    ["Elige tu institución, tu perfil y entra con tu documento.", "Pick your institution and profile, and sign in with your ID."],
    ["El docente escribe las notas de cada actividad y Kora calcula la definitiva y el desempeño.", "The teacher enters each activity grade and Kora calculates the final grade and performance level."],
    ["Desde el celular, el acudiente ve cómo va cada uno de sus hijos.", "From their phone, parents see how each of their kids is doing."],
    ["El boletín se publica al cerrar el periodo, en pantalla y en PDF.", "The report card is published when the term closes, on screen and as PDF."],
    ["Coordinación ve todo el colegio y actúa a tiempo con el corte preventivo.", "Coordination sees the whole school and acts in time with the early warning report."]
  ];
  var current = 0;
  function caption(i) { return window.App.t(CAPTIONS[i][0], CAPTIONS[i][1]); }
  function initShots() {
    var root = document.querySelector("[data-shots]");
    if (!root) return;
    var url = root.querySelector("[data-shot-url]");
    var cap = root.querySelector("[data-shot-caption]");
    var screens = Array.from(root.querySelectorAll("[data-screen]"));
    tabs(Array.from(root.querySelectorAll("[data-shot]")), screens, null, function (i, panel) {
      url.textContent = panel.getAttribute("data-url");
      current = i;
      cap.textContent = caption(i);
      if (i === 1) buildSheet(!reduce);
    });
    buildSheet(false);
    cap.textContent = caption(0);
    document.addEventListener("app:lang", function () { cap.textContent = caption(current); });
  }

  /* ---------- Cuenta regresiva ---------- */
  function initCountdown() {
    var box = document.querySelector("[data-countdown]");
    if (!box) return;
    var d = C.koraLanzamiento || [2027, 1, 1];
    var target = new Date(d[0], d[1] - 1, d[2], 0, 0, 0).getTime();
    var els = {};
    ["days", "hours", "mins", "secs"].forEach(function (k) { els[k] = box.querySelector('[data-cd="' + k + '"]'); });
    var label = box.querySelector("[data-cd-label]");
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var ms = target - Date.now();
      if (ms <= 0) {
        box.classList.add("is-done");
        Object.keys(els).forEach(function (k) { els[k].textContent = "00"; });
        label.textContent = window.App.t("¡Ya estamos en el trimestre de lanzamiento de Kora!", "We are now in Kora’s launch quarter!");
        return;
      }
      var s = Math.floor(ms / 1000);
      els.days.textContent = Math.floor(s / 86400);
      els.hours.textContent = pad(Math.floor(s / 3600) % 24);
      els.mins.textContent = pad(Math.floor(s / 60) % 60);
      els.secs.textContent = pad(s % 60);
      setTimeout(tick, 1000);
    }
    tick();
  }

  window.App.onReady(function () {
    window.App.intro("kora", 2400);
    initCompare();
    initRoles();
    initShots();
    initCountdown();
  });
})();
