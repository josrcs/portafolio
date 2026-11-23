/* =========================================================
   prefs.js
   Va en el <head> SIN defer: elige el tema y el idioma antes
   de que se pinte la página, para que no parpadee.
   - Si la persona ya eligió (botones de la barra), se usa eso.
   - Si no, se usa el tema de su sistema y el idioma de su
     navegador (español si lo tiene en español; si no, inglés).
   ========================================================= */
(function (d) {
  var t, l;
  try { t = localStorage.getItem("tema"); l = localStorage.getItem("idioma"); } catch (e) { /* sin storage */ }
  if (t !== "light" && t !== "dark") t = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  if (l !== "es" && l !== "en") l = /^es/i.test(navigator.language || "es") ? "es" : "en";
  d.setAttribute("data-theme", t);
  d.lang = l;
  if (l === "en") {
    // Esconde el texto un instante mientras se pone en inglés
    d.classList.add("i18n-wait");
    setTimeout(function () { d.classList.remove("i18n-wait"); }, 2000);
  }
})(document.documentElement);
