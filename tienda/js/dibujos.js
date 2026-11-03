/* Ilustraciones planas de cada prenda (sustituyen a la foto mientras no haya fotos reales).
   Se recolorean con el color elegido. viewBox 0 0 400 500. */
(function () {
  var TINTA = "#1f1c1a";
  function oscuro(hex) { return luz(hex) < 0.35; }
  function luz(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function trazo(c) { return oscuro(c) ? "rgba(255,255,255,.18)" : "rgba(31,28,26,.28)"; }
  function sombra(c) { return oscuro(c) ? "rgba(255,255,255,.07)" : "rgba(31,28,26,.10)"; }
  function p(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + "/>"; }

  var TORSO = "M150 70 Q200 128 250 70 L298 86 Q312 92 309 112 L296 214 Q289 262 286 300 Q284 330 292 346 Q244 362 214 436 L186 436 Q156 362 108 346 Q116 330 114 300 Q111 262 104 214 L91 112 Q88 92 102 86 Z";
  var TORSO_SOMBRA = "M250 70 L298 86 Q312 92 309 112 L296 214 Q289 262 286 300 Q284 330 292 346 Q262 356 240 392 Q262 300 258 214 Q256 140 250 70 Z";
  var MANGA_L = ["M298 86 Q340 98 352 160 L374 300 Q360 312 342 306 L320 180 Q314 150 300 138 Z", "M102 86 Q60 98 48 160 L26 300 Q40 312 58 306 L80 180 Q86 150 100 138 Z"];
  var MANGA_C = ["M298 86 Q336 96 348 142 Q334 156 318 152 Q312 132 301 124 Z", "M102 86 Q64 96 52 142 Q66 156 82 152 Q88 132 99 124 Z"];
  var TIRANTES = "M150 70 Q200 150 250 70 L262 70 L266 100 Q300 120 296 214 Q289 262 286 300 Q284 330 292 346 Q244 362 214 436 L186 436 Q156 362 108 346 Q116 330 114 300 Q111 262 104 214 Q100 120 134 100 L138 70 Z";

  function cuerpo(c, mangas) {
    var s = "";
    (mangas || []).forEach(function (m) { s += p(m, c, ' stroke="' + trazo(c) + '" stroke-width="2"'); });
    s += p(TORSO, c, ' stroke="' + trazo(c) + '" stroke-width="2"');
    s += p(TORSO_SOMBRA, sombra(c));
    return s;
  }
  function falda(c, y) {
    y = y || 0;
    var capas = "";
    [[0, 0.55], [14, 0.7], [28, 0.85]].forEach(function (k) {
      var a = 230 + y + k[0], b = 380 + y + k[0] * 0.6;
      capas += p("M128 " + a + " L52 " + b + " Q90 " + (b + 22) + " 126 " + b + " Q163 " + (b + 22) + " 200 " + b + " Q237 " + (b + 22) + " 274 " + b + " Q310 " + (b + 22) + " 348 " + b + " L272 " + a + " Z",
        c, ' opacity="' + k[1] + '" stroke="' + trazo(c) + '" stroke-width="1.5"');
    });
    return capas + '<rect x="126" y="' + (222 + y) + '" width="148" height="16" fill="' + c + '" stroke="' + trazo(c) + '" stroke-width="2"/>';
  }

  var D = {
    bodyLarga: function (c) { return cuerpo(c, MANGA_L); },
    bodyCorta: function (c) { return cuerpo(c, MANGA_C); },
    bodyGim: function (c) {
      return p(TIRANTES, c, ' stroke="' + trazo(c) + '" stroke-width="2"') + p(TORSO_SOMBRA, sombra(c));
    },
    pantys: function (c) {
      return p("M128 50 H272 V74 L262 430 Q260 462 232 462 H214 L204 150 H196 L186 462 H168 Q140 462 138 430 L128 74 Z", c, ' stroke="' + trazo(c) + '" stroke-width="2"') +
        '<rect x="128" y="50" width="144" height="24" fill="' + sombra(c) + '"/>' +
        p("M262 74 L254 420 Q252 440 236 444 L224 160 Z", sombra(c));
    },
    falda: function (c) { return falda(c, -110); },
    conjunto: function (c) {
      var tul = c === "#1d1c1f" ? "#3a3740" : c;
      return cuerpo(c, MANGA_C) + falda(tul, 0);
    },
    deportivo: function (c) {
      return p("M146 60 Q200 110 254 60 L270 66 Q296 110 290 190 H110 Q104 110 130 66 Z", c, ' stroke="' + trazo(c) + '" stroke-width="2"') +
        p("M118 214 H282 L276 470 H230 L204 290 H196 L170 470 H124 Z", c, ' stroke="' + trazo(c) + '" stroke-width="2"') +
        '<rect x="118" y="214" width="164" height="20" fill="' + sombra(c) + '"/>' +
        p("M270 66 Q296 110 290 190 H262 Q270 120 270 66 Z", sombra(c));
    },
    zapatilla: function (c) {
      return p("M54 318 Q52 268 116 262 L246 252 Q332 248 352 296 Q362 336 322 348 L104 352 Q56 352 54 318 Z", c, ' stroke="' + trazo(c) + '" stroke-width="2.5"') +
        p("M128 268 Q190 236 262 258 Q250 290 196 292 Q150 292 128 268 Z", "rgba(31,28,26,.55)") +
        p("M56 330 Q60 352 104 354 L322 350 Q352 344 356 320 Q340 338 320 340 L104 344 Q70 344 56 330 Z", sombra(c)) +
        '<rect x="176" y="236" width="14" height="112" rx="2" fill="' + (oscuro(c) ? "#e7a8b4" : "#f2ece4") + '" stroke="' + trazo(c) + '" stroke-width="1.5" transform="rotate(-8 183 292)"/>';
    },
    zapatillaEscarcha: function (c) {
      var s = D.zapatilla(c), pts = "";
      for (var i = 0; i < 60; i++) {
        var x = 70 + ((i * 53) % 270), y = 272 + ((i * 37) % 70);
        pts += '<circle cx="' + x + '" cy="' + y + '" r="' + (1.4 + (i % 3)) + '" fill="#ffffff" opacity="' + (0.35 + (i % 4) * 0.15) + '"/>';
      }
      return s + pts;
    },
    medias: function (c) {
      c = c || "#f2ece4";
      var s = p("M150 60 H250 V300 Q250 330 280 344 L330 370 Q360 388 346 420 Q336 440 300 432 L176 410 Q150 404 150 376 Z", c, ' stroke="' + trazo(c) + '" stroke-width="2"');
      for (var i = 0; i < 18; i++) s += '<circle cx="' + (184 + (i % 6) * 26) + '" cy="' + (392 + Math.floor(i / 6) * 13 - (i % 6) * 4) + '" r="4" fill="#a8262f" opacity=".7"/>';
      return s + '<rect x="150" y="60" width="100" height="26" fill="' + sombra(c) + '"/>';
    },
    protector: function (c) {
      c = c || "#ede3d6";
      return p("M110 250 Q110 170 200 166 Q290 170 290 250 Q290 330 200 334 Q110 330 110 250 Z", c, ' opacity=".9" stroke="' + trazo(c) + '" stroke-width="2.5"') +
        p("M150 250 Q150 210 200 208 Q250 210 250 250 Q250 292 200 294 Q150 292 150 250 Z", "rgba(255,255,255,.55)");
    },
    mono: function (c) {
      c = c || "#2a2420";
      var s = '<circle cx="200" cy="250" r="92" fill="' + c + '"/>' + p("M138 214 Q200 170 262 214 Q236 196 200 196 Q164 196 138 214 Z", "rgba(255,255,255,.12)");
      for (var i = 0; i < 22; i++) {
        var a = (i / 22) * Math.PI * 2;
        s += '<circle cx="' + (200 + Math.cos(a) * 104).toFixed(1) + '" cy="' + (250 + Math.sin(a) * 104).toFixed(1) + '" r="9" fill="#f4efe8" stroke="rgba(31,28,26,.25)"/>';
      }
      return s;
    }
  };

  window.DA_DIBUJO = function (tipo, colorHex, etiqueta) {
    var f = D[tipo] || D.bodyCorta;
    return '<svg viewBox="0 0 400 500" role="img" aria-label="' + (etiqueta || "Ilustración del producto") + '" xmlns="http://www.w3.org/2000/svg">' + f(colorHex) + "</svg>";
  };
  window.DA_ES_OSCURO = oscuro;
  window.DA_TINTA = TINTA;
})();
