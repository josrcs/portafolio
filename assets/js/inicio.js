/* =========================================================
   inicio.js
   Página principal: letras del nombre que suben una a una
   y el fondo de partículas.
   ========================================================= */
(function () {
  "use strict";

  function splitName() {
    var name = document.querySelector("[data-split]");
    if (!name) return;
    var i = 0;
    name.querySelectorAll(".hero__line").forEach(function (line) {
      var text = line.textContent.trim();
      line.setAttribute("aria-hidden", "true");
      line.textContent = "";
      Array.from(text).forEach(function (ch) {
        var mask = document.createElement("span");
        mask.className = "ch-mask";
        var s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--i", i++);
        s.textContent = ch;
        mask.appendChild(s);
        line.appendChild(mask);
      });
    });
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = "Jose Rodríguez";
    name.appendChild(sr);
  }

  function boot() {
    splitName();
    var P = window.Portfolio || {};
    if (P.particles) P.particles.init({});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
