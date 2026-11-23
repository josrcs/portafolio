# Portafolio de Jose Rodríguez

Mi portafolio personal: quién soy y mis dos proyectos, **Talento Caribe** y **Kora**.
Cada proyecto tiene su propia página, con su propia identidad.
Hecho a mano con HTML, CSS y JavaScript (sin frameworks).

## Cómo abrirlo

1. Abre la carpeta `portafolio` en VS Code.
2. Clic derecho sobre `index.html` → **Open with Live Server**.

> Se recomienda Live Server: con doble clic algunos navegadores no cargan las fuentes.
> Las letras de Talento Caribe (Archivo) y de Kora (Montserrat e IBM Plex) se cargan de
> Google Fonts, así que se ven mejor con internet.

## Las páginas

| Página | Archivo | Qué tiene |
|---|---|---|
| Inicio | `index.html` | Sobre mí, mi camino, con qué trabajo, **elegir proyecto** y contacto |
| Talento Caribe | `talento-caribe.html` | Por qué nace, para quién, la ruta de lanzamiento (Lógica de programación → HTML y CSS → JavaScript → Bases de datos con PostgreSQL; el piloto es el primero, en el primer semestre de 2027), los cursos que vienen después, cómo funciona, hacia dónde va (de Barranquilla a toda América Latina) y **Súmate** |
| Kora | `kora.html` | Qué es, para qué sirve, para quién, **vistas previas** de cómo se verá y el lanzamiento (primer trimestre de 2027) |

Al elegir un proyecto, la pantalla se cubre con un círculo del color de ese proyecto y se
abre su página. Cada página de proyecto tiene una intro propia (solo se ve una vez por sesión):

- **Talento Caribe:** un amanecer sobre el mar: sale el sol, aparece el emblema, sube "TALENTO" letra por letra y "CARIBE" se cierra.
- **Kora:** se dibuja la órbita, aparece el emblema, sube "KORA" y tres paneles (marino, azul y cielo) barren la pantalla.

Las vistas previas de Kora son maquetas hechas con HTML y CSS (se ven nítidas en cualquier
pantalla). Usan **Institución 1, 2 y 3**: ningún nombre de institución real. Los nombres de
estudiantes son de ejemplo.

### Súmate (Talento Caribe): los mensajes te llegan al correo

Quien visita elige una o varias formas de sumarse (patrocinar, enseñar, prestar un espacio,
donar equipos o estudiar en el piloto), escribe su nombre y su correo, y al darle **Enviar**
el mensaje **te llega directo a rodcolmenaresjose@gmail.com**, con todos los datos en una tabla.
También puede elegir **Prefiero WhatsApp** para escribirte por ahí.

