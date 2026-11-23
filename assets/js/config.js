/* =========================================================
   config.js
   Lo que puedes cambiar sin tocar el resto del código.
   Aplica a las tres páginas (inicio, Talento Caribe y Kora).
   ========================================================= */
window.PORTFOLIO_CONFIG = {
  // Link de la plataforma de Talento Caribe ("" para ocultar el enlace)
  talentoCaribeUrl: "https://josrcs.github.io/talento-caribe/",

  // Año de nacimiento (con esto se calcula la edad que se muestra)
  anioNacimiento: 2011,

  // Fecha en que empieza el trimestre de lanzamiento de Kora (año, mes 1-12, día)
  koraLanzamiento: [2027, 1, 1],

  // Contacto
  correo: "rodcolmenaresjose@gmail.com",
  whatsapp: "573234598684",          // solo números, con el 57 de Colombia
  telefonoVisible: "+57 323 459 8684",

  // A dónde llegan los mensajes del formulario "Súmate" de Talento Caribe.
  // Usa FormSubmit (gratis, sin cuenta). La PRIMERA vez que alguien lo envíe,
  // te llega un correo de FormSubmit para activarlo: ábrelo y dale "Activate Form".
  // Después FormSubmit te da un código (ej. "a1b2c3...") que puedes poner aquí
  // en lugar de tu correo para que no quede visible en el código.
  formularioDestino: "rodcolmenaresjose@gmail.com",

  // Animaciones de entrada de Talento Caribe y Kora (false para quitarlas)
  intros: true
};
