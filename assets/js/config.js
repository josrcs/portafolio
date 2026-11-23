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

  // Formulario "Súmate" de Talento Caribe: los mensajes llegan directo a tu correo.
  // Usa Web3Forms (gratis, 250 mensajes al mes). Pega aquí la "Access Key" que
  // te llegó al correo desde web3forms.com. Es seguro dejarla visible.
  web3formsKey: "6b9ac7c4-5acb-4aa1-a513-c6edfe2c1893",

  // Respaldo: si web3formsKey está vacío, se usa FormSubmit con este correo.
  formularioDestino: "rodcolmenaresjose@gmail.com",

  // Animaciones de entrada de Talento Caribe y Kora (false para quitarlas)
  intros: true
};
