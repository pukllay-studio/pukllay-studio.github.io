/* Tema de la tienda: colores, fuentes (lista cerrada de Google Fonts) y logo.
   Lo usan la tienda (app.js) y el editor (admin.js). Todo valor que llega de la configuración se valida aquí. */
(function () {
  "use strict";
  var FUENTES = {
    titulos: {
      "Bodoni Moda": { q: "Bodoni+Moda:opsz,wght@6..96,500;6..96,600", pila: "'Bodoni Moda', Didot, Georgia, serif" },
      "Playfair Display": { q: "Playfair+Display:wght@500;600", pila: "'Playfair Display', Georgia, serif" },
      "Cormorant Garamond": { q: "Cormorant+Garamond:wght@500;600", pila: "'Cormorant Garamond', Garamond, serif" },
      "Fraunces": { q: "Fraunces:opsz,wght@9..144,500;9..144,600", pila: "Fraunces, Georgia, serif" },
      "DM Serif Display": { q: "DM+Serif+Display", pila: "'DM Serif Display', Georgia, serif" },
      "Lora": { q: "Lora:wght@500;600", pila: "Lora, Georgia, serif" },
      "Bricolage Grotesque": { q: "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700", pila: "'Bricolage Grotesque', system-ui, sans-serif" },
      "Archivo": { q: "Archivo:wght@500;700", pila: "Archivo, system-ui, sans-serif" },
      "Syne": { q: "Syne:wght@600;700", pila: "Syne, system-ui, sans-serif" },
      "Outfit": { q: "Outfit:wght@500;600", pila: "Outfit, system-ui, sans-serif" },
      "Anton": { q: "Anton", pila: "Anton, Impact, sans-serif" },
      "Barlow Condensed": { q: "Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,800", pila: "'Barlow Condensed', 'Arial Narrow', sans-serif" },
      "Oswald": { q: "Oswald:wght@500;600;700", pila: "Oswald, 'Arial Narrow', sans-serif" }
    },
    texto: {
      "Hanken Grotesk": { q: "Hanken+Grotesk:wght@400;500;600", pila: "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif" },
      "DM Sans": { q: "DM+Sans:wght@400;500;600", pila: "'DM Sans', system-ui, sans-serif" },
      "Nunito Sans": { q: "Nunito+Sans:wght@400;600", pila: "'Nunito Sans', system-ui, sans-serif" },
      "Work Sans": { q: "Work+Sans:wght@400;500;600", pila: "'Work Sans', system-ui, sans-serif" },
      "Karla": { q: "Karla:wght@400;500;600", pila: "Karla, system-ui, sans-serif" },
      "Manrope": { q: "Manrope:wght@400;500;600", pila: "Manrope, system-ui, sans-serif" },
      "Source Sans 3": { q: "Source+Sans+3:wght@400;600", pila: "'Source Sans 3', system-ui, sans-serif" },
      "Lato": { q: "Lato:wght@400;700", pila: "Lato, system-ui, sans-serif" },
      "Poppins": { q: "Poppins:wght@400;500;600", pila: "Poppins, system-ui, sans-serif" },
      "Barlow": { q: "Barlow:wght@400;500;600;700", pila: "Barlow, 'Segoe UI', system-ui, sans-serif" }
    }
  };
  var COLORES = ["fondo", "papel", "placa", "tinta", "suave", "acento", "oscuro", "destacado"];

  function hex(v, def) { return /^#[0-9a-f]{6}$/i.test(v || "") ? v.toLowerCase() : def; }
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function aHex(c) { return "#" + c.map(function (x) { return Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0"); }).join(""); }
  function mezclar(a, b, t) { var x = rgb(a), y = rgb(b); return aHex(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
  function luz(h) {
    return rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function contraste(a, b) { var x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  /* Une la configuración recibida con los valores por defecto (para configuraciones parciales o antiguas). */
  function completar(base, extra) {
    if (Array.isArray(base) || typeof base !== "object" || base === null) return extra === undefined ? base : extra;
    var out = {}; Object.keys(base).forEach(function (k) { out[k] = completar(base[k], extra ? extra[k] : undefined); });
    if (extra && typeof extra === "object") Object.keys(extra).forEach(function (k) { if (!(k in out)) out[k] = extra[k]; });
    return out;
  }

  function aplicar(cfg, doc) {
    doc = doc || document;
    var t = cfg.tema || {}, r = doc.documentElement.style;
    var c = {
      fondo: hex(t.fondo, "#efedea"), papel: hex(t.papel, "#faf8f5"), placa: hex(t.placa, "#f3f0eb"),
      tinta: hex(t.tinta, "#1b1917"), suave: hex(t.suave, "#5a534c"), acento: hex(t.acento, "#8c3a49"), oscuro: hex(t.oscuro, "#2b2422"),
      destacado: hex(t.destacado, "#f3c6d3")
    };
    var blanco = "#ffffff", negro = "#000000";
    r.setProperty("--bg", c.fondo); r.setProperty("--papel", c.papel); r.setProperty("--placa", c.placa);
    r.setProperty("--placa-2", mezclar(c.placa, c.tinta, 0.05));
    r.setProperty("--arena", mezclar(c.fondo, c.tinta, 0.09)); r.setProperty("--arena-2", mezclar(c.fondo, c.tinta, 0.14));
    r.setProperty("--tinta", c.tinta); r.setProperty("--suave", c.suave);
    r.setProperty("--acento", c.acento); r.setProperty("--acento-hover", mezclar(c.acento, negro, 0.16));
    r.setProperty("--acento-tinta", contraste(c.acento, blanco) >= 4.5 ? blanco : "#111111");
    r.setProperty("--acento-claro", mezclar(c.acento, blanco, 0.58));
    r.setProperty("--destacado", c.destacado); r.setProperty("--destacado-tinta", contraste(c.destacado, "#111111") >= 4.5 ? "#111111" : "#ffffff");
    r.setProperty("--campo-oscuro", c.oscuro); r.setProperty("--claro-sobre-oscuro", mezclar(c.fondo, blanco, 0.3));
    r.setProperty("--linea-form", mezclar(c.fondo, c.tinta, 0.2));
    var ft = FUENTES.titulos[t.fuenteTitulos] || FUENTES.titulos["Bodoni Moda"], fx = FUENTES.texto[t.fuenteTexto] || FUENTES.texto["Hanken Grotesk"];
    r.setProperty("--display", ft.pila); r.setProperty("--texto", fx.pila);
    var href = "https://fonts.googleapis.com/css2?family=" + ft.q + "&family=" + fx.q + "&display=swap";
    var link = doc.querySelector('link[href^="https://fonts.googleapis.com/css2"]');
    if (link && link.getAttribute("href") !== href) link.setAttribute("href", href);
    var tc = doc.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute("content", c.fondo);
    return c;
  }

  /* Ruta de imagen permitida: archivo local en img/, foto subida a Supabase Storage o imagen en memoria del editor. */
  function rutaImagen(src) {
    src = String(src || "");
    if (/^img\/[a-z0-9-]+\.(webp|png|jpg)$/.test(src)) return src;
    if (/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/productos\/[a-z0-9\/_.-]+\.(webp|png|jpg)$/.test(src)) return src;
    if (/^data:image\/(webp|png|jpeg);base64,[a-z0-9+\/=]+$/i.test(src) && src.length < 3e6) return src;
    return "";
  }

  window.DA_TEMA = { FUENTES: FUENTES, COLORES: COLORES, aplicar: aplicar, completar: completar, contraste: contraste, mezclar: mezclar, hex: hex, rutaImagen: rutaImagen };
})();
