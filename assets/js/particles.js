/* =========================================================
   particles.js
   El fondo animado: miles de pequeñas líneas que flotan en un
   campo de corriente y forman un anillo que gira alrededor del
   cursor (inspirado en la página de Google Antigravity).

   - Mover el cursor: el anillo te sigue.
   - Clic en el fondo: onda expansiva.
   - Hacer scroll: las partículas se arrastran con la página.
   - Sin cursor (celular o quieto): el anillo pasea solo.

   Optimizado para que vaya fluido:
   - Los datos van en arreglos tipados (más rápidos que objetos).
   - Casi no usa trigonometría por frame.
   - Si el equipo va lento, baja solo la cantidad de partículas.
   ========================================================= */
(function () {
  "use strict";

  var Portfolio = (window.Portfolio = window.Portfolio || {});
  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TAU = Math.PI * 2;
  var ALPHAS = [0.26, 0.48, 0.74, 1];

  var canvas, ctx;
  var W = 0, H = 0, DPR = 1, maxDPR = 1.25;
  var N = 0;
  // Datos de cada partícula
  var HX, HY, X, Y, VX, VY, DX, DY, FX, FY, LEN, OFF, DEPTH, SPD, INF;
  var COL, WID;

  var palette = ["#3a76ff"];
  var paletteAlpha = 1;
  var running = false;
  var waiting = false;
  var last = 0;
  var t = 0;
  var frame = 0;
  var fade = 1;
  var scrollKick = 0;
  var lastScrollY = 0;
  var shocks = [];
  var pointer = { x: 0, y: 0, active: false, lastMove: -1e9 };
  var att = { x: 0, y: 0 };
  var paths = [];

  // Calidad automática: 1 = completa. Baja si los frames tardan mucho.
  var quality = 1;
  var samples = 0;
  var slow = 0;

  function readPalette() {
    var style = getComputedStyle(document.documentElement);
    var raw = style.getPropertyValue("--particles").replace(/["']/g, "");
    var list = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (list.length) palette = list;
    paletteAlpha = parseFloat(style.getPropertyValue("--particles-alpha")) || 1;
  }

  // Campo de corriente: un ángulo que cambia suave según la posición y el tiempo
  function flowAngle(x, y, time) {
    return (
      Math.sin(x * 0.0021 + time * 0.23) * 1.6 +
      Math.cos(y * 0.0026 - time * 0.17) * 1.6 +
      Math.sin((x + y) * 0.0012 + time * 0.09)
    );
  }

  function alloc(n) {
    HX = new Float32Array(n); HY = new Float32Array(n);
    X = new Float32Array(n); Y = new Float32Array(n);
    VX = new Float32Array(n); VY = new Float32Array(n);
    DX = new Float32Array(n); DY = new Float32Array(n);
    FX = new Float32Array(n); FY = new Float32Array(n);
    LEN = new Float32Array(n); OFF = new Float32Array(n);
    DEPTH = new Float32Array(n); SPD = new Float32Array(n); INF = new Float32Array(n);
    COL = new Uint8Array(n); WID = new Uint8Array(n);
  }

  function build() {
    var area = W * H;
    var density = (W < 700 ? 1150 : 900) / quality;
    var n = Math.round(Math.min(1600 * quality, Math.max(320 * quality, area / density)));
    var cell = Math.sqrt(area / n);
    var cols = Math.ceil(W / cell) + 1;
    var rows = Math.ceil(H / cell) + 1;
    N = cols * rows;
    alloc(N);
    var k = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++, k++) {
        var hx = (c + (r % 2) * 0.5 + (Math.random() - 0.5) * 0.9) * cell;
        var hy = (r + (Math.random() - 0.5) * 0.9) * cell;
        var fa = flowAngle(hx, hy, t);
        HX[k] = X[k] = hx;
        HY[k] = Y[k] = hy;
        FX[k] = DX[k] = Math.cos(fa);
        FY[k] = DY[k] = Math.sin(fa);
        LEN[k] = 2.4 + Math.random() * 4.4;
        OFF[k] = Math.random() * 2 - 1;
        DEPTH[k] = Math.random();
        COL[k] = (Math.random() * 16) | 0;
        WID[k] = Math.random() < 0.2 ? 1 : 0;
      }
    }
  }

  // Todas las partículas salen disparadas desde un punto
  function explodeAt(x, y) {
    for (var k = 0; k < N; k++) {
      var ang = Math.random() * TAU;
      var dist = Math.random() * 26;
      var speed = 6 + Math.random() * 24;
      var cx = Math.cos(ang);
      var cy = Math.sin(ang);
      X[k] = x + cx * dist;
      Y[k] = y + cy * dist;
      VX[k] = cx * speed;
      VY[k] = cy * speed;
      DX[k] = cx;
      DY[k] = cy;
    }
  }

  function resize(force) {
    var newW = window.innerWidth;
    var newH = canvas.clientHeight || window.innerHeight;
    // En celulares la barra del navegador cambia la altura al hacer scroll:
    // ignoramos cambios pequeños para que el fondo no se reinicie.
    var changed = force || Math.abs(newW - W) > 2 || Math.abs(newH - H) > 140;
    W = newW;
    H = newH;
    DPR = Math.min(window.devicePixelRatio || 1, maxDPR);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    if (changed) build();
  }

  function step(dt) {
    t += dt / 60;
    frame++;
    var now = performance.now();
    var idle = !pointer.active || now - pointer.lastMove > 4500;
    var tx, ty;

    if (idle) {
      // Paseo automático (curva de Lissajous) cuando no hay cursor
      tx = W * 0.5 + Math.sin(t * 0.31) * W * 0.3 + Math.sin(t * 0.73) * W * 0.05;
      ty = H * 0.5 + Math.sin(t * 0.47 + 1.3) * H * 0.26;
    } else {
      tx = pointer.x;
      ty = pointer.y;
    }
    var follow = 1 - Math.pow(1 - (idle ? 0.025 : 0.16), dt);
    att.x += (tx - att.x) * follow;
    att.y += (ty - att.y) * follow;

    var baseR = Math.max(70, Math.min(175, Math.min(W, H) * 0.15));
    var R = baseR * (1 + Math.sin(t * 1.6) * 0.1);
    var infl = R * 2.6;
    var infl2 = infl * infl;
    var invInfl = 1 / infl;
    var damp = Math.pow(0.9, dt);
    var turn = Math.min(1, 0.18 * dt);
    var parity = frame & 1;
    var ax = att.x, ay = att.y;

    for (var i = shocks.length - 1; i >= 0; i--) {
      var sh = shocks[i];
      sh.r += 15 * dt;
      sh.power *= Math.pow(0.962, dt);
      if (sh.power < 0.05 || sh.r > W + H) shocks.splice(i, 1);
    }
    var nShocks = shocks.length;
    scrollKick *= Math.pow(0.85, dt);
    var kick = scrollKick;

    for (var k = 0; k < N; k++) {
      // La corriente cambia lento: se recalcula en frames alternos
      if ((k & 1) === parity) {
        var fa = flowAngle(HX[k], HY[k], t);
        FX[k] = Math.cos(fa);
        FY[k] = Math.sin(fa);
      }
      var fx = FX[k] * 0.05;
      var fy = FY[k] * 0.05;
      var x = X[k], y = Y[k];

      // Anillo alrededor del cursor: atracción hacia el radio + giro
      var dx = x - ax;
      var dy = y - ay;
      var d2 = dx * dx + dy * dy;
      var s = 0;
      if (d2 < infl2) {
        var d = Math.sqrt(d2) + 0.0001;
        var nx = dx / d;
        var ny = dy / d;
        s = 1 - d * invInfl;
        s = s * s * (3 - 2 * s);
        var radial = (R * (1 + OFF[k] * 0.32) - d) * 0.045 * s;
        var swirl = 0.6 * s;
        fx += nx * radial - ny * swirl;
        fy += ny * radial + nx * swirl;
      }

      // Resorte que devuelve cada partícula a su casa
      var spring = 0.011 * (1 - s * 0.94);
      fx += (HX[k] - x) * spring;
      fy += (HY[k] - y) * spring;

      // Ondas expansivas de los clics
      for (var j = 0; j < nShocks; j++) {
        var q = shocks[j];
        var sx = x - q.x;
        var sy = y - q.y;
        var sd = Math.sqrt(sx * sx + sy * sy) + 0.001;
        var band = sd - q.r;
        if (band < 70 && band > -70) {
          var f = q.power * (1 - (band < 0 ? -band : band) / 70);
          fx += (sx / sd) * f;
          fy += (sy / sd) * f;
        }
      }

      // Arrastre del scroll (las más "cercanas" se mueven más)
      fy -= kick * (0.35 + DEPTH[k]);

      var vx = (VX[k] + fx * dt) * damp;
      var vy = (VY[k] + fy * dt) * damp;
      VX[k] = vx;
      VY[k] = vy;
      X[k] = x + vx * dt;
      Y[k] = y + vy * dt;

      // Dirección de la línea: sigue la velocidad (o la corriente si está quieta)
      var sp2 = vx * vx + vy * vy;
      var sp = Math.sqrt(sp2);
      var wx, wy;
      if (sp > 0.2) {
        wx = vx / sp;
        wy = vy / sp;
      } else {
        wx = FX[k];
        wy = FY[k];
      }
      var ox = DX[k], oy = DY[k];
      // Una línea no tiene punta: elegimos el sentido más cercano para girar suave
      if (wx * ox + wy * oy < 0) { wx = -wx; wy = -wy; }
      ox += (wx - ox) * turn;
      oy += (wy - oy) * turn;
      var m = Math.sqrt(ox * ox + oy * oy) || 1;
      DX[k] = ox / m;
      DY[k] = oy / m;
      SPD[k] = sp;
      INF[k] = s;
    }
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var nc = palette.length;
    var nb = nc * 8;
    for (var b = 0; b < nb; b++) paths[b] = null;
    paths.length = nb;

    for (var k = 0; k < N; k++) {
      var x = X[k], y = Y[k];
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      var sp = SPD[k];
      var energy = INF[k] * 1.15 + sp * 0.12;
      var level = energy >= 1 ? 3 : (energy * 4) | 0;
      var half = LEN[k] * (1 + (sp < 8 ? sp : 8) * 0.28) * 0.5;
      var ex = DX[k] * half;
      var ey = DY[k] * half;
      var idx = ((COL[k] % nc) * 4 + level) * 2 + WID[k];
      var path = paths[idx] || (paths[idx] = new Path2D());
      path.moveTo(x - ex, y - ey);
      path.lineTo(x + ex, y + ey);
    }

    ctx.lineCap = "round";
    for (var i = 0; i < nb; i++) {
      if (!paths[i]) continue;
      ctx.globalAlpha = ALPHAS[(i >> 1) & 3] * fade * paletteAlpha;
      ctx.strokeStyle = palette[i >> 3];
      ctx.lineWidth = i & 1 ? 2.4 : 1.5;
      ctx.stroke(paths[i]);
    }
    ctx.globalAlpha = 1;
  }

  // Si los frames tardan mucho de forma sostenida, se baja la calidad
  function watch(ms) {
    if (ms > 200) return; // la pestaña estuvo oculta
    samples++;
    if (samples < 120) return; // los primeros 2 s no cuentan (carga y explosión)
    if (ms > 25) slow += 1;
    else slow = Math.max(0, slow - 0.6);
    if (slow > 50 && quality > 0.3) {
      quality *= 0.6;
      maxDPR = 1;
      slow = 0;
      samples = 60;
      resize(true);
    }
  }

  function loop(now) {
    if (!running) return;
    var ms = now - last;
    var dt = Math.min(3, ms / 16.667 || 1);
    last = now;
    // Lejos del inicio el fondo casi no se ve: se dibuja a la mitad de cuadros
    if (fade < 0.5 && !shocks.length && (frame++ & 1)) { requestAnimationFrame(loop); return; }
    watch(ms);
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceQuery.matches) return;
    running = true;
    waiting = false;
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }

  function updateFade() {
    // En el inicio el fondo brilla al 100%; más abajo baja para que se lea el texto
    var y = window.scrollY || 0;
    var k = Math.min(1, Math.max(0, y / (H * 0.85)));
    fade = 1 - 0.55 * k;
  }

  function isInteractive(el) {
    return el && el.closest && el.closest("a, button, input, textarea, select, label, summary, [data-no-shock]");
  }

  function bindEvents() {
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (!e.touches[0]) return;
      pointer.x = e.touches[0].clientX;
      pointer.y = e.touches[0].clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      pointer.active = false;
    });

    window.addEventListener("pointerdown", function (e) {
      if (isInteractive(e.target)) return;
      Portfolio.particles.burst(e.clientX, e.clientY, 5.5);
    }, { passive: true });

    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      var dy = y - lastScrollY;
      lastScrollY = y;
      scrollKick = Math.max(-6, Math.min(6, scrollKick + dy * 0.018));
      updateFade();
      if (!running && !waiting) draw();
    }, { passive: true });

    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        resize(false);
        if (!running) draw();
      }, 150);
    });

    window.addEventListener("themechange", function () {
      readPalette();
      draw(); // repinta al instante para la animación del cambio de tema
    });

    var onMotionChange = function () {
      if (reduceQuery.matches) {
        stop();
        draw();
      } else {
        start();
      }
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onMotionChange);
  }

  Portfolio.particles = {
    /* opts.waitForIntro: si hay intro, el fondo espera a que el logo "explote" */
    init: function (opts) {
      canvas = document.querySelector("[data-field]");
      if (!canvas || !canvas.getContext) return;
      ctx = canvas.getContext("2d");
      readPalette();
      W = window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      resize(true);
      att.x = W * 0.5;
      att.y = H * 0.5;
      lastScrollY = window.scrollY || 0;
      updateFade();
      bindEvents();

      if (reduceQuery.matches) {
        draw(); // fondo quieto
      } else if (opts && opts.waitForIntro) {
        waiting = true;
        // Por si algo falla, el fondo arranca solo a los 4 segundos
        setTimeout(function () {
          if (waiting) Portfolio.particles.explode(W * 0.5, H * 0.46);
        }, 4000);
      } else {
        explodeAt(W * 0.5, H * 0.46); // explosión de entrada
        start();
      }
    },
    // Explosión desde un punto (la usa la intro del logo)
    explode: function (x, y) {
      if (!canvas) return;
      explodeAt(x, y);
      att.x = x;
      att.y = y;
      start();
    },
    // Onda expansiva desde un punto (clics y el botón "Copiar")
    burst: function (x, y, power) {
      if (!running) return;
      shocks.push({ x: x, y: y, r: 0, power: power || 5 });
      if (shocks.length > 6) shocks.shift();
    }
  };
})();