Funciona con [Web3Forms](https://web3forms.com) (gratis, hasta 250 mensajes al mes).
La llave (`web3formsKey` en `config.js`) es tu "Access Key" de Web3Forms: es seguro que
esté en el código público, solo sirve para enviarte mensajes a ti. Si algún día la cambias,
pide una nueva en web3forms.com con tu correo y pégala ahí.

Revisa también la carpeta de spam las primeras veces y marca el mensaje como "No es spam".

## Tema claro / oscuro e idioma español / inglés

- Al entrar, cada página usa **el tema del sistema** de quien visita y **el idioma de su
  navegador** (español si lo tiene en español; si no, inglés).
- En la barra hay dos botones: **EN/ES** y **sol/luna**. Lo que elija se recuerda en las tres páginas.
- El cambio de tema se hace con un círculo que se expande desde el botón.
- **Para traducir un texto nuevo**, escribe la versión en inglés al lado:
  `<p data-en="Hello">Hola</p>`. Para atributos: `data-en-aria-label`, `data-en-placeholder`.
- En Talento Caribe, las franjas de cifras, "Cómo funciona", "Súmate" y el pie se ven siempre
  como el mar de noche. En Kora, las pantallas de vista previa se ven siempre en claro, como la
  plataforma real (y en español).

## Fluidez

- Las animaciones de las secciones que no se ven se pausan solas.
- El fondo de partículas del inicio usa menos partículas y, lejos del inicio, dibuja a la mitad.
- Los pulsos, las ondas del radar y el sol que navega se mueven solo con `transform` y
  `opacity` (no obligan al navegador a recalcular la página).
- Se quitaron los desenfoques (`backdrop-filter`) de las barras.
- Las otras páginas se cargan por adelantado (`prefetch`), así que al elegir un proyecto abre al instante.

## Lo que puedes cambiar en un solo archivo: `assets/js/config.js`

```js
window.PORTFOLIO_CONFIG = {
  talentoCaribeUrl: "https://josrcs.github.io/talento-caribe/", // "" oculta el enlace
  anioNacimiento: 2011,                 // con esto se calcula la edad
  koraLanzamiento: [2027, 1, 1],        // la cuenta regresiva de Kora
  correo: "rodcolmenaresjose@gmail.com",
  whatsapp: "573234598684",
  telefonoVisible: "+57 323 459 8684",
  web3formsKey: "6b9ac7c4-...",         // llave de Web3Forms: los mensajes de Súmate llegan a tu correo
  formularioDestino: "rodcolmenaresjose@gmail.com", // respaldo (FormSubmit) si no hay llave
  intros: true                          // false para quitar las intros
};
```

## Colores

- **Inicio:** azul noche y cian, en `assets/css/inicio.css`.
- **Talento Caribe:** los de su logo, en `assets/css/talento-caribe.css`:
  marino `#0d2b5e`, sol `#f7ae1f`, ola `#1fb5e3`, mar `#1c6fd1` y palma `#0e9a7b`.
- **Kora:** los de su logo, en `assets/css/kora.css`:
  marino `#0a1633`, azul `#1a4fd0` y cielo `#2f7fea`.

## Cómo está organizado

```
portafolio/
├── index.html              Inicio (sobre mí y elegir proyecto)
├── talento-caribe.html     Página de Talento Caribe
├── kora.html               Página de Kora
├── assets/
│   ├── css/
│   │   ├── base.css             Lo común: aparición al hacer scroll y transición entre páginas
│   │   ├── inicio.css           Estilos del inicio
│   │   ├── talento-caribe.css   Identidad de Talento Caribe
│   │   └── kora.css             Identidad de Kora
│   ├── js/
│   │   ├── config.js            ⭐ Datos que puedes cambiar (correo, formulario...)
│   │   ├── prefs.js             Elige tema e idioma antes de pintar la página
│   │   ├── common.js            Idioma, tema, scroll suave, aparición, transiciones, intros
│   │   ├── particles.js         Fondo de partículas del inicio
│   │   ├── inicio.js            Letras del nombre
│   │   ├── talento-caribe.js    Filtro de cursos y formulario Súmate
│   │   ├── kora.js              Comparación, perfiles, vistas previas y cuenta regresiva
│   │   └── vendor/              Lenis (scroll suave, licencia MIT)
│   ├── fonts/                   Fuentes del inicio (funcionan sin internet)
│   └── img/                     Mi logo, y los logos de Talento Caribe y Kora
└── README.md
```

Si alguien tiene activado "reducir movimiento", no hay intros, el scroll es normal y las
animaciones se apagan.

## Publicarlo en GitHub Pages

1. Sube la carpeta a un repositorio (por ejemplo `portafolio`).
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. En un par de minutos queda en `https://tuusuario.github.io/portafolio/`.

## Créditos

Diseñado y programado por Jose Rodríguez, Barranquilla, Colombia.
Fuentes: Bricolage Grotesque, Instrument Sans, JetBrains Mono, Archivo, Montserrat e IBM Plex
(SIL Open Font License). Scroll suave: Lenis (MIT).
