/* =========================================================
   common.js
   Lo que comparten las tres páginas:
   - Idioma (español / inglés) y tema (claro / oscuro):
     se elige solo según el navegador de quien visita y se
     puede cambiar con los botones de la barra. Se recuerda.
   - Datos de config.js (correo, WhatsApp, edad, links)
   - Aparición al hacer scroll ([data-reveal]) y contadores
   - Scroll suave con Lenis
   - Transición entre páginas ([data-go])
   - Pausa las animaciones de las secciones que no se ven
   ========================================================= */
(function () {
  "use strict";

  var C = window.PORTFOLIO_CONFIG || {};
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var App = (window.App = window.App || {});
  App.reduce = reduce;

  /* =========================================================
     IDIOMA
     Cada texto traducible lleva su versión en inglés al lado:
       <p data-en="Hello">Hola</p>
     y para atributos: data-en-aria-label, data-en-placeholder, data-en-alt.
     ========================================================= */
  App.lang = root.lang === "en" ? "en" : "es";
  App.t = function (es, en) { return App.lang === "en" ? en : es; };

  var ATTRS = ["aria-label", "placeholder", "alt", "title"];
  function applyLang(lang) {
    App.lang = lang;
    root.lang = lang;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-es")) el.setAttribute("data-es", el.innerHTML);
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-es");
    });
    ATTRS.forEach(function (attr) {
      document.querySelectorAll("[data-en-" + attr + "]").forEach(function (el) {
        var keep = "data-es-" + attr;
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(attr) || "");
        el.setAttribute(attr, lang === "en" ? el.getAttribute("data-en-" + attr) : el.getAttribute(keep));
      });
    });
    var title = document.querySelector("title");
    if (title && title.hasAttribute("data-en")) document.title = title.textContent;
    document.querySelectorAll("[data-lang-label]").forEach(function (el) { el.textContent = lang === "en" ? "ES" : "EN"; });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", lang === "en" ? "Ver en español" : "View in English");
    });
    fillConfig();
    updateThemeLabels();
    root.classList.remove("i18n-wait");
    document.dispatchEvent(new CustomEvent("app:lang", { detail: lang }));
  }

  function setLang(lang) {
    try { localStorage.setItem("idioma", lang); } catch (err) { /* sin storage */ }
    applyLang(lang);
  }
  App.setLang = setLang;

  /* =========================================================
     TEMA (claro / oscuro) con un círculo que se expande
     ========================================================= */
  App.theme = function () { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; };

  function updateThemeLabels() {
    var light = App.theme() === "light";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", light ? App.t("Cambiar a tema oscuro", "Switch to dark theme") : App.t("Cambiar a tema claro", "Switch to light theme"));
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--theme-color").trim() || meta.getAttribute("content"));
  }

  function setTheme(theme, x, y, save) {
    var apply = function () {
      root.setAttribute("data-theme", theme);
      if (save !== false) { try { localStorage.setItem("tema", theme); } catch (err) { /* nada */ } }
      updateThemeLabels();
      window.dispatchEvent(new Event("themechange"));
    };
    if (reduce || !document.startViewTransition || x == null) { apply(); return; }
    var vt = document.startViewTransition(apply);
    vt.ready.then(function () {
      var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
        { duration: 650, easing: "cubic-bezier(.7, 0, .25, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () { /* nada */ });
  }

  function initPrefs() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-theme-toggle]");
      if (t) {
        var r = t.getBoundingClientRect();
        setTheme(App.theme() === "light" ? "dark" : "light", r.left + r.width / 2, r.top + r.height / 2);
        return;
      }
      if (e.target.closest("[data-lang-toggle]")) setLang(App.lang === "en" ? "es" : "en");
    });
    // Si la persona no ha elegido tema, sigue el de su sistema en vivo
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onChange = function () {
      var saved = null;
      try { saved = localStorage.getItem("tema"); } catch (err) { /* nada */ }
      if (!saved) setTheme(mq.matches ? "light" : "dark", null, null, false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  /* ---------- Datos de config.js ---------- */
  function fillConfig() {
    var now = new Date();
    var edad = now.getFullYear() - (C.anioNacimiento || 2011);
    document.querySelectorAll("[data-edad]").forEach(function (el) { el.textContent = edad; });
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = now.getFullYear(); });
    document.querySelectorAll("[data-cfg-mail]").forEach(function (el) {
      if (el.tagName === "A") el.href = "mailto:" + C.correo;
      if (el.hasAttribute("data-cfg-text")) el.textContent = C.correo;
      if (el.hasAttribute("data-copy")) el.setAttribute("data-copy", C.correo);
    });
    document.querySelectorAll("[data-cfg-wa]").forEach(function (el) { el.href = "https://wa.me/" + C.whatsapp; });
    document.querySelectorAll("[data-cfg-tel]").forEach(function (el) {
      if (el.tagName === "A") el.href = "tel:+" + C.whatsapp;
      if (el.hasAttribute("data-cfg-text")) el.textContent = C.telefonoVisible;
      if (el.hasAttribute("data-copy")) el.setAttribute("data-copy", C.telefonoVisible);
    });
    document.querySelectorAll("[data-cfg-tc]").forEach(function (el) {
      if (C.talentoCaribeUrl) el.href = C.talentoCaribeUrl;
      else el.hidden = true;
    });
  }

  /* ---------- Aparecer al hacer scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Pausa las animaciones de lo que no se ve (más fluidez) ---------- */
  function initPause() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-paused", !e.isIntersecting); });
    }, { rootMargin: "120px 0px" });
    document.querySelectorAll("main > section, footer").forEach(function (s) { io.observe(s); });
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    var items = document.querySelectorAll("[data-count]");
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (reduce) { el.textContent = target; return; }
      var start = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - start) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }
    if (!("IntersectionObserver" in window)) { items.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll suave ---------- */
  function initSmooth() {
    if (reduce || typeof window.Lenis !== "function") return;
    var lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1 });
    App.lenis = lenis;
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
      history.replaceState(null, "", id);
    });
  }

  /* ---------- Transición entre páginas ---------- */
  var COLORS = {
    dark: { home: "#05091a", tc: "#0a1730", kora: "#070f24" },
    light: { home: "#f1f6ff", tc: "#f7f4ec", kora: "#f4f7fc" }
  };

  function goTo(url, dest, x, y) {
    if (reduce) { window.location.href = url; return; }
    try { sessionStorage.setItem("llegada", dest); } catch (err) { /* nada */ }
    var w = document.createElement("div");
    w.className = "wipe wipe--" + dest;
    w.style.setProperty("--x", x + "px");
    w.style.setProperty("--y", y + "px");
    w.style.background = COLORS[App.theme()][dest] || "#000";
    w.innerHTML = '<span class="wipe__mark"></span>';
    document.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add("is-on"); }); });
    setTimeout(function () { window.location.href = url; }, 560);
  }

  function initTransitions() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-go]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var r = a.getBoundingClientRect();
      goTo(a.getAttribute("href"), a.getAttribute("data-go"), e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) document.querySelectorAll(".wipe").forEach(function (w) { w.remove(); });
    });
    var from = null;
    try { from = sessionStorage.getItem("llegada"); sessionStorage.removeItem("llegada"); } catch (err) { /* nada */ }
    if (from && !reduce) {
      var c = document.createElement("div");
      c.className = "arrive";
      c.style.background = COLORS[App.theme()][document.body.getAttribute("data-page")] || "#000";
      document.body.appendChild(c);
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add("is-off"); }); });
      setTimeout(function () { c.remove(); }, 800);
    }
  }

  /* ---------- Copiar al portapapeles ---------- */
  function initCopy() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]");
      if (!b) return;
      var label = b.querySelector("[data-copy-label]") || b;
      var original = label.innerHTML;
      var done = function (ok) {
        label.textContent = ok ? App.t("¡Copiado!", "Copied!") : App.t("No se pudo copiar", "Couldn't copy");
        b.classList.add("is-copied");
        setTimeout(function () { label.innerHTML = original; b.classList.remove("is-copied"); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(b.getAttribute("data-copy")).then(function () { done(true); }, function () { done(false); });
      } else done(false);
    });
  }

  /* ---------- Barra que se oculta al bajar ---------- */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    var last = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        nav.classList.toggle("is-scrolled", y > 24);
        nav.classList.toggle("is-hidden", y > last && y > 400);
        last = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Inclinación 3D suave ([data-tilt]) ---------- */
  function initTilt() {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 6;
      var raf = 0, px = 0, py = 0;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          el.style.setProperty("--rx", (-py * max).toFixed(2) + "deg");
          el.style.setProperty("--ry", (px * max).toFixed(2) + "deg");
          raf = 0;
        });
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Intro (una vez por sesión y por página) ---------- */
  App.intro = function (key, duration, onDone) {
    var el = document.querySelector("[data-intro]");
    var seen = false;
    try { seen = sessionStorage.getItem("intro-" + key) === "1"; } catch (err) { /* nada */ }
    if (!el || reduce || C.intros === false || seen) {
      if (el) el.remove();
      root.classList.remove("intro-on");
      if (onDone) onDone();
      return;
    }
    try { sessionStorage.setItem("intro-" + key, "1"); } catch (err) { /* nada */ }
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      el.classList.add("is-leaving");
      root.classList.remove("intro-on");
      if (onDone) onDone();
      setTimeout(function () { el.remove(); }, 1300);
    }
    setTimeout(finish, duration);
    ["click", "keydown", "wheel", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, finish, { once: true, passive: true });
    });
  };

  function boot() {
    applyLang(App.lang);
    initPrefs();
    initReveal();
    initPause();
    initCounters();
    initSmooth();
    initTransitions();
    initCopy();
    initNav();
    initTilt();
    App.ready = true;
    document.dispatchEvent(new CustomEvent("app:ready"));
  }

  /* Para los scripts de cada página: corre fn cuando todo esté listo */
  App.onReady = function (fn) {
    if (App.ready) fn();
    else document.addEventListener("app:ready", fn, { once: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
