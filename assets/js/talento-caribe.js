/* =========================================================
   talento-caribe.js
   La intro del amanecer, el filtro de cursos y la sección
   "Súmate": formas de apoyar + formulario que llega directo
   a tu correo (FormSubmit, configurado en config.js).
   ========================================================= */
(function () {
  "use strict";

  var C = window.PORTFOLIO_CONFIG || {};
  var App = window.App;

  /* ---------- Filtro de cursos ---------- */
  function initFilters() {
    var buttons = document.querySelectorAll("[data-filter]");
    var courses = document.querySelectorAll("[data-courses] .course");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        buttons.forEach(function (o) {
          var on = o === b;
          o.classList.toggle("is-on", on);
          o.setAttribute("aria-selected", on ? "true" : "false");
        });
        var n = 0;
        courses.forEach(function (c) {
          var show = f === "todos" || c.getAttribute("data-area") === f;
          c.classList.toggle("is-out", !show);
          c.classList.remove("is-pop");
          if (show) {
            void c.offsetWidth; // reinicia la animación
            c.style.animationDelay = (n++ * 0.04) + "s";
            c.classList.add("is-pop");
          }
        });
      });
    });
  }

  /* ---------- Súmate ---------- */
  function initJoin() {
    var ways = Array.from(document.querySelectorAll("[data-way]"));
    var picked = document.querySelector("[data-picked]");
    var form = document.querySelector("[data-join]");
    if (!ways.length || !form) return;
    var body = form.querySelector("[data-join-body]");
    var done = form.querySelector("[data-join-done]");
    var err = form.querySelector("[data-join-error]");
    var submit = form.querySelector("[data-join-submit]");

    function selected() {
      return ways.filter(function (w) { return w.getAttribute("aria-pressed") === "true"; });
    }
    function label(w) { return App.lang === "en" ? w.getAttribute("data-label-en") : w.getAttribute("data-label"); }

    function render() {
      var list = selected();
      picked.textContent = "";
      if (!list.length) {
        picked.textContent = App.t("Elige arriba una o varias formas de sumarte.", "Pick one or more ways to join above.");
        return;
      }
      list.forEach(function (w) {
        var s = document.createElement("span");
        s.className = "pick";
        s.textContent = label(w);
        picked.appendChild(s);
      });
    }
    function toggle(w, force) {
      var on = typeof force === "boolean" ? force : w.getAttribute("aria-pressed") !== "true";
      w.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) { w.classList.remove("is-bump"); void w.offsetWidth; w.classList.add("is-bump"); }
      render();
    }
    ways.forEach(function (w) { w.addEventListener("click", function () { toggle(w); }); });
    document.addEventListener("app:lang", render);

    // Botones que llevan a Súmate con una opción ya marcada ("Quiero estar en el piloto")
    document.querySelectorAll("[data-join-preset]").forEach(function (a) {
      a.addEventListener("click", function () {
        var w = document.querySelector('[data-way="' + a.getAttribute("data-join-preset") + '"]');
        if (w) toggle(w, true);
      });
    });

    function showError(msg, field) {
      err.textContent = msg;
      err.hidden = false;
      form.querySelectorAll(".is-invalid").forEach(function (i) { i.classList.remove("is-invalid"); });
      if (field) { field.classList.add("is-invalid"); field.focus(); }
    }

    function read() {
      return {
        nombre: form.nombre.value.trim(),
        correo: form.correo.value.trim(),
        telefono: form.telefono.value.trim(),
        org: form.org.value.trim(),
        mensaje: form.mensaje.value.trim(),
        formas: selected().map(label)
      };
    }

    function validate(d, needEmail) {
      if (!d.nombre) { showError(App.t("Escribe tu nombre para poder responderte.", "Please write your name so I can reply."), form.nombre); return false; }
      if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) { showError(App.t("Escribe un correo válido para poder responderte.", "Please enter a valid email so I can reply."), form.correo); return false; }
      err.hidden = true;
      form.querySelectorAll(".is-invalid").forEach(function (i) { i.classList.remove("is-invalid"); });
      return true;
    }

    // Enviar: el mensaje llega directo al correo (sin abrir el correo de quien escribe)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = read();
      if (!validate(d, true)) return;
      if (form._honey.value) return; // robot

      submit.disabled = true;
      submit.classList.add("is-loading");
      var datos = {
        "Nombre": d.nombre,
        "email": d.correo,
        "Teléfono": d.telefono || "—",
        "Organización": d.org || "—",
        "Cómo quiere sumarse": d.formas.length ? d.formas.join(", ") : "Quiere saber más",
        "Mensaje": d.mensaje || "—",
        "Idioma de la página": App.lang === "en" ? "Inglés" : "Español"
      };
      var asunto = "Talento Caribe · " + d.nombre + " quiere sumarse";
      var url, payload = {};
      if (C.web3formsKey) {
        // Web3Forms (config.js → web3formsKey): llega directo a tu correo
        url = "https://api.web3forms.com/submit";
        payload = { access_key: C.web3formsKey, subject: asunto, from_name: "Talento Caribe · Súmate", replyto: d.correo };
      } else {
        // Respaldo: FormSubmit (config.js → formularioDestino)
        url = "https://formsubmit.co/ajax/" + encodeURIComponent(C.formularioDestino || C.correo);
        payload = { _subject: asunto, _template: "table", _captcha: "false" };
      }
      Object.keys(datos).forEach(function (k) { payload[k] = datos[k]; });
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (String(res.success) !== "true") throw new Error(res.message || "Error");
          body.hidden = true;
          done.hidden = false;
          done.focus();
          form.reset();
          ways.forEach(function (w) { w.setAttribute("aria-pressed", "false"); });
          render();
        })
        .catch(function (ex) {
          if (window.console) console.warn("Formulario:", ex && ex.message);
          showError(App.t("No se pudo enviar en este momento. Intenta de nuevo o usa “Prefiero WhatsApp”.", "It couldn't be sent right now. Try again or use “I prefer WhatsApp”."));
        })
        .then(function () {
          submit.disabled = false;
          submit.classList.remove("is-loading");
        });
    });

    form.querySelector("[data-join-again]").addEventListener("click", function () {
      done.hidden = true;
      body.hidden = false;
      form.nombre.focus();
    });

    // Alternativa: abrir WhatsApp con el mensaje listo
    form.querySelector("[data-join-wa]").addEventListener("click", function () {
      var d = read();
      if (!validate(d, false)) return;
      var texto = App.t("Hola Jose, soy ", "Hi Jose, I'm ") + d.nombre + (d.org ? " (" + d.org + ")" : "") + ". ";
      texto += d.formas.length
        ? App.t("Quiero sumarme a Talento Caribe: ", "I'd like to join Talento Caribe: ") + d.formas.join(", ").toLowerCase() + "."
        : App.t("Quiero saber cómo sumarme a Talento Caribe.", "I'd like to know how to join Talento Caribe.");
      if (d.mensaje) texto += "\n\n" + d.mensaje;
      window.open("https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });

    // Compartir: menú del celular si existe; si no, copia el enlace
    var share = document.querySelector("[data-share]");
    if (share) {
      share.addEventListener("click", function () {
        var url = window.location.href.split("#")[0] + "#sumate";
        if (navigator.share) {
          navigator.share({
            title: "Talento Caribe",
            text: App.t("Talento Caribe: educación tecnológica gratuita para jóvenes, desde Barranquilla. Súmate:", "Talento Caribe: free tech education for young people, from Barranquilla. Join in:"),
            url: url
          }).catch(function () { /* cancelado */ });
        } else if (navigator.clipboard) {
          var original = share.innerHTML;
          navigator.clipboard.writeText(url).then(function () {
            share.textContent = App.t("¡Enlace copiado!", "Link copied!");
            setTimeout(function () { share.innerHTML = original; }, 1800);
          });
        }
      });
    }
  }

  App.onReady(function () {
    App.intro("tc", 3000);
    initFilters();
    initJoin();
  });
})();
