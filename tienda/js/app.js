/* Tienda en línea (plantilla). Vanilla JS sin dependencias. El contenido sale de js/config.js y js/catalogo.js.
   Seguridad: todo dato se escapa con esc() antes de entrar al HTML; el carrito guardado se valida contra el catálogo. */
(function () {
  "use strict";
  var TEMA = window.DA_TEMA, DATOS = window.DA_DATOS;
  var CFG = window.DA_CONFIG;
  var cat = null; // catálogo cargado
  var estado = { ruta: {}, carrito: [], favs: [], filtros: {}, colorVitrina: "", prodVitrina: "" };
  var app = document.getElementById("app");
  var MAX_CANT = 10;

  /* ---------- utilidades ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"'`=\/]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;", "=": "&#61;", "/": "&#47;" }[c];
    });
  }
  var fmt = formateador();
  function formateador() { try { return new Intl.NumberFormat(CFG.idioma || "es-PE", { style: "currency", currency: CFG.moneda || "PEN" }); } catch (e) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }); } }
  /* Reemplaza {marca} {whatsapp} {envio} {cambios} {pago} {precioMinimo} en textos de la configuración */
  function plantilla(t) {
    return String(t == null ? "" : t).replace(/\{(marca|whatsapp|envio|cambios|pago|precioMinimo)\}/g, function (_, k) {
      if (k === "whatsapp") return telVisible();
      if (k === "precioMinimo") { var m = precioMinimo(); return isFinite(m) ? fmt.format(m) : ""; }
      return CFG[k] || "";
    });
  }
  function lista(v) { return Array.isArray(v) ? v : []; }
  function activa(sec) { return !CFG.secciones || CFG.secciones[sec] !== false; }
  function precio(p) { var v = p && typeof p === "object" ? p.precio : p; return v == null ? "Precio a consultar" : fmt.format(v); }
  function precioHtml(p) { return esc(precio(p)) + (p.precioAntes ? ' <s class="antes">' + esc(fmt.format(p.precioAntes)) + '</s> <span class="etiqueta">Oferta</span>' : ""); }
  function leer(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* almacenamiento no disponible */ } }
  function prod(id) { return cat.productos.find(function (p) { return p.id === id; }); }
  function categoria(id) { return cat.categorias.find(function (c) { return c.id === id; }); }
  function hexColor(n) { var v = cat.colores[n]; return /^#[0-9a-f]{6}$/i.test(v || "") ? v : "#e7a8b4"; }
  function nombreColor(n) { return n ? (n.charAt(0).toUpperCase() + n.slice(1)).replace(/-/g, " ") : "Consultar"; }
  /* Foto real del producto (la del color pedido si existe); sin fotos, ilustración de respaldo */
  function fotoDe(p, color) {
    var fs = p.fotos || [];
    return fs.find(function (f) { return color && f.color === color; }) || fs[0] || null;
  }
  function htmlFoto(f, alt, prioridad) {
    var src = f && TEMA.rutaImagen(f.src); if (!src) return "";
    return '<img class="foto foto--' + (f.tipo === "e" ? "e" : "r") + '" src="' + esc(src) + '" width="' + (+f.w || 600) + '" height="' + (+f.h || 600) +
      '" alt="' + esc(alt || "") + '" decoding="async"' + (prioridad ? ' fetchpriority="high"' : ' loading="lazy"') + ">";
  }
  function dibujo(p, color, alt, prioridad) {
    var f = fotoDe(p, color);
    if (f) return htmlFoto(f, alt || p.nombre, prioridad);
    if (!p.dibujo || !window.DA_DIBUJO) return '<span class="foto-vacia" role="img" aria-label="' + esc(alt || p.nombre) + '">' + esc((p.nombre || "?").charAt(0).toUpperCase()) + "</span>";
    return window.DA_DIBUJO(p.dibujo, hexColor(color || p.colores[0]), esc(alt || p.nombre));
  }
  function fotoSuelta(src, w, h, tipo, alt, prioridad) { return htmlFoto({ src: src, w: w, h: h, tipo: tipo }, alt, prioridad); }
  /* Referencia de foto en la configuración: "img/x.webp", URL de Storage o "id-producto:color" */
  function refProducto(ref) {
    var m = String(ref || "").split(":"); var p = prod(m[0]);
    return p ? { p: p, color: m[1] || "" } : null;
  }
  function fotoRef(ref, alt, prioridad) {
    if (TEMA.rutaImagen(ref)) return fotoSuelta(ref, 1200, 1200, "e", alt, prioridad);
    var r = refProducto(ref); return r ? dibujo(r.p, r.color, alt == null ? r.p.nombre : alt, prioridad) : "";
  }
  function primeraConFoto(filtro) { return cat.productos.find(function (p) { return (!filtro || filtro(p)) && p.fotos && p.fotos.length; }); }
  function waLink(texto) { return "https://wa.me/" + encodeURIComponent(CFG.whatsapp) + "?text=" + encodeURIComponent(texto); }
  function telVisible() {
    var n = String(CFG.whatsapp || "").replace(/\D/g, "");
    if (/^51\d{9}$/.test(n)) return "+51 " + n.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    return n ? "+" + n.replace(/(\d{2,3})(?=(\d{3})+$)/, "$1 ").replace(/(\d{3})(?=\d{3}$)/, "$1 ") : "";
  }
  function visibles() { return cat.categorias.filter(function (c) { return c.visible && cat.productos.some(function (p) { return p.cat === c.id; }); }).sort(function (a, b) { return a.orden - b.orden; }); }
  function aviso(msg, accion) {
    var t = document.getElementById("aviso");
    t.textContent = msg;
    if (accion) { var a = document.createElement("a"); a.href = accion.href; a.setAttribute("data-ir", ""); a.textContent = accion.texto; t.appendChild(a); }
    t.hidden = false; t.classList.remove("sale"); void t.offsetWidth; t.classList.add("entra");
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { t.classList.add("sale"); setTimeout(function () { t.hidden = true; }, 260); }, accion ? 4200 : 2600);
  }

  /* ---------- carrito (validado) ---------- */
  function limpiarCarrito(lista) {
    return (Array.isArray(lista) ? lista : []).map(function (i) {
      var p = i && prod(i.id);
      if (!p || p.precio == null) return null;
      if (p.tallas.length && p.tallas.indexOf(i.talla) < 0) return null;
      if (p.colores.length && p.colores.indexOf(i.color) < 0) return null;
      var c = Math.max(1, Math.min(MAX_CANT, parseInt(i.cant, 10) || 1));
      return { id: p.id, talla: i.talla || "", color: i.color || "", cant: c };
    }).filter(Boolean);
  }
  function guardarCarrito() { guardar("da_carrito", estado.carrito); contarCarrito(); }
  function contarCarrito() {
    var n = estado.carrito.reduce(function (s, i) { return s + i.cant; }, 0);
    document.querySelectorAll("[data-cuenta]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    var f = estado.favs.length;
    document.querySelectorAll("[data-favs]").forEach(function (el) { el.textContent = f; el.hidden = f === 0; });
  }
  function agregar(id, talla, color, cant) {
    var p = prod(id); if (!p || p.precio == null) return false;
    var ex = estado.carrito.find(function (i) { return i.id === id && i.talla === talla && i.color === color; });
    if (ex) ex.cant = Math.min(MAX_CANT, ex.cant + cant);
    else estado.carrito.push({ id: id, talla: talla, color: color, cant: Math.min(MAX_CANT, cant) });
    guardarCarrito();
    return true;
  }
  function subtotal() { return estado.carrito.reduce(function (s, i) { return s + prod(i.id).precio * i.cant; }, 0); }

  /* ---------- rutas (?ver=...) ---------- */
  function parsear(href) {
    var q = href.indexOf("?") >= 0 ? href.slice(href.indexOf("?") + 1).split("#")[0] : "";
    var r = {}; new URLSearchParams(q).forEach(function (v, k) { r[k] = v.slice(0, 80); });
    r.ver = ["inicio", "tienda", "producto", "carrito", "favoritos", "reclamaciones", "privacidad"].indexOf(r.ver) >= 0 ? r.ver : "inicio";
    return r;
  }
  function ir(href, sinHistorial) {
    estado.ruta = parsear(href);
    if (!sinHistorial) { try { history.pushState(null, "", href); } catch (e) { /* vista previa sin URL */ } }
    pintar();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-ir]");
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); cerrarMenu();
    if (a.id === "abrir-cajon" && estado.ruta.ver !== "carrito") { abrirCajon(); return; }
    cerrarCajon(); ir(a.getAttribute("href"));
  });
  window.addEventListener("popstate", function () { estado.ruta = parsear(location.search); pintar(); });

  function meta(titulo, desc) {
    document.title = titulo ? titulo + " · " + CFG.marca : CFG.marca + (CFG.seo && CFG.seo.titulo ? " · " + CFG.seo.titulo : "");
    var m = document.querySelector('meta[name="description"]'); if (m && desc) m.setAttribute("content", desc);
    var ld = document.getElementById("ld-producto"); if (ld) ld.remove();
  }

  function pintar() {
    var v = estado.ruta.ver;
    document.body.dataset.vista = v;
    if (v === "tienda") vistaTienda();
    else if (v === "producto") vistaProducto();
    else if (v === "carrito") vistaCarrito();
    else if (v === "favoritos") vistaFavoritos();
    else if (v === "reclamaciones") vistaReclamaciones();
    else if (v === "privacidad") vistaPrivacidad();
    else vistaInicio();
    marcarNav();
    actualizarWhatsApp();
    entradas();
  }

  /* ---------- cabecera ---------- */
  function deportivo() { return (CFG.tema || {}).estilo === "deportivo"; }
  function cabeceraContenido() {
    TEMA.aplicar(CFG);
    document.body.classList.toggle("estilo-deportivo", deportivo());
    var nav = visibles().map(function (c) { return '<a data-ir data-cat="' + esc(c.id) + '" href="?ver=tienda&cat=' + esc(c.id) + '">' + esc(c.nombre) + "</a>"; }).join("");
    var an = document.getElementById("anuncios");
    an.innerHTML = lista(CFG.anuncios).map(function (a) { return "<span>" + esc(plantilla(a)) + "</span>"; }).join(""); an.hidden = !lista(CFG.anuncios).length;
    document.getElementById("nav-principal").innerHTML = '<a data-ir data-cat="" href="?ver=tienda">Toda la tienda</a>' + nav;
    var marca = document.querySelector(".barra__marca"), logo = TEMA.rutaImagen((CFG.tema || {}).logo), img = marca.querySelector("img"), nom = marca.querySelector("span");
    marca.setAttribute("aria-label", CFG.marca + ", inicio");
    if (logo) { img.src = logo; img.hidden = false; } else img.hidden = true;
    nom.textContent = CFG.marca; nom.hidden = !!logo && (CFG.tema || {}).nombreConLogo === false;
    var fav = document.querySelector('link[rel="icon"]'); if (fav && logo) fav.href = logo;
    var md = document.querySelector('meta[name="description"]'); if (md && CFG.seo) md.setAttribute("content", CFG.seo.descripcion || "");
    var ns = document.querySelector(".sin-js"); if (ns) ns.textContent = "Activa JavaScript para usar la tienda, o escríbenos por WhatsApp al " + telVisible() + ".";
    document.getElementById("pie-marca").innerHTML = pie();
  }
  function cabecera() {
    cabeceraContenido();
    document.getElementById("buscador").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = this.q.value.trim().slice(0, 60);
      ir("?ver=tienda" + (q ? "&q=" + encodeURIComponent(q) : ""));
    });
    var bm = document.getElementById("boton-menu");
    bm.addEventListener("click", function () {
      var abierto = document.body.classList.toggle("menu-abierto");
      bm.setAttribute("aria-expanded", abierto);
    });
  }
  function cerrarMenu() { document.body.classList.remove("menu-abierto"); document.getElementById("boton-menu").setAttribute("aria-expanded", "false"); }
  function marcarNav() {
    document.querySelectorAll("#nav-principal a").forEach(function (a) {
      var activo = estado.ruta.ver === "tienda" && (estado.ruta.cat || "") === a.dataset.cat;
      a.toggleAttribute("aria-current", activo);
    });
  }

  /* ---------- INICIO ---------- */
  function vitrinaProductos() {
    var ids = lista((CFG.vitrina || {}).productos).filter(function (id) { return prod(id); });
    if (!ids.length) ids = cat.productos.filter(function (p) { return p.colores.length > 1 && p.fotos && p.fotos.length; }).slice(0, 3).map(function (p) { return p.id; });
    return ids;
  }
  function vistaInicio() {
    meta("", (CFG.seo || {}).descripcion);
    if (deportivo()) return vistaInicioDeportivo();
    var h = CFG.hero || {}, vit = vitrinaProductos(), lp = CFG.listaPrecios || {};
    if (vit.indexOf(estado.prodVitrina) < 0) { estado.prodVitrina = vit[0] || ""; estado.colorVitrina = ""; }
    var p = prod(estado.prodVitrina);
    if (p && p.colores.indexOf(estado.colorVitrina) < 0) estado.colorVitrina = p.colores[0] || "";
    var boton = function (b, clase) { return b && b.texto ? '<a class="' + clase + '" data-ir href="' + esc(destino(b.destino)) + '">' + esc(b.texto) + "</a>" : ""; };
    var grupos = visibles().map(function (c) { return { t: c.nombre, ps: cat.productos.filter(function (q) { return q.cat === c.id; }) }; }).filter(function (g) { return g.ps.length; });
    var conVitrina = activa("vitrina") && p, conLista = activa("listaPrecios") && grupos.length;
    app.innerHTML =
      '<div class="escenario">' +
        '<div class="escenario__fijo" aria-hidden="true"><div class="placa placa--escena" id="placa-escena">' + escenaHero() + '</div><p class="placa__pie" id="pie-escena"></p></div>' +
        '<div class="escenario__columna">' +
          '<section class="hero" data-escena="hero">' +
            '<p class="hero__frase">' + esc(plantilla(h.subtitulo)) + '</p>' +
            '<div class="hero__acciones">' + boton(h.boton1, "boton") + boton(h.boton2, "enlace-flecha") + '</div>' +
            (lista(h.datos).length ? '<dl class="hero__datos">' + lista(h.datos).slice(0, 3).map(function (d) { return "<div><dt>" + esc(d.etiqueta) + "</dt><dd>" + esc(plantilla(d.valor)) + "</dd></div>"; }).join("") + "</dl>" : "") +
            '<h1 class="marca-gigante" id="marca-gigante">' + esc(h.titulo || CFG.marca) + '<span class="oculto">: ' + esc((CFG.seo || {}).titulo || "") + '</span></h1>' +
          '</section>' +
          (conVitrina ? '<section class="vitrina revela" id="colores" data-escena="vitrina" aria-labelledby="t-vitrina">' +
            '<h2 id="t-vitrina">' + esc((CFG.vitrina || {}).titulo || "Elige modelo y color") + '</h2>' +
            (vit.length > 1 ? '<div class="pestanas" role="tablist" aria-label="Producto">' + vit.map(function (id) {
              var q = prod(id); return '<button role="tab" type="button" data-vitrina="' + esc(id) + '" aria-selected="' + (id === p.id) + '">' + esc(q.nombre) + "</button>";
            }).join("") + "</div>" : "") +
            '<div class="muestras" role="radiogroup" aria-label="Color" id="muestras-vitrina"></div>' +
            '<div class="vitrina__ficha"><p class="vitrina__nombre" id="vitrina-nombre"></p><p class="vitrina__desc" id="vitrina-desc"></p></div>' +
            '<div class="celdas"><a class="celda celda--tinta" data-ir id="vitrina-elegir" href="#">' + (p.tallas.length ? "Elegir talla" : "Ver producto") + '</a>' +
            (((CFG.vitrina || {}).enlace || {}).texto ? '<a class="celda" data-ir href="' + esc(destino(CFG.vitrina.enlace.destino)) + '">' + esc(CFG.vitrina.enlace.texto) + "</a>" : "") + '</div>' +
          "</section>" : "") +
          (conLista ? '<section class="hoja-precios revela" data-escena="hoja" aria-labelledby="t-precios"><div class="hoja">' +
            '<h2 id="t-precios">' + esc(lp.titulo || "Lista de precios") + '</h2>' + (lp.nota ? '<p class="hoja__nota">' + esc(plantilla(lp.nota)) + "</p>" : "") +
            grupos.map(function (g) {
              return '<div class="hoja__grupo"><h3>' + esc(g.t) + "</h3><ul>" + g.ps.map(function (q) {
                return '<li><a data-ir href="?ver=producto&id=' + esc(q.id) + '"><span class="hoja__item">' + esc(q.nombre) + '</span><span class="hoja__precio">' + (q.precio == null ? "Consultar" : esc(fmt.format(q.precio))) + '</span></a><span class="hoja__tallas">' + esc(resumenTallas(q)) + "</span></li>";
              }).join("") + "</ul></div>";
            }).join("") +
            '<p class="hoja__cierre">Pedidos por WhatsApp<br>' + esc(telVisible()) + "</p>" +
          "</div></section>" : "") +
        "</div>" +
      "</div>" +
      (activa("vitrina3d") ? seccionVitrina3d() : "") + (activa("categorias") ? seccionCategorias() : "") + (activa("combo") ? seccionUniforme() : "") +
      (activa("comoComprar") ? seccionComo() : "") + (activa("preguntas") ? seccionPreguntas() : "") + (activa("contacto") ? seccionContacto() : "");
    if (conVitrina) {
      pintarVitrina();
      app.querySelectorAll("[data-vitrina]").forEach(function (b) {
        b.addEventListener("click", function () {
          estado.prodVitrina = b.dataset.vitrina;
          var q = prod(estado.prodVitrina);
          if (q.colores.indexOf(estado.colorVitrina) < 0) estado.colorVitrina = q.colores[0] || "";
          app.querySelectorAll("[data-vitrina]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
          app.querySelector("#vitrina-elegir").textContent = q.tallas.length ? "Elegir talla" : "Ver producto";
          pintarVitrina(true);
        });
      });
    }
    observarEscenas();
    escalarMarca();
    enlazarUniforme();
    enlazarVitrina3d();
  }
  /* Solo enlaces internos (?ver=...) o externos https */
  function destino(d) { d = String(d || ""); return /^\?ver=[a-z]+(&[a-z]+=[a-z0-9-]*)*$/i.test(d) || /^https:\/\//.test(d) ? d : "?ver=tienda"; }
  function precioMinimo(catId) {
    return Math.min.apply(null, cat.productos.filter(function (p) { return p.precio != null && (!catId || p.cat === catId); }).map(function (p) { return p.precio; }).concat([Infinity]));
  }
  function seccionCategorias() {
    var conf = CFG.categorias || {}, portadas = conf.portadas || {}, vis = visibles();
    if (!vis.length) return "";
    return '<section class="categorias revela" aria-labelledby="t-cat"><h2 id="t-cat">' + esc(conf.titulo || "Compra por categoría") + '</h2><div class="categorias__rejilla">' +
      vis.map(function (c, i) {
        var n = cat.productos.filter(function (p) { return p.cat === c.id; }).length, min = precioMinimo(c.id);
        var foto = fotoRef(portadas[c.id], "");
        if (!foto) { var q = primeraConFoto(function (p) { return p.cat === c.id; }) || cat.productos.find(function (p) { return p.cat === c.id; }); foto = q ? dibujo(q, "", "") : ""; }
        return '<a class="categoria categoria--' + (i === 0 ? "grande" : "chica") + '" data-ir href="?ver=tienda&cat=' + esc(c.id) + '">' +
          '<span class="categoria__placa" aria-hidden="true">' + foto + "</span>" +
          '<span class="categoria__texto"><span class="categoria__nombre">' + esc(c.nombre) + '</span><span class="categoria__dato">' +
          n + (n === 1 ? " producto" : " productos") + (isFinite(min) ? " · desde " + esc(fmt.format(min)) : " · precios por WhatsApp") + "</span></span></a>";
      }).join("") + "</div></section>";
  }
  function resumenTallas(p) {
    if (!p.tallas.length) return "Modelos a consultar";
    return p.tallas.length === 1 ? "Talla " + p.tallas[0] : "Tallas " + p.tallas[0] + " a " + p.tallas[p.tallas.length - 1];
  }
  function escenaHero() {
    var h = CFG.hero || {}, src = TEMA.rutaImagen(h.imagen);
    if (src) return fotoSuelta(src, 1344, 896, "e", h.imagenAlt || "", true);
    var q = primeraConFoto(); return q ? dibujo(q, "", "", true) : "";
  }
  function ponerEscena(svg, pie) {
    var pl = document.getElementById("placa-escena"); if (!pl) return;
    if (pl.dataset.html === svg) return;
    pl.dataset.html = svg;
    pl.classList.toggle("placa--escena", /foto--e/.test(svg));
    pl.classList.remove("cambia"); void pl.offsetWidth; pl.classList.add("cambia");
    pl.innerHTML = svg; document.getElementById("pie-escena").textContent = pie;
  }
  function pintarVitrina(cambiarEscena) {
    var p = prod(estado.prodVitrina), c = estado.colorVitrina;
    var m = document.getElementById("muestras-vitrina"); if (!p || !m) return;
    m.innerHTML = p.colores.map(function (n) {
      return '<button type="button" role="radio" class="muestra" aria-checked="' + (n === c) + '" data-color="' + esc(n) + '" data-c="' + esc(hexColor(n)) + '"><span class="muestra__chip"></span><span>' + esc(nombreColor(n)) + "</span></button>";
    }).join("");
    m.querySelectorAll("[data-color]").forEach(function (b) {
      b.addEventListener("click", function () { estado.colorVitrina = b.dataset.color; pintarVitrina(true); });
    });
    document.getElementById("vitrina-nombre").textContent = p.nombre + (c ? " en " + nombreColor(c).toLowerCase() : "") + ", " + precio(p);
    document.getElementById("vitrina-desc").textContent = p.descripcion;
    document.getElementById("vitrina-elegir").setAttribute("href", "?ver=producto&id=" + encodeURIComponent(p.id) + (c ? "&color=" + encodeURIComponent(c) : ""));
    if (cambiarEscena) ponerEscena(dibujo(p, c), p.nombre + (c ? ", " + nombreColor(c).toLowerCase() : ""));
  }
  function observarEscenas() {
    if (!("IntersectionObserver" in window)) return;
    var lp = CFG.listaPrecios || {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.dataset.escena;
        if (k === "hero") ponerEscena(escenaHero(), "");
        if (k === "vitrina" && prod(estado.prodVitrina)) ponerEscena(dibujo(prod(estado.prodVitrina), estado.colorVitrina), prod(estado.prodVitrina).nombre + (estado.colorVitrina ? ", " + nombreColor(estado.colorVitrina).toLowerCase() : ""));
        if (k === "hoja") { var f = fotoRef(lp.foto, ""); if (f) ponerEscena(f, lp.fotoTexto || ""); }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    app.querySelectorAll("[data-escena]").forEach(function (s) { io.observe(s); });
  }
  function escalarMarca() {
    var m = document.getElementById("marca-gigante");
    if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var raf = 0;
    function act() { raf = 0; var y = Math.min(1, window.scrollY / (window.innerHeight * 0.8)); m.style.transform = "scale(" + (1 - y * 0.07).toFixed(3) + ")"; }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(act); }, { passive: true });
  }

  function seccionComo() {
    var conf = CFG.comoComprar || {}, filas = lista(conf.filas).filter(function (f) { return f && f.titulo; });
    if (!filas.length) return "";
    return '<section class="como" aria-labelledby="t-como"><div class="como__marco"><h2 id="t-como" class="como__titulo">' + esc(conf.titulo || "Así compras") + '</h2><div class="como__filas">' +
      filas.map(function (f, i) {
        var foto = fotoRef(f.foto, "");
        return '<article class="fila revela' + (i % 2 ? " fila--inv" : "") + '"><h3>' + esc(f.titulo) + '</h3><div class="fila__cuerpo">' + (foto ? '<div class="fila__placa">' + foto + "</div>" : "") +
          "<ul>" + lista(f.puntos).map(function (x) { return "<li>" + esc(plantilla(x)) + "</li>"; }).join("") + "</ul></div></article>";
      }).join("") + "</div></div></section>";
  }
  function seccionPreguntas() {
    var conf = CFG.preguntas || {}, qs = lista(conf.lista).filter(function (q) { return q && q.p; });
    if (!qs.length) return "";
    return '<section class="preguntas revela" aria-labelledby="t-preg"><h2 id="t-preg">' + esc(conf.titulo || "Preguntas frecuentes") + '</h2><div class="preguntas__texto">' +
      qs.map(function (q) { return "<p><strong>" + esc(q.p) + "</strong> " + esc(plantilla(q.r)) + "</p>"; }).join("") + "</div></section>";
  }
  function redes() {
    return [["Facebook", CFG.facebook], ["Instagram", CFG.instagram], ["TikTok", CFG.tiktok]].filter(function (r) { return /^https:\/\//.test(r[1] || ""); })
      .map(function (r) { return '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener">' + r[0] + "</a>"; }).join("");
  }
  function seccionContacto() {
    var conf = CFG.contacto || {};
    return '<section class="contacto" aria-labelledby="t-contacto"><h2 id="t-contacto" class="contacto__frase">' + esc(plantilla(conf.frase || "Escríbenos por WhatsApp.")) + '</h2>' +
      '<a class="contacto__numero" href="' + esc(waLink(plantilla((CFG.mensajes || {}).consulta))) + '" target="_blank" rel="noopener">' + esc(telVisible()) + "</a>" +
      '<div class="contacto__pie"><span>' + esc(plantilla(conf.pie || "")) + '</span><span class="contacto__redes">' + redes() + "</span></div></section>";
  }

  /* ---------- TIENDA (catálogo + filtros) ---------- */
  function rangos() { var r = lista(CFG.rangosPrecio).map(Number).filter(function (x) { return x > 0; }); return r.length >= 2 ? [r[0], r[1]] : [20, 50]; }
  function rangoDe(k) { var r = rangos(); return { r0: [0, r[0]], r1: [r[0], r[1]], r2: [r[1], 1e12] }[k]; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function filtrar() {
    var r = estado.ruta, f = estado.filtros, q = norm(r.q);
    var lista = cat.productos.filter(function (p) {
      var c = categoria(p.cat); if (!c || !c.visible) return false;
      if (r.cat && p.cat !== r.cat) return false;
      if (r.sub && p.sub !== r.sub) return false;
      if (f.talla && p.tallas.indexOf(f.talla) < 0) return false;
      if (f.color && p.colores.indexOf(f.color) < 0) return false;
      if (f.publico && (p.publico || []).indexOf(f.publico) < 0) return false;
      if (f.precio) {
        if (f.precio === "consultar") { if (p.precio != null) return false; }
        else { var rg = rangoDe(f.precio); if (!rg || p.precio == null || p.precio < rg[0] || p.precio > rg[1]) return false; }
      }
      if (q) {
        var sub = (c.sub.find(function (s) { return s.id === p.sub; }) || {}).nombre;
        var bolsa = norm([p.nombre, p.sku, c.nombre, sub, p.marca, p.tallas.join(" "), p.colores.join(" "), p.descripcion].join(" "));
        if (q.split(/\s+/).some(function (w) { return bolsa.indexOf(w) < 0; })) return false;
      }
      return true;
    });
    var o = f.orden || "relevancia";
    lista.sort(function (a, b) {
      if (o === "precio-asc") return (a.precio == null ? 1e9 : a.precio) - (b.precio == null ? 1e9 : b.precio);
      if (o === "precio-desc") return (b.precio == null ? -1 : b.precio) - (a.precio == null ? -1 : a.precio);
      if (o === "novedades") return (b.fecha || 0) - (a.fecha || 0) || a.orden - b.orden;
      return a.orden - b.orden;
    });
    return lista;
  }
  function vistaTienda() {
    var r = estado.ruta, c = r.cat ? categoria(r.cat) : null;
    if (c && !c.visible) c = null;
    var titulo = r.q ? "Resultados para “" + r.q + "”" : c ? c.nombre : "Toda la tienda";
    meta(c ? c.nombre : "Tienda", c ? c.nombre + " en " + CFG.marca + ". " + ((CFG.seo || {}).descripcion || "") : (CFG.seo || {}).descripcion);
    var base = cat.productos.filter(function (p) { return (!r.cat || p.cat === r.cat) && (categoria(p.cat) || {}).visible; });
    var esCalzado = function (p) { return !!(categoria(p.cat) || {}).calzado; };
    var tallas = unicos(base.filter(function (p) { return !esCalzado(p); }), "tallas"), calzado = unicos(base.filter(esCalzado), "tallas"), colores = unicos(base, "colores");
    var publicos = unicos(base, "publico"), rg = rangos();
    var f = estado.filtros;
    app.innerHTML =
      '<div class="tienda">' +
        '<header class="tienda__cabeza"><h1>' + esc(titulo) + '</h1><p id="conteo" aria-live="polite"></p></header>' +
        (c ? '<nav class="subcats" aria-label="Subcategorías"><a data-ir href="?ver=tienda&cat=' + esc(c.id) + '"' + (!r.sub ? " aria-current" : "") + ">Todo</a>" +
          c.sub.filter(function (s) { return cat.productos.some(function (p) { return p.sub === s.id; }); }).map(function (s) {
            return '<a data-ir href="?ver=tienda&cat=' + esc(c.id) + "&sub=" + esc(s.id) + '"' + (r.sub === s.id ? " aria-current" : "") + ">" + esc(s.nombre) + "</a>";
          }).join("") + "</nav>" : "") +
        '<div class="tienda__cuerpo">' +
          '<button type="button" class="boton-filtros" id="boton-filtros" aria-expanded="false" aria-controls="filtros">Filtrar y ordenar</button>' +
          '<form class="filtros" id="filtros" aria-label="Filtros">' +
            '<label class="campo"><span>Ordenar por</span><select name="orden"><option value="relevancia">Relevancia</option><option value="precio-asc">Precio: menor a mayor</option><option value="precio-desc">Precio: mayor a menor</option><option value="novedades">Novedades</option></select></label>' +
            '<label class="campo"><span>Precio</span><select name="precio"><option value="">Todos</option><option value="r0">Hasta ' + esc(fmt.format(rg[0])) + '</option><option value="r1">' + esc(fmt.format(rg[0])) + " a " + esc(fmt.format(rg[1])) + '</option><option value="r2">Más de ' + esc(fmt.format(rg[1])) + '</option>' +
              (base.some(function (p) { return p.precio == null; }) ? '<option value="consultar">A consultar</option>' : "") + '</select></label>' +
            (publicos.length > 1 ? '<label class="campo"><span>Para</span><select name="publico"><option value="">Todos</option>' + publicos.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join("") + "</select></label>" : "") +
            grupoTallas(calzado.length ? "Talla de ropa" : "Talla", tallas, f) + grupoTallas("Talla de calzado", calzado, f) +
            (colores.length ? '<fieldset class="campo"><legend>Color</legend><div class="opciones">' + colores.map(function (n) {
              return '<label class="op op--color" data-c="' + esc(hexColor(n)) + '"><input type="radio" name="color" value="' + esc(n) + '"' + (f.color === n ? " checked" : "") + '><span><i></i>' + esc(nombreColor(n)) + "</span></label>";
            }).join("") + "</div></fieldset>" : "") +
            '<button type="button" class="enlace-flecha" id="limpiar">Quitar filtros</button>' +
          "</form>" +
          '<div class="rejilla" id="rejilla"></div>' +
        "</div>" +
      "</div>";
    var form = document.getElementById("filtros");
    ["orden", "precio", "publico"].forEach(function (k) { if (f[k] && form[k]) form[k].value = f[k]; });
    form.addEventListener("change", function () {
      var d = new FormData(form);
      estado.filtros = { orden: d.get("orden"), precio: d.get("precio"), publico: d.get("publico"), talla: d.get("talla"), color: d.get("color") };
      pintarRejilla();
    });
    document.getElementById("limpiar").addEventListener("click", limpiarFiltros);
    var bf = document.getElementById("boton-filtros");
    bf.addEventListener("click", function () { var a = form.classList.toggle("abierto"); bf.setAttribute("aria-expanded", a); });
    pintarRejilla();
  }
  function grupoTallas(titulo, lista, f) {
    if (!lista.length) return "";
    return '<fieldset class="campo"><legend>' + esc(titulo) + '</legend><div class="opciones">' + lista.map(function (t) {
      return '<label class="op"><input type="radio" name="talla" value="' + esc(t) + '"' + (f.talla === t ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
    }).join("") + "</div></fieldset>";
  }
  function limpiarFiltros() {
    estado.filtros = {};
    if (estado.ruta.q || estado.ruta.sub) ir("?ver=tienda" + (estado.ruta.cat ? "&cat=" + encodeURIComponent(estado.ruta.cat) : ""));
    else vistaTienda();
  }
  function unicos(lista, campo) {
    var s = []; lista.forEach(function (p) { p[campo].forEach(function (v) { if (s.indexOf(v) < 0) s.push(v); }); }); return s;
  }
  function pintarRejilla() {
    var lista = filtrar(), g = document.getElementById("rejilla");
    document.getElementById("conteo").textContent = lista.length === 1 ? "1 producto" : lista.length + " productos";
    if (!lista.length) {
      g.innerHTML = '<div class="vacio"><p class="vacio__titulo">No encontramos productos con esos filtros.</p><p>Prueba con otra talla o color, o escríbenos: quizá lo tenemos y aún no está en la web.</p>' +
        '<div class="vacio__acciones"><button type="button" class="boton" id="vacio-limpiar">Quitar filtros</button><a class="enlace-flecha" target="_blank" rel="noopener" href="' + esc(waLink("Hola, busco: " + (estado.ruta.q || "un producto"))) + '">Preguntar por WhatsApp</a></div></div>';
      document.getElementById("vacio-limpiar").addEventListener("click", limpiarFiltros);
      return;
    }
    g.innerHTML = lista.map(tarjeta).join("");
    enlazarFavs(g);
  }
  function tarjeta(p) {
    var color = estado.filtros.color && p.colores.indexOf(estado.filtros.color) >= 0 ? estado.filtros.color : p.colores[0];
    var fav = estado.favs.indexOf(p.id) >= 0;
    var href = "?ver=producto&id=" + encodeURIComponent(p.id) + (color ? "&color=" + encodeURIComponent(color) : "");
    return '<article class="tarjeta">' +
      '<a class="tarjeta__placa' + (segundaFoto(p, color) ? " tarjeta__placa--doble" : "") + '" data-ir href="' + esc(href) + '" tabindex="-1" aria-hidden="true">' + dibujo(p, color, "") + (segundaFoto(p, color) ? htmlFoto(segundaFoto(p, color), "").replace('class="foto ', 'class="foto foto--segunda ') : "") +
        '<span class="tarjeta__etiqueta-precio">' + esc(precio(p)) + "</span></a>" +
      '<button type="button" class="fav" data-fav="' + esc(p.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Quitar de favoritos: " : "Guardar en favoritos: ") + esc(p.nombre) + '">' + iconoCorazon() + "</button>" +
      '<h2 class="tarjeta__nombre"><a data-ir href="' + esc(href) + '">' + esc(p.nombre) + "</a></h2>" +
      '<p class="tarjeta__precio">' + precioHtml(p) + "</p>" +
      '<p class="tarjeta__meta">' + esc((categoria(p.cat) || {}).nombre || "") + (p.colores.length > 1 ? " · " + p.colores.length + " colores" : "") + "</p>" +
      (p.colores.length > 1 ? '<p class="tarjeta__colores" aria-label="' + p.colores.length + ' colores">' + p.colores.slice(0, 6).map(function (n) { return '<i data-c="' + esc(hexColor(n)) + '" title="' + esc(nombreColor(n)) + '"></i>'; }).join("") + (p.colores.length > 6 ? "<span>+" + (p.colores.length - 6) + "</span>" : "") + "</p>" : "") +
      '<a class="tarjeta__accion" data-ir href="' + esc(href) + '">' + (p.precio == null ? "Ver y consultar" : p.tallas.length ? "Elegir talla" : "Ver producto") + "</a>" +
      "</article>";
  }
  function segundaFoto(p, color) {
    var primera = fotoDe(p, color), fs = (p.fotos || []).filter(function (f) { return f !== primera && f.tipo === primera.tipo; });
    return primera ? fs.find(function (f) { return !f.color || f.color !== primera.color; }) || null : null;
  }
  function iconoCorazon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/></svg>'; }
  function enlazarFavs(raiz) {
    raiz.querySelectorAll("[data-fav]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.dataset.fav, i = estado.favs.indexOf(id), p = prod(id);
        if (i >= 0) estado.favs.splice(i, 1); else estado.favs.push(id);
        var on = i < 0;
        b.setAttribute("aria-pressed", on);
        b.setAttribute("aria-label", (on ? "Quitar de favoritos: " : "Guardar en favoritos: ") + p.nombre);
        guardar("da_favs", estado.favs); contarCarrito();
        aviso(on ? "Guardado en favoritos" : "Quitado de favoritos");
        if (estado.ruta.ver === "favoritos" && !on) vistaFavoritos();
      });
    });
  }

  /* ---------- PRODUCTO ---------- */
  function vistaProducto() {
    var p = prod(estado.ruta.id);
    if (!p || !(categoria(p.cat) || {}).visible) { noEncontrado(); return; }
    var c = categoria(p.cat);
    var sel = { color: p.colores.indexOf(estado.ruta.color) >= 0 ? estado.ruta.color : p.colores[0] || "", talla: "", cant: 1 };
    meta(p.nombre, p.descripcion);
    ldProducto(p);
    var relacionados = cat.productos.filter(function (q) { return q.cat === p.cat && q.id !== p.id; }).slice(0, 4);
    var subc = (c.sub || []).find(function (s) { return s.id === p.sub; }) || {};
    app.innerHTML =
      '<div class="producto">' +
        '<div class="producto__fijo">' +
          '<div class="placa placa--grande' + ((fotoDe(p, sel.color) || {}).tipo === "e" ? " placa--escena" : "") + '" id="placa-producto">' + dibujo(p, sel.color, p.nombre, true) + "</div>" +
          (p.fotos && p.fotos.length > 1 ? '<div class="miniaturas" aria-label="Fotos del producto">' + p.fotos.map(function (f, i) {
            return '<button type="button" class="miniatura" data-foto="' + i + '" aria-label="Ver foto ' + (i + 1) + ' de ' + p.fotos.length + '" aria-pressed="' + (f === fotoDe(p, sel.color)) + '">' + htmlFoto(f, "") + "</button>";
          }).join("") + "</div>" : "") +
          (p.fotos && p.fotos.length || !p.dibujo ? "" : '<p class="nota-foto">Dibujo referencial del modelo y el color.</p>') +
        "</div>" +
        '<div class="producto__info">' +
          '<nav class="migas" aria-label="Ruta"><a data-ir href="?ver=tienda">Tienda</a> / <a data-ir href="?ver=tienda&cat=' + esc(c.id) + '">' + esc(c.nombre) + "</a></nav>" +
          '<h1 class="producto__nombre">' + esc(p.nombre) + "</h1>" +
          '<p class="producto__precio">' + precioHtml(p) + '</p><p class="producto__sku">Código ' + esc(p.sku) + "</p>" +
          '<p class="producto__desc">' + esc(p.descripcion) + "</p>" +
          '<form id="form-compra" novalidate>' +
            (p.colores.length ? '<fieldset class="campo"><legend>Color: <span id="color-elegido">' + esc(nombreColor(sel.color)) + '</span></legend><div class="muestras">' + p.colores.map(function (n) {
              return '<label class="muestra" data-c="' + esc(hexColor(n)) + '"><input type="radio" name="color" value="' + esc(n) + '"' + (n === sel.color ? " checked" : "") + '><span class="muestra__chip"></span><span>' + esc(nombreColor(n)) + "</span></label>";
            }).join("") + "</div></fieldset>" : "") +
            (p.tallas.length ? '<fieldset class="campo"><legend>Talla' + (p.sistemaTalla ? " (" + esc(p.sistemaTalla) + ")" : "") + '</legend><div class="opciones opciones--tallas">' + p.tallas.map(function (t) {
              return '<label class="op"><input type="radio" name="talla" value="' + esc(t) + '" required><span>' + esc(t) + "</span></label>";
            }).join("") + '</div><p class="error" id="error-talla" hidden>Elige una talla para continuar.</p></fieldset>' : "") +
            (p.precio != null ?
              '<div class="campo cantidad"><span id="t-cant">Cantidad</span><div class="paso" role="group" aria-labelledby="t-cant"><button type="button" data-paso="-1" aria-label="Quitar uno">−</button><output id="cant" aria-live="polite">1</output><button type="button" data-paso="1" aria-label="Agregar uno">+</button></div></div>' +
              '<div class="producto__acciones"><button type="submit" class="boton boton--ancho" name="accion" value="carrito">Añadir al carrito</button><button type="submit" class="boton boton--claro boton--ancho" name="accion" value="ahora">Comprar ahora</button></div>' +
              '<p class="producto__stock">Te confirmamos el stock por WhatsApp antes de que pagues.</p>'
              : '<div class="producto__acciones"><a class="boton boton--ancho" id="consultar" target="_blank" rel="noopener" href="#">Consultar precio por WhatsApp</a></div>') +
          "</form>" +
          '<details class="info"><summary>Guía de tallas</summary><p>' + guiaTallas(p) + "</p></details>" +
          (subc.advertencia ? '<p class="advertencia">' + esc(subc.advertencia) + '</p>' : "") +
          (p.material ? '<details class="info"><summary>Material</summary><p>' + esc(p.material) + "</p></details>" : "") +
          '<details class="info"><summary>Envío</summary><p>' + esc(CFG.envio) + "</p></details>" +
          '<details class="info"><summary>Cambios y devoluciones</summary><p>' + esc(CFG.cambios) + "</p></details>" +
          '<details class="info"><summary>Pago</summary><p>' + esc(CFG.pago) + "</p></details>" +
        "</div>" +
      "</div>" +
      (relacionados.length ? '<section class="relacionados revela" aria-labelledby="t-rel"><h2 id="t-rel">También en ' + esc(c.nombre.toLowerCase()) + '</h2><div class="rejilla rejilla--fila">' + relacionados.map(tarjeta).join("") + "</div></section>" : "");
    enlazarFavs(app);
    var form = document.getElementById("form-compra");
    var fotoActual = fotoDe(p, sel.color);
    function mostrarFoto(f) {
      if (!f || f === fotoActual && document.querySelector("#placa-producto img")) return;
      fotoActual = f;
      var pl = document.getElementById("placa-producto");
      pl.className = "placa placa--grande" + (f.tipo === "e" ? " placa--escena" : "");
      pl.innerHTML = htmlFoto(f, p.nombre + (f.color ? " en " + nombreColor(f.color).toLowerCase() : ""), true);
      app.querySelectorAll("[data-foto]").forEach(function (b) { b.setAttribute("aria-pressed", p.fotos[+b.dataset.foto] === f); });
    }
    function actualizar() {
      if (p.fotos && p.fotos.length) { var conColor = p.fotos.find(function (f) { return f.color === sel.color; }); if (conColor) mostrarFoto(conColor); }
      else document.getElementById("placa-producto").innerHTML = dibujo(p, sel.color, p.nombre + " " + sel.color);
      var ce = document.getElementById("color-elegido"); if (ce) ce.textContent = nombreColor(sel.color);
      var k = document.getElementById("consultar");
      if (k) k.href = waLink(plantilla((CFG.mensajes || {}).consultaProducto) + p.nombre + " (" + p.sku + ")" + (sel.talla ? ", talla " + sel.talla : "") + (sel.color ? ", color " + sel.color : "") + ".");
    }
    form.addEventListener("change", function (e) {
      if (e.target.name === "color") sel.color = e.target.value;
      if (e.target.name === "talla") { sel.talla = e.target.value; document.getElementById("error-talla").hidden = true; }
      actualizar();
    });
    app.querySelectorAll("[data-foto]").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = p.fotos[+b.dataset.foto]; mostrarFoto(f);
        if (f.color && p.colores.indexOf(f.color) >= 0) {
          sel.color = f.color; var r = form.querySelector('input[name="color"][value="' + CSS.escape(sel.color) + '"]'); if (r) r.checked = true; actualizar();
        }
      });
    });
    app.querySelectorAll("[data-paso]").forEach(function (b) {
      b.addEventListener("click", function () { sel.cant = Math.max(1, Math.min(MAX_CANT, sel.cant + +b.dataset.paso)); document.getElementById("cant").textContent = sel.cant; });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (p.precio == null) return;
      if (p.tallas.length && !sel.talla) {
        var er = document.getElementById("error-talla"); er.hidden = false;
        form.querySelector('input[name="talla"]').focus(); return;
      }
      agregar(p.id, sel.talla, sel.color, sel.cant);
      if (e.submitter && e.submitter.value === "ahora") ir("?ver=carrito");
      else abrirCajon(p.nombre + (sel.talla ? ", talla " + sel.talla : "") + " añadido");
    });
    actualizar();
    barraCompra(p, form);
  }
  function barraCompra(p, form) {
    var vieja = document.getElementById("barra-compra"); if (vieja) vieja.remove();
    var acciones = app.querySelector(".producto__acciones");
    if (p.precio == null || !acciones || !("IntersectionObserver" in window)) return;
    var bar = document.createElement("div");
    bar.id = "barra-compra"; bar.className = "barra-compra"; bar.hidden = true;
    bar.innerHTML = '<span class="barra-compra__dato"><span>' + esc(p.nombre) + '</span><strong>' + esc(precio(p)) + '</strong></span><button type="button" class="boton">Añadir al carrito</button>';
    app.appendChild(bar);
    bar.querySelector("button").addEventListener("click", function () {
      form.requestSubmit(form.querySelector("button[value='carrito']"));
    });
    var io = new IntersectionObserver(function (es) { bar.hidden = es[0].isIntersecting; });
    io.observe(acciones);
  }
  function guiaTallas(p) {
    var c = categoria(p.cat) || {};
    if (!p.tallas.length) return "Este producto se consulta por WhatsApp.";
    return (p.guiaTallas || c.guiaTallas) ? esc(p.guiaTallas || c.guiaTallas) : "Tallas disponibles: " + esc(p.tallas.join(", ")) + ". Si tienes dudas, escríbenos por WhatsApp y te ayudamos a elegir.";
  }
  function ldProducto(p) {
    var ld = { "@context": "https://schema.org", "@type": "Product", name: p.nombre, sku: p.sku, description: p.descripcion, brand: { "@type": "Brand", name: CFG.marca } };
    if (p.precio != null) ld.offers = { "@type": "Offer", priceCurrency: CFG.moneda, price: String(p.precio), availability: "https://schema.org/InStock" };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "ld-producto";
    s.textContent = JSON.stringify(ld).replace(/</g, "\\u003c");
    document.head.appendChild(s);
  }
  function noEncontrado() {
    meta("Producto no encontrado");
    app.innerHTML = '<div class="vacio vacio--pagina"><h1>No encontramos ese producto</h1><p>Puede que ya no esté disponible o que el enlace esté incompleto.</p><a class="boton" data-ir href="?ver=tienda">Ver la tienda</a></div>';
  }

  /* ---------- FAVORITOS ---------- */
  function vistaFavoritos() {
    meta("Favoritos");
    var lista = estado.favs.map(prod).filter(Boolean);
    app.innerHTML = '<div class="tienda"><header class="tienda__cabeza"><h1>Favoritos</h1><p>' + (lista.length ? lista.length + " guardados en este dispositivo" : "") + "</p></header>" +
      (lista.length ? '<div class="rejilla rejilla--fila">' + lista.map(tarjeta).join("") + "</div>" :
        '<div class="vacio"><p class="vacio__titulo">Aún no guardas nada.</p><p>Toca el corazón de cualquier producto para tenerlo a mano aquí.</p><a class="boton" data-ir href="?ver=tienda">Ver la tienda</a></div>') + "</div>";
    enlazarFavs(app);
  }

  /* ---------- CARRITO y PEDIDO ---------- */
  function vistaCarrito() {
    meta("Tu carrito");
    if (!estado.carrito.length) {
      app.innerHTML = '<div class="vacio vacio--pagina"><h1>Tu carrito está vacío</h1><p>Elige tus prendas y vuelve aquí para enviar el pedido por WhatsApp.</p><a class="boton" data-ir href="?ver=tienda">Ver la tienda</a></div>';
      return;
    }
    app.innerHTML =
      '<div class="carrito"><h1>Tu carrito</h1><div class="carrito__cuerpo">' +
        '<ul class="lineas" id="lineas"></ul>' +
        '<aside class="resumen" aria-labelledby="t-resumen"><h2 id="t-resumen">Resumen</h2>' +
          '<dl><div><dt>Subtotal</dt><dd id="r-sub"></dd></div><div><dt>Envío</dt><dd>Lo calculamos por WhatsApp según tu ciudad</dd></div><div class="total"><dt>Total sin envío</dt><dd id="r-total"></dd></div></dl>' +
          '<form id="form-pedido" novalidate autocomplete="on">' +
            '<h2>Tus datos</h2><p class="ayuda">Solo lo necesario para preparar tu pedido.</p>' +
            '<label class="campo"><span>Nombre</span><input name="nombre" id="f-nombre" required minlength="2" maxlength="60" autocomplete="name"></label>' +
            '<label class="campo"><span>Celular (WhatsApp)</span><input name="celular" id="f-celular" required inputmode="numeric" maxlength="11" autocomplete="tel-national" placeholder="9XX XXX XXX"></label>' +
            '<label class="campo"><span>Ciudad o distrito</span><input name="ciudad" id="f-ciudad" required minlength="2" maxlength="60" autocomplete="address-level2"></label>' +
            '<label class="campo"><span>Nota (opcional)</span><textarea name="nota" id="f-nota" maxlength="200" rows="2"></textarea></label>' +
            '<label class="trampa" aria-hidden="true">No llenar<input name="web" id="f-web" tabindex="-1" autocomplete="off"></label>' +
            '<p class="error" id="error-pedido" role="alert" hidden></p>' +
            '<button type="submit" class="boton boton--ancho" id="enviar">Preparar pedido para WhatsApp</button>' +
            '<p class="ayuda">' + esc(CFG.pago) + ' Al enviar aceptas nuestra <a data-ir href="?ver=privacidad">política de privacidad</a>.</p>' +
          "</form>" +
          '<div id="listo" hidden></div>' +
        "</aside>" +
      "</div></div>";
    pintarLineas();
    document.getElementById("form-pedido").addEventListener("submit", enviarPedido);
  }
  function pintarLineas() {
    var ul = document.getElementById("lineas"); if (!ul) return;
    if (!estado.carrito.length) { vistaCarrito(); return; }
    ul.innerHTML = estado.carrito.map(function (i, k) {
      var p = prod(i.id);
      return '<li class="linea"><a class="linea__placa" data-ir href="?ver=producto&id=' + esc(p.id) + "&color=" + esc(i.color) + '" aria-hidden="true" tabindex="-1">' + dibujo(p, i.color) + "</a>" +
        '<div class="linea__datos"><a data-ir class="linea__nombre" href="?ver=producto&id=' + esc(p.id) + '">' + esc(p.nombre) + "</a>" +
        "<p>" + (i.talla ? "Talla " + esc(i.talla) : "") + (i.color ? " · " + esc(nombreColor(i.color)) : "") + " · " + esc(fmt.format(p.precio)) + " c/u</p>" +
        '<div class="paso" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-l="' + k + '" data-d="-1" aria-label="Quitar uno">−</button><output>' + i.cant + '</output><button type="button" data-l="' + k + '" data-d="1" aria-label="Agregar uno">+</button></div></div>' +
        '<div class="linea__fin"><p class="linea__sub">' + esc(fmt.format(p.precio * i.cant)) + '</p><button type="button" class="quitar" data-quitar="' + k + '">Eliminar</button></div></li>';
    }).join("");
    ul.querySelectorAll("[data-d]").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = estado.carrito[+b.dataset.l];
        it.cant = Math.max(1, Math.min(MAX_CANT, it.cant + +b.dataset.d));
        guardarCarrito(); pintarLineas();
      });
    });
    ul.querySelectorAll("[data-quitar]").forEach(function (b) {
      b.addEventListener("click", function () { estado.carrito.splice(+b.dataset.quitar, 1); guardarCarrito(); pintarLineas(); aviso("Producto eliminado"); });
    });
    document.getElementById("r-sub").textContent = fmt.format(subtotal());
    document.getElementById("r-total").textContent = fmt.format(subtotal());
  }
  async function enviarPedido(e) {
    e.preventDefault();
    var f = e.target, er = document.getElementById("error-pedido"), bt = document.getElementById("enviar");
    var d = {
      nombre: f.nombre.value.replace(/\s+/g, " ").trim(),
      celular: f.celular.value.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, ""),
      ciudad: f.ciudad.value.replace(/\s+/g, " ").trim(),
      nota: f.nota.value.replace(/\s+/g, " ").trim().slice(0, 200)
    };
    var fallo = d.nombre.length < 2 ? ["f-nombre", "Escribe tu nombre."] :
      !/^9\d{8}$/.test(d.celular) ? ["f-celular", "El celular debe tener 9 dígitos y empezar con 9."] :
      d.ciudad.length < 2 ? ["f-ciudad", "Escribe tu ciudad o distrito."] : null;
    f.querySelectorAll("[aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); });
    if (fallo) { er.textContent = fallo[1]; er.hidden = false; var el = document.getElementById(fallo[0]); el.setAttribute("aria-invalid", "true"); el.focus(); return; }
    if (f.web.value) return; // bot
    er.hidden = true; bt.disabled = true; bt.textContent = "Preparando…";
    var res = { local: true };
    try {
      res = await DATOS.crearPedido({ cliente: d, trampa: f.web.value, items: estado.carrito.map(function (i) { return { producto: i.id, talla: i.talla, color: i.color, cantidad: i.cant }; }) });
    } catch (x) {
      er.textContent = x.message + " Puedes intentar de nuevo en un momento."; er.hidden = false;
      bt.disabled = false; bt.textContent = "Preparar pedido para WhatsApp"; return;
    }
    var lineas = estado.carrito.map(function (i) {
      var p = prod(i.id);
      return "• " + i.cant + " x " + p.nombre + (i.talla ? ", talla " + i.talla : "") + (i.color ? ", " + i.color : "") + " (" + fmt.format(p.precio * i.cant) + ")";
    });
    var total = res.total != null ? res.total : subtotal();
    var msg = plantilla((CFG.mensajes || {}).pedido) + (res.codigo ? " (" + res.codigo + ")" : "") + ":\n" + lineas.join("\n") +
      "\nTotal sin envío: " + fmt.format(total) + "\n\nNombre: " + d.nombre + "\nCelular: " + d.celular + "\nCiudad: " + d.ciudad + (d.nota ? "\nNota: " + d.nota : "");
    f.hidden = true;
    var listo = document.getElementById("listo");
    listo.hidden = false;
    listo.innerHTML = '<h2>Tu pedido está listo</h2><p>Ábrelo en WhatsApp y toca enviar. Te respondemos para confirmar stock, envío y pago.</p>' +
      '<pre class="mensaje" id="mensaje"></pre>' +
      '<a class="boton boton--ancho" target="_blank" rel="noopener" href="' + esc(waLink(msg)) + '">Abrir WhatsApp</a>' +
      '<button type="button" class="boton boton--claro boton--ancho" id="copiar">Copiar mensaje</button>' +
      '<p class="ayuda">Si WhatsApp no se abre, copia el mensaje y envíalo a ' + esc(telVisible()) + '.</p>' +
      '<button type="button" class="enlace-flecha" id="vaciar">Ya lo envié, vaciar carrito</button>';
    document.getElementById("mensaje").textContent = msg;
    document.getElementById("copiar").addEventListener("click", function () {
      var pre = document.getElementById("mensaje");
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { aviso("Mensaje copiado"); }, function () {
        var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); aviso("Selecciona y copia el mensaje");
      });
    });
    document.getElementById("vaciar").addEventListener("click", function () { estado.carrito = []; guardarCarrito(); ir("?ver=inicio"); aviso("Gracias por tu pedido"); });
  }

  /* ---------- movimiento de entrada ---------- */
  function entradas() { /* las entradas viven en CSS (animation-timeline: view()); el contenido es visible sin script */ }

  /* Colores de muestras vía CSSOM (permite una CSP sin 'unsafe-inline' en estilos) */
  function aplicarColores(raiz) {
    raiz.querySelectorAll("[data-c]").forEach(function (el) {
      if (/^#[0-9a-f]{6}$/i.test(el.dataset.c)) el.style.setProperty("--c", el.dataset.c);
      el.removeAttribute("data-c");
    });
  }
  new MutationObserver(function () { aplicarColores(app); }).observe(app, { childList: true, subtree: true });

  /* ================= CARRITO LATERAL ================= */
  var cajon = document.getElementById("cajon");
  function abrirCajon(msg) {
    pintarCajon(msg);
    if (!cajon.open) { if (cajon.showModal) cajon.showModal(); else cajon.setAttribute("open", ""); }
    document.body.classList.add("cajon-abierto");
  }
  function cerrarCajon() {
    if (cajon.open) { if (cajon.close) cajon.close(); else cajon.removeAttribute("open"); }
  }
  cajon.addEventListener("close", function () { document.body.classList.remove("cajon-abierto"); });
  cajon.addEventListener("click", function (e) {
    if (e.target === cajon || e.target.closest("[data-cerrar-cajon]")) { cerrarCajon(); return; }
    var d = e.target.closest("[data-cd]"), q = e.target.closest("[data-cq]");
    if (d) { var it = estado.carrito[+d.dataset.l]; if (it) { it.cant = Math.max(1, Math.min(MAX_CANT, it.cant + +d.dataset.cd)); guardarCarrito(); pintarCajon(); sincronizarCarrito(); } }
    if (q) { estado.carrito.splice(+q.dataset.cq, 1); guardarCarrito(); pintarCajon("Producto eliminado"); sincronizarCarrito(); }
  });
  function sincronizarCarrito() { if (estado.ruta.ver === "carrito") { if (estado.carrito.length) pintarLineas(); else vistaCarrito(); } }
  function pintarCajon(msg) {
    var c = document.getElementById("cajon-cuerpo");
    var aviso = '<p class="cajon__aviso" role="status">' + (msg ? esc(msg) : "") + "</p>";
    if (!estado.carrito.length) {
      c.innerHTML = aviso + '<div class="cajon__vacio"><p class="vacio__titulo">Tu carrito está vacío.</p><p>Elige tus prendas y aquí verás el total.</p><a class="boton" data-ir href="?ver=tienda">Ver la tienda</a></div>';
      return;
    }
    var n = estado.carrito.reduce(function (s, i) { return s + i.cant; }, 0);
    c.innerHTML = aviso + '<ul class="cajon__lineas">' + estado.carrito.map(function (i, k) {
      var p = prod(i.id);
      return '<li class="cajon__linea"><span class="linea__placa">' + dibujo(p, i.color, "") + '</span><div class="cajon__datos"><a data-ir class="linea__nombre" href="?ver=producto&id=' + esc(p.id) + '">' + esc(p.nombre) + "</a>" +
        "<p>" + (i.talla ? "Talla " + esc(i.talla) : "") + (i.color ? " · " + esc(nombreColor(i.color)) : "") + "</p>" +
        '<div class="cajon__fila"><div class="paso" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-l="' + k + '" data-cd="-1" aria-label="Quitar uno">−</button><output>' + i.cant + '</output><button type="button" data-l="' + k + '" data-cd="1" aria-label="Agregar uno">+</button></div>' +
        '<strong class="linea__sub">' + esc(fmt.format(p.precio * i.cant)) + "</strong></div>" +
        '<button type="button" class="quitar" data-cq="' + k + '">Eliminar</button></div></li>';
    }).join("") + "</ul>" +
      '<div class="cajon__pie"><div class="cajon__total"><span>Subtotal (' + n + (n === 1 ? " prenda" : " prendas") + ')</span><strong>' + esc(fmt.format(subtotal())) + "</strong></div>" +
      '<p class="ayuda">El envío lo calculamos por WhatsApp según tu ciudad.</p>' +
      '<a class="boton boton--ancho" data-ir href="?ver=carrito">Finalizar pedido</a>' +
      '<button type="button" class="enlace-flecha" data-cerrar-cajon>Seguir comprando</button></div>';
  }

  /* ================= COMBO (uniforme, pack, kit) ================= */
  function comboPiezas() {
    return lista((CFG.combo || {}).piezas).map(function (pz) {
      var ps = lista(pz.productos).map(prod).filter(function (p) { return p && p.precio != null; });
      return ps.length ? { nombre: pz.nombre || ps[0].nombre, productos: ps, opcional: !!pz.opcional, color: pz.color || "", equivalencias: pz.equivalencias || null } : null;
    }).filter(Boolean);
  }
  function seccionUniforme() {
    var cb = CFG.combo || {}, piezas = comboPiezas(), tallas = lista(cb.tallas);
    if (piezas.length < 2 || !tallas.length) return "";
    var opcColor = function (p, sel) { return p.colores.map(function (n) { return '<option value="' + esc(n) + '"' + (n === sel ? " selected" : "") + ">" + esc(nombreColor(n)) + "</option>"; }).join(""); };
    var etiquetaModelo = function (pz, p) {
      var n = p.nombre; if (n.toLowerCase().indexOf(pz.nombre.toLowerCase() + " ") === 0) n = n.slice(pz.nombre.length + 1);
      return n.charAt(0).toUpperCase() + n.slice(1);
    };
    return '<section class="uniforme" aria-labelledby="t-uni"><div class="uniforme__foto">' + fotoRef(cb.foto, cb.fotoAlt || "") + "</div>" +
      '<form class="uniforme__panel revela" id="u-form" novalidate><h2 id="t-uni">' + esc(cb.titulo || "Arma tu combo") + '</h2>' +
      (cb.intro ? '<p class="uniforme__intro">' + esc(plantilla(cb.intro)) + "</p>" : "") +
      '<fieldset class="campo"><legend>' + esc(cb.etiquetaTalla || "Talla") + '</legend><div class="opciones">' + tallas.map(function (t) {
        return '<label class="op"><input type="radio" name="talla" value="' + esc(t) + '"><span>' + esc(t) + "</span></label>";
      }).join("") + '</div><p class="error" id="u-error" hidden>Elige una talla para continuar.</p></fieldset>' +
      '<div class="u-piezas">' + piezas.map(function (pz, i) {
        var p0 = pz.productos[0], nombre = '<span class="u-pieza__nombre">' + esc(pz.nombre) + "</span>";
        return '<div class="u-pieza"><div class="u-pieza__cab">' + (pz.opcional ? '<label class="u-check"><input type="checkbox" name="incluir-' + i + '" checked>' + nombre + "</label>" : nombre) +
          '<span class="u-pieza__precio" id="u-p-' + i + '"></span></div>' +
          (pz.productos.length > 1 ? '<div class="u-modelo" role="radiogroup" aria-label="Modelo de ' + esc(pz.nombre.toLowerCase()) + '">' + pz.productos.map(function (p, j) {
            return '<label class="op"><input type="radio" name="modelo-' + i + '" value="' + esc(p.id) + '"' + (j === 0 ? " checked" : "") + "><span>" + esc(etiquetaModelo(pz, p)) + "</span></label>";
          }).join("") + "</div>" : '<input type="hidden" name="modelo-' + i + '" value="' + esc(p0.id) + '">') +
          (p0.colores.length ? '<label class="u-color"><span>Color</span><select name="color-' + i + '">' + opcColor(p0, pz.color) + "</select></label>" : "") +
          '<p class="u-nota" id="u-n-' + i + '"></p></div>';
      }).join("") + "</div>" +
      '<div class="u-total"><span>Total</span><strong id="u-total" aria-live="polite"></strong></div>' +
      '<button type="submit" class="boton boton--ancho">Añadir al carrito</button>' +
      (cb.nota ? '<p class="ayuda">' + esc(plantilla(cb.nota)) + (cb.notaEnlace && cb.notaEnlace.texto ? ' <a data-ir href="' + esc(destino(cb.notaEnlace.destino)) + '">' + esc(cb.notaEnlace.texto) + "</a>" : "") + "</p>" : "") +
      "</form></section>";
  }
  function uniformeElegido(f) {
    var t = (f.querySelector('input[name="talla"]:checked') || {}).value || "";
    var piezas = comboPiezas().map(function (pz, i) {
      var sel = f.querySelector('[name="modelo-' + i + '"]:checked') || f.querySelector('input[type=hidden][name="modelo-' + i + '"]');
      var p = prod(sel ? sel.value : pz.productos[0].id), inc = f["incluir-" + i], col = f["color-" + i];
      var talla = pz.equivalencias ? (pz.equivalencias[t] || "") : t;
      var x = { i: i, p: p, talla: talla, color: col ? col.value : "", on: inc ? inc.checked : true };
      x.ok = !t || !p.tallas.length || p.tallas.indexOf(talla) >= 0;
      if (!p.tallas.length) x.talla = "";
      return x;
    });
    return { talla: t, piezas: piezas };
  }
  function enlazarUniforme() {
    var f = document.getElementById("u-form"); if (!f) return;
    function recalcular(e) {
      var m = e && /^modelo-(\d+)$/.exec(e.target.name || "");
      if (m) {
        var p = prod(e.target.value), sel = f["color-" + m[1]];
        if (sel) { var previo = sel.value; sel.innerHTML = p.colores.map(function (n) { return '<option value="' + esc(n) + '">' + esc(nombreColor(n)) + "</option>"; }).join(""); if (p.colores.indexOf(previo) >= 0) sel.value = previo; }
      }
      if (e && e.target.name === "talla") document.getElementById("u-error").hidden = true;
      var u = uniformeElegido(f), total = 0;
      u.piezas.forEach(function (x) {
        var nota = document.getElementById("u-n-" + x.i);
        document.getElementById("u-p-" + x.i).textContent = fmt.format(x.p.precio);
        nota.classList.toggle("u-nota--error", !x.ok && x.on);
        nota.textContent = !u.talla ? "" : !x.on ? "No incluido" : x.ok ? (x.talla ? "Talla " + x.talla : "Talla única") : "No hay en talla " + u.talla;
        var col = f["color-" + x.i]; if (col) col.disabled = !x.on;
        if (x.on && x.ok) total += x.p.precio;
      });
      document.getElementById("u-total").textContent = fmt.format(total);
    }
    f.addEventListener("change", recalcular);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = uniformeElegido(f);
      if (!u.talla) { document.getElementById("u-error").hidden = false; f.querySelector('input[name="talla"]').focus(); return; }
      u.piezas.filter(function (x) { return x.on && x.ok; }).forEach(function (x) { agregar(x.p.id, x.talla, x.color, 1); });
      var faltan = u.piezas.filter(function (x) { return x.on && !x.ok; });
      abrirCajon("Talla " + u.talla + " añadida al carrito" + (faltan.length ? ". " + faltan.map(function (x) { return x.p.nombre; }).join(" y ") + " no tiene esa talla." : ""));
    });
    recalcular();
  }

  /* ================= WHATSAPP FLOTANTE ================= */
  function actualizarWhatsApp() {
    var a = document.getElementById("wa-flotante"); if (!a) return;
    var p = estado.ruta.ver === "producto" ? prod(estado.ruta.id) : null;
    var m = CFG.mensajes || {};
    a.href = waLink(p ? plantilla(m.consultaProducto) + p.nombre + " (" + p.sku + ")." : plantilla(m.consulta));
  }

  /* ================= LIBRO DE RECLAMACIONES ================= */
  function datosEmpresa() {
    var e = CFG.empresa || {};
    var filas = [["Razón social", e.razonSocial], ["RUC", e.ruc], ["Dirección", e.direccion], ["Correo", e.correo], ["WhatsApp", telVisible()]].filter(function (x) { return x[1]; });
    return '<dl class="empresa">' + filas.map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>";
  }
  function vistaReclamaciones() {
    meta("Libro de Reclamaciones", "Libro de Reclamaciones virtual de " + CFG.marca + ".");
    var externo = /^https:\/\//.test(CFG.libroReclamacionesUrl || "");
    var hoy = new Date().toLocaleDateString(CFG.idioma, { day: "2-digit", month: "2-digit", year: "numeric" });
    app.innerHTML = '<div class="legal"><header class="legal__cabeza"><h1>Libro de Reclamaciones</h1>' +
      '<p>Conforme al Código de Protección y Defensa del Consumidor, contamos con un Libro de Reclamaciones a tu disposición.</p></header>' +
      '<div class="legal__cuerpo"><aside class="legal__lado"><h2>Datos del proveedor</h2>' + datosEmpresa() +
      '<p class="ayuda"><strong>Reclamo:</strong> disconformidad con los productos o servicios.</p><p class="ayuda"><strong>Queja:</strong> disconformidad no relacionada con los productos, o malestar por la atención.</p>' +
      '<p class="ayuda">Responderemos en un plazo no mayor a 15 días hábiles. Presentar un reclamo no impide acudir a otras vías ni es requisito previo para denunciar ante el INDECOPI.</p></aside>' +
      (externo ? '<div class="legal__accion"><p>Registra tu reclamo o queja en nuestro libro virtual. Recibirás una copia en tu correo.</p><a class="boton" href="' + esc(CFG.libroReclamacionesUrl) + '" target="_blank" rel="noopener">Abrir el Libro de Reclamaciones</a></div>' :
      '<form class="reclamo" id="form-reclamo" novalidate><p class="reclamo__fecha">Fecha: ' + esc(hoy) + "</p>" +
        '<fieldset class="campo"><legend>1. Tus datos</legend>' +
          campo("r-nombre", "Nombre completo", '<input id="r-nombre" name="nombre" required maxlength="80" autocomplete="name">') +
          '<div class="reclamo__par">' + campo("r-tipodoc", "Documento", '<select id="r-tipodoc" name="tipoDoc"><option>DNI</option><option>CE</option><option>Pasaporte</option></select>') +
          campo("r-doc", "Número", '<input id="r-doc" name="documento" required inputmode="numeric" maxlength="12" autocomplete="off">') + "</div>" +
          campo("r-dom", "Domicilio", '<input id="r-dom" name="domicilio" required maxlength="160" autocomplete="street-address">') +
          '<div class="reclamo__par">' + campo("r-cel", "Celular", '<input id="r-cel" name="celular" required inputmode="numeric" maxlength="11" autocomplete="tel-national">') +
          campo("r-correo", "Correo", '<input id="r-correo" name="correo" type="email" required maxlength="120" autocomplete="email">') + "</div>" +
          '<label class="u-check"><input type="checkbox" name="menor" id="r-menor"><span>Presento el reclamo por un menor de edad</span></label>' +
          '<div id="r-tutor" hidden>' + campo("r-tutor-nombre", "Nombre del padre, madre o apoderado", '<input id="r-tutor-nombre" name="tutor" maxlength="80">') + "</div>" +
        "</fieldset>" +
        '<fieldset class="campo"><legend>2. Producto</legend>' +
          campo("r-prod", "Producto", '<select id="r-prod" name="producto"><option value="">Elige un producto</option>' + cat.productos.map(function (p) { return '<option value="' + esc(p.sku) + '">' + esc(p.nombre) + "</option>"; }).join("") + '<option value="OTRO">Otro / servicio</option></select>') +
          '<div class="reclamo__par">' + campo("r-pedido", "Código de pedido (si lo tienes)", '<input id="r-pedido" name="pedido" maxlength="20">') +
          campo("r-monto", "Monto reclamado (S/)", '<input id="r-monto" name="monto" inputmode="decimal" maxlength="9">') + "</div>" +
        "</fieldset>" +
        '<fieldset class="campo"><legend>3. Detalle</legend><div class="opciones">' +
          '<label class="op"><input type="radio" name="tipo" value="reclamo" checked><span>Reclamo</span></label><label class="op"><input type="radio" name="tipo" value="queja"><span>Queja</span></label></div>' +
          campo("r-detalle", "Cuéntanos qué pasó", '<textarea id="r-detalle" name="detalle" required minlength="10" maxlength="1000" rows="5"></textarea>') +
          campo("r-solicitud", "¿Qué solicitas?", '<textarea id="r-solicitud" name="solicitud" required minlength="5" maxlength="500" rows="3"></textarea>') +
        "</fieldset>" +
        '<label class="trampa" aria-hidden="true">No llenar<input name="web" id="r-web" tabindex="-1" autocomplete="off"></label>' +
        '<label class="u-check"><input type="checkbox" name="acepto" id="r-acepto"><span>Declaro que los datos son verdaderos y acepto la <a data-ir href="?ver=privacidad">política de privacidad</a>.</span></label>' +
        '<p class="error" id="r-error" role="alert" hidden></p>' +
        '<button type="submit" class="boton" id="r-enviar">Enviar reclamo</button></form>') +
      '<div id="r-listo" class="reclamo__listo" hidden></div></div></div>';
    var f = document.getElementById("form-reclamo"); if (!f) return;
    f.menor.addEventListener("change", function () { document.getElementById("r-tutor").hidden = !f.menor.checked; });
    f.addEventListener("submit", enviarReclamo);
  }
  function campo(id, txt, control) { return '<div class="campo"><label for="' + id + '">' + esc(txt) + "</label>" + control + "</div>"; }
  async function enviarReclamo(e) {
    e.preventDefault();
    var f = e.target, er = document.getElementById("r-error"), bt = document.getElementById("r-enviar");
    var limpio = function (v, n) { return String(v || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n); };
    var d = {
      tipo: f.tipo.value === "queja" ? "queja" : "reclamo", nombre: limpio(f.nombre.value, 80), tipoDoc: f.tipoDoc.value,
      documento: limpio(f.documento.value, 12).replace(/\s/g, ""), domicilio: limpio(f.domicilio.value, 160),
      celular: f.celular.value.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, ""), correo: limpio(f.correo.value, 120).toLowerCase(),
      tutor: f.menor.checked ? limpio(f.tutor.value, 80) : "", producto: f.producto.value, pedido: limpio(f.pedido.value, 20).toUpperCase(),
      monto: f.monto.value ? Number(String(f.monto.value).replace(",", ".")) : null, detalle: limpio(f.detalle.value, 1000), solicitud: limpio(f.solicitud.value, 500)
    };
    var fallo = d.nombre.length < 3 ? ["r-nombre", "Escribe tu nombre completo."] :
      (d.tipoDoc === "DNI" ? !/^\d{8}$/.test(d.documento) : !/^[A-Za-z0-9]{6,12}$/.test(d.documento)) ? ["r-doc", d.tipoDoc === "DNI" ? "El DNI debe tener 8 dígitos." : "Revisa el número de documento."] :
      d.domicilio.length < 5 ? ["r-dom", "Escribe tu domicilio."] :
      !/^9\d{8}$/.test(d.celular) ? ["r-cel", "El celular debe tener 9 dígitos y empezar con 9."] :
      !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(d.correo) ? ["r-correo", "Revisa tu correo."] :
      f.menor.checked && d.tutor.length < 3 ? ["r-tutor-nombre", "Escribe el nombre del padre, madre o apoderado."] :
      !d.producto ? ["r-prod", "Elige el producto."] :
      d.monto !== null && !(d.monto >= 0 && d.monto <= 100000) ? ["r-monto", "Revisa el monto."] :
      d.detalle.length < 10 ? ["r-detalle", "Cuéntanos con más detalle qué pasó."] :
      d.solicitud.length < 5 ? ["r-solicitud", "Indica qué solicitas."] :
      !f.acepto.checked ? ["r-acepto", "Marca la declaración para continuar."] : null;
    f.querySelectorAll("[aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); });
    if (fallo) { er.textContent = fallo[1]; er.hidden = false; var el = document.getElementById(fallo[0]); el.setAttribute("aria-invalid", "true"); el.focus(); return; }
    if (f.web.value) return;
    er.hidden = true;
    if (!DATOS.remoto) {
      er.textContent = "El libro en línea todavía no está conectado. Escríbenos a " + ((CFG.empresa || {}).correo || "nuestro correo") + " o por WhatsApp y registramos tu reclamo.";
      er.hidden = false; return;
    }
    bt.disabled = true; bt.textContent = "Enviando…";
    try {
      var r = await DATOS.registrarReclamo(d, f.web.value);
      f.hidden = true;
      var l = document.getElementById("r-listo"); l.hidden = false;
      l.innerHTML = "<h2>Registramos tu " + esc(d.tipo) + "</h2><p>Código: <strong>" + esc(r.codigo) + "</strong>. Fecha: " + esc(r.fecha) + ".</p><p>Guarda este código. Te responderemos en un plazo no mayor a 15 días hábiles.</p>";
      l.focus && l.setAttribute("tabindex", "-1"); l.focus();
    } catch (x) {
      er.textContent = x.message + " Intenta de nuevo en unos minutos."; er.hidden = false; bt.disabled = false; bt.textContent = "Enviar reclamo";
    }
  }

  /* ================= PRIVACIDAD ================= */
  function vistaPrivacidad() {
    meta("Política de privacidad", "Cómo " + CFG.marca + " trata tus datos personales.");
    var e = CFG.empresa || {};
    var titular = e.razonSocial ? e.razonSocial + (e.ruc ? " (RUC " + e.ruc + ")" : "") : CFG.marca;
    var sec = [
      ["Quién trata tus datos", titular + " es responsable de los datos que nos das en esta web. Puedes escribirnos a " + (e.correo || "nuestro correo") + " o por WhatsApp al " + telVisible() + "."],
      ["Qué datos pedimos", "Para un pedido: nombre, celular, ciudad o distrito y una nota opcional. Para un reclamo: además, documento de identidad, domicilio y correo. No pedimos datos de tarjeta."],
      ["Para qué los usamos", "Para preparar y entregar tu pedido, coordinar el pago, atender cambios y responder reclamos. No vendemos ni cedemos tus datos a terceros para publicidad."],
      ["En tu dispositivo", "Tu carrito y tus favoritos se guardan solo en tu navegador. Puedes borrarlos limpiando los datos del sitio."],
      ["Cuánto tiempo", "Guardamos los datos del pedido mientras dure la relación comercial y los plazos que exige la ley. Los reclamos se conservan al menos dos años."],
      ["Tus derechos", "Puedes pedir acceso, rectificación, cancelación u oposición al uso de tus datos (Ley 29733). Escríbenos y te respondemos en los plazos de ley."]
    ];
    app.innerHTML = '<div class="legal legal--texto"><header class="legal__cabeza"><h1>Política de privacidad</h1></header><div class="legal__texto">' +
      sec.map(function (s) { return "<h2>" + esc(s[0]) + "</h2><p>" + esc(s[1]) + "</p>"; }).join("") + "</div></div>";
  }

  /* ================= VITRINA 3D ================= */
  function seccionVitrina3d() {
    var conf = CFG.vitrina3d || {};
    var items = lista(conf.productos).map(function (ref) { var r = refProducto(ref); return r ? [r.p.id, r.color] : null; })
      .filter(function (x) { return x && fotoDe(prod(x[0]), x[1]); });
    if (items.length < 5) items = cat.productos.filter(function (p) { return p.fotos && p.fotos.length; }).slice(0, 8).map(function (p) { return [p.id, ""]; });
    if (items.length < 5) return "";
    items = items.slice(0, 10);
    return '<section class="v3d" aria-labelledby="t-v3d"><div class="v3d__cab"><h2 id="t-v3d">' + esc(conf.titulo || "Gira la vitrina") + '</h2>' +
      (conf.texto ? "<p>" + esc(conf.texto) + "</p>" : "") + '</div>' +
      '<div class="v3d__escena" id="v3d" tabindex="-1">' + items.map(function (x, i) {
        var p = prod(x[0]);
        return '<a class="v3d__item" data-i="' + i + '" data-nombre="' + esc(p.nombre + (x[1] ? ", " + nombreColor(x[1]).toLowerCase() : "")) + '" data-precio="' + esc(precio(p)) +
          '" data-ir href="?ver=producto&id=' + esc(p.id) + (x[1] ? "&color=" + esc(x[1]) : "") + '" aria-label="' + esc(p.nombre) + '">' + htmlFoto(fotoDe(p, x[1]), "") + "</a>";
      }).join("") + '<div class="v3d__suelo" aria-hidden="true"></div></div>' +
      '<div class="v3d__pie"><button type="button" class="v3d__flecha" data-v3d="-1" aria-label="Anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<p class="v3d__ficha"><span id="v3d-nombre"></span><strong id="v3d-precio"></strong></p>' +
      '<button type="button" class="v3d__flecha" data-v3d="1" aria-label="Siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div></section>';
  }
  function enlazarVitrina3d() {
    var esc3 = document.getElementById("v3d"); if (!esc3) return;
    var items = [].slice.call(esc3.querySelectorAll(".v3d__item")), n = items.length, paso = 360 / n;
    var quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ang = 0, vel = quieto ? 0 : -0.12, objetivo = null, arrastre = null, movido = 0, visible = true, frente = -1, raf = 0, pausa = false;
    function radio() { var w = esc3.clientWidth; return w < 600 ? Math.max(140, w * 0.44) : Math.min(560, w * 0.36); }
    function pintar() {
      var R = radio(), mejor = -1, zMax = -Infinity;
      items.forEach(function (el, i) {
        var a = (i * paso + ang) * Math.PI / 180, x = Math.sin(a) * R, z = Math.cos(a) * R, t = (z + R) / (2 * R);
        el.style.transform = "translate(-50%, -50%) translate3d(" + x.toFixed(1) + "px, 0, " + ((Math.cos(a) - 1) * R * 0.95).toFixed(1) + "px) rotateY(" + (-(Math.sin(a) * 12)).toFixed(1) + "deg)";
        el.style.opacity = (0.22 + 0.78 * Math.pow(t, 1.4)).toFixed(3);
        el.style.zIndex = Math.round(t * 100);
        el.style.setProperty("--brillo", (0.55 + 0.45 * t).toFixed(3));
        if (z > zMax) { zMax = z; mejor = i; }
      });
      if (mejor !== frente) {
        frente = mejor; items.forEach(function (el, i) { el.classList.toggle("es-frente", i === mejor); el.tabIndex = i === mejor ? 0 : -1; });
        document.getElementById("v3d-nombre").textContent = items[mejor].dataset.nombre;
        document.getElementById("v3d-precio").textContent = items[mejor].dataset.precio;
      }
    }
    function bucle() {
      raf = 0; if (!document.body.contains(esc3)) return;
      if (objetivo !== null) { var d = objetivo - ang; ang += quieto ? d : d * 0.2; if (Math.abs(d) < 0.05) { ang = objetivo; objetivo = null; } }
      else if (!arrastre && !pausa) { ang += vel; vel += ((quieto ? 0 : -0.12) - vel) * 0.02; }
      pintar();
      if (objetivo !== null || arrastre || (visible && !document.hidden && ((!pausa && !quieto) || Math.abs(vel) > 0.01))) raf = requestAnimationFrame(bucle);
    }
    function seguir() { if (!raf) raf = requestAnimationFrame(bucle); }
    function irA(delta) { var base = Math.round(ang / paso) * paso; objetivo = base - delta * paso; seguir(); }
    esc3.addEventListener("pointerdown", function (e) { arrastre = { x: e.clientX, a: ang, t: performance.now() }; movido = 0; esc3.setPointerCapture(e.pointerId); seguir(); });
    esc3.addEventListener("pointermove", function (e) {
      if (!arrastre) return; var dx = e.clientX - arrastre.x; movido = Math.max(movido, Math.abs(dx));
      var nuevo = arrastre.a + dx * 0.35; vel = (nuevo - ang) * 0.6; ang = nuevo; objetivo = null;
    });
    function soltar() { if (!arrastre) return; arrastre = null; if (quieto) irA(0); seguir(); }
    esc3.addEventListener("pointerup", soltar); esc3.addEventListener("pointercancel", soltar);
    esc3.addEventListener("click", function (e) {
      var a = e.target.closest(".v3d__item"); if (!a) return;
      if (movido > 6) { e.preventDefault(); e.stopPropagation(); return; }
      if (+a.dataset.i !== frente) { e.preventDefault(); e.stopPropagation(); objetivo = -(+a.dataset.i) * paso + Math.round((ang + (+a.dataset.i) * paso) / 360) * 360; seguir(); }
    }, true);
    esc3.addEventListener("mouseenter", function () { pausa = true; });
    esc3.addEventListener("mouseleave", function () { pausa = false; seguir(); });
    esc3.addEventListener("focusin", function () { pausa = true; });
    document.querySelectorAll("[data-v3d]").forEach(function (b) { b.addEventListener("click", function () { pausa = true; irA(+b.dataset.v3d); }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) seguir(); }).observe(esc3);
    document.addEventListener("visibilitychange", seguir);
    window.addEventListener("resize", function () { pintar(); });
    pintar(); seguir();
  }

  /* ================= INCLINACIÓN 3D AL MOVER EL CURSOR ================= */
  function activarInclinacion() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var base = e.target.closest && e.target.closest(".tarjeta, .categoria, .placa--grande"), el = null;
      if (base) el = base.matches(".placa--grande") ? base : base.querySelector(".tarjeta__placa, .categoria__placa");
      if (el) { var rr = el.getBoundingClientRect(); if (e.clientY > rr.bottom || e.clientY < rr.top) el = null; }
      if (inclinado && inclinado !== el) soltarInclinacion();
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg"); el.style.setProperty("--ry", (x * 11).toFixed(2) + "deg");
      el.style.setProperty("--mx", (x * 14).toFixed(1) + "px"); el.style.setProperty("--my", (y * 10).toFixed(1) + "px");
      el.classList.add("inclinado"); inclinado = el;
    }, { passive: true });
  }
  var inclinado = null;
  function soltarInclinacion() {
    if (!inclinado) return;
    ["--rx", "--ry", "--mx", "--my"].forEach(function (v) { inclinado.style.removeProperty(v); });
    inclinado.classList.remove("inclinado"); inclinado = null;
  }


  /* ================= DISEÑO DEPORTIVO (gran tienda: banner, carruseles, promos) ================= */
  function flecha() { return '<svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'; }
  function botonD(b, claro) {
    return b && b.texto ? '<a class="boton-d' + (claro ? " boton-d--claro" : "") + '" data-ir href="' + esc(destino(b.destino)) + '"><span>' + esc(b.texto) + "</span>" + flecha() + "</a>" : "";
  }
  function vistaInicioDeportivo() {
    var h = CFG.hero || {}, src = TEMA.rutaImagen(h.imagen);
    var foto = src ? fotoSuelta(src, 1600, 1000, "e", h.imagenAlt || "", true) : (primeraConFoto() ? dibujo(primeraConFoto(), "", "", true) : "");
    var titular = h.titular || h.titulo || CFG.marca;
    app.innerHTML =
      '<section class="banner" aria-labelledby="t-banner"><div class="banner__foto">' + foto + "</div>" +
        '<div class="banner__texto"><h1 id="t-banner"><span>' + esc(titular) + '</span></h1><p><span>' + esc(plantilla(h.subtitulo)) + "</span></p>" +
        '<div class="banner__botones">' + botonD(h.boton1) + botonD(h.boton2, true) + "</div></div></section>" +
      (activa("comoComprar") ? seccionBeneficios() : "") +
      (activa("carrusel") ? seccionCarrusel() : "") +
      (activa("promos") ? seccionPromos() : "") +
      (activa("categorias") ? seccionCategorias() : "") +
      (activa("combo") ? seccionUniforme() : "") +
      (activa("vitrina3d") ? seccionVitrina3d() : "") +
      (activa("preguntas") ? seccionPreguntas() : "");
    enlazarCarrusel(); enlazarFavs(app); enlazarUniforme(); enlazarVitrina3d();
  }
  function seccionBeneficios() {
    var filas = lista((CFG.comoComprar || {}).filas).filter(function (f) { return f && f.titulo; }).slice(0, 4);
    if (!filas.length) return "";
    return '<ul class="beneficios" aria-label="Cómo compras">' + filas.map(function (f) {
      return "<li><strong>" + esc(f.titulo) + "</strong>" + (lista(f.puntos)[0] ? "<span>" + esc(plantilla(f.puntos[0])) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  function seccionCarrusel() {
    var conf = CFG.carrusel || {}, cats = visibles();
    if (!cats.length) return "";
    var pest = [{ id: "", nombre: conf.todos || "Todo" }].concat(cats);
    return '<section class="carrusel revela" aria-labelledby="t-carr"><div class="carrusel__cab"><h2 id="t-carr">' + esc(conf.titulo || "Explora la colección") + "</h2>" +
      '<div class="carrusel__pestanas" role="tablist" aria-label="Categoría">' + pest.map(function (c, i) {
        return '<button type="button" role="tab" data-carr="' + esc(c.id) + '" aria-selected="' + (i === 0) + '">' + esc(c.nombre) + "</button>";
      }).join("") + "</div></div>" +
      '<div class="carrusel__marco"><button type="button" class="carrusel__flecha carrusel__flecha--izq" data-mover-carr="-1" aria-label="Anteriores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<div class="carrusel__pista" id="carr-pista" tabindex="0" aria-label="Productos"></div>' +
      '<button type="button" class="carrusel__flecha carrusel__flecha--der" data-mover-carr="1" aria-label="Siguientes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<a class="enlace-d" data-ir href="?ver=tienda" id="carr-todo">' + esc(conf.verTodo || "Ver todo") + "</a></section>";
  }
  function pintarCarrusel(catId) {
    var pista = document.getElementById("carr-pista"); if (!pista) return;
    var ps = cat.productos.filter(function (p) { return (!catId || p.cat === catId) && (categoria(p.cat) || {}).visible; }).slice(0, 12);
    pista.innerHTML = ps.map(tarjeta).join("");
    pista.scrollLeft = 0; enlazarFavs(pista);
    document.getElementById("carr-todo").setAttribute("href", "?ver=tienda" + (catId ? "&cat=" + encodeURIComponent(catId) : ""));
  }
  function enlazarCarrusel() {
    var pista = document.getElementById("carr-pista"); if (!pista) return;
    pintarCarrusel("");
    app.querySelectorAll("[data-carr]").forEach(function (b) {
      b.addEventListener("click", function () {
        app.querySelectorAll("[data-carr]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        pintarCarrusel(b.dataset.carr);
      });
    });
    app.querySelectorAll("[data-mover-carr]").forEach(function (b) {
      b.addEventListener("click", function () { pista.scrollBy({ left: +b.dataset.moverCarr * pista.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
    });
  }
  function seccionPromos() {
    var conf = CFG.promos || {}, items = lista(conf.lista).filter(function (x) { return x && x.titulo; }).slice(0, 4);
    if (!items.length) return "";
    return '<section class="promos revela" aria-labelledby="t-promos">' + (conf.titulo ? '<h2 id="t-promos">' + esc(conf.titulo) + "</h2>" : '<h2 id="t-promos" class="oculto">Destacados</h2>') +
      '<div class="promos__rejilla">' + items.map(function (x) {
        var en = x.enlace || {};
        return '<a class="promo" data-ir href="' + esc(destino(en.destino)) + '"><span class="promo__foto" aria-hidden="true">' + fotoRef(x.foto, "") + "</span>" +
          '<span class="promo__texto"><strong>' + esc(x.titulo) + "</strong>" + (x.texto ? "<span>" + esc(plantilla(x.texto)) + "</span>" : "") +
          '<span class="enlace-d">' + esc(en.texto || "Comprar") + "</span></span></a>";
      }).join("") + "</div></section>";
  }
  function pieDeportivo() {
    var c = CFG.contacto || {}, pc = CFG.pie || {}, cr = pc.creditos || {}, b = CFG.franja || {};
    var col = function (t, links) { return '<div class="pie-d__col"><h2>' + esc(t) + "</h2><ul>" + links.join("") + "</ul></div>"; };
    var li = function (href, txt, ext) { return "<li><a " + (ext ? 'href="' + esc(href) + '" target="_blank" rel="noopener"' : 'data-ir href="' + esc(href) + '"') + ">" + esc(txt) + "</a></li>"; };
    return '<div class="franja"><p class="franja__texto">' + esc(plantilla(b.texto || c.frase || "Escríbenos por WhatsApp.")) + "</p>" +
        '<a class="boton-d" href="' + esc(waLink(plantilla((CFG.mensajes || {}).consulta))) + '" target="_blank" rel="noopener"><span>' + esc(b.boton || "Escríbenos") + "</span>" + flecha() + "</a></div>" +
      '<div class="pie-d">' +
        col("Tienda", visibles().map(function (x) { return li("?ver=tienda&cat=" + x.id, x.nombre); }).concat([li("?ver=tienda", "Toda la tienda")])) +
        col("Ayuda", [li("?ver=carrito", "Mi carrito"), li("?ver=favoritos", "Favoritos"), li("?ver=reclamaciones", "Libro de Reclamaciones"), li("?ver=privacidad", "Política de privacidad")]) +
        col("Contacto", [li(waLink(plantilla((CFG.mensajes || {}).consulta)), "WhatsApp " + telVisible(), true)].concat(
          [["Facebook", CFG.facebook], ["Instagram", CFG.instagram], ["TikTok", CFG.tiktok]].filter(function (r) { return /^https:\/\//.test(r[1] || ""); }).map(function (r) { return li(r[1], r[0], true); }))) +
        '<div class="pie-d__marca"><p class="pie-d__nombre">' + esc(CFG.marca) + "</p>" + (c.pie ? "<p>" + esc(plantilla(c.pie)) + "</p>" : "") + "</div>" +
        '<p class="pie-d__legal">© ' + new Date().getFullYear() + " " + esc(CFG.marca) + ". " + esc(pc.nota || "") +
        (cr.texto ? " " + (/^https:\/\//.test(cr.url || "") ? '<a href="' + esc(cr.url) + '" target="_blank" rel="noopener">' + esc(cr.texto) + "</a>" : esc(cr.texto)) : "") + "</p>" +
      "</div>";
  }

  /* ---------- arranque ---------- */
  /* Vista previa del editor: recibe borradores desde admin.html (mismo origen) y vuelve a pintar */
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || e.source !== window.parent || window.parent === window) return;
    var d = e.data || {};
    if (d.tipo !== "da-vista-previa") return;
    if (d.config) { CFG = TEMA.completar(window.DA_CONFIG, d.config); fmt = formateador(); }
    if (d.catalogo && Array.isArray(d.catalogo.productos)) cat = sinOcultos(d.catalogo);
    if (d.ir) estado.ruta = parsear(d.ir);
    cabeceraContenido(); contarCarrito(); pintar();
  });

  function sinOcultos(c) {
    var copia = Object.assign({}, c); copia.productos = (c.productos || []).filter(function (p) { return p && !p.oculto && p.id; });
    copia.colores = c.colores || {}; copia.categorias = (c.categorias || []).map(function (x) { return Object.assign({ sub: [] }, x); });
    return copia;
  }
  async function iniciar() {
    var remoto = await DATOS.cargarAjustes();
    if (remoto) CFG = TEMA.completar(window.DA_CONFIG, remoto);
    fmt = formateador();
    cat = sinOcultos(await DATOS.cargar());
    estado.carrito = limpiarCarrito(leer("da_carrito", []));
    estado.favs = (leer("da_favs", []) || []).filter(function (id) { return typeof id === "string" && prod(id); });
    cabecera(); contarCarrito(); activarInclinacion();
    estado.ruta = parsear(location.search);
    pintar();
  }
  function pie() {
    if (deportivo()) return pieDeportivo();
    var pc = CFG.pie || {}, foto = fotoRef(pc.foto, "") || (primeraConFoto() ? dibujo(primeraConFoto(), "", "") : ""), cr = pc.creditos || {};
    return '<div class="pie__placa" aria-hidden="true">' + foto + "</div>" +
      '<div class="pie__menu"><p class="pie__marca">' + esc(CFG.marca) + '</p><nav aria-label="Pie de página"><a data-ir href="?ver=inicio">Inicio</a>' +
      visibles().map(function (c) { return '<a data-ir href="?ver=tienda&cat=' + esc(c.id) + '">' + esc(c.nombre) + "</a>"; }).join("") +
      '<a data-ir href="?ver=favoritos">Favoritos</a><a data-ir href="?ver=carrito">Carrito</a></nav>' +
      '<div class="pie__legales"><a data-ir class="pie__libro" href="?ver=reclamaciones"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>Libro de Reclamaciones</a><a data-ir href="?ver=privacidad">Política de privacidad</a></div>' +
      '<div class="pie__datos"><p>WhatsApp ' + esc(telVisible()) + (CFG.contacto && CFG.contacto.pie ? "<br>" + esc(plantilla(CFG.contacto.pie)) : "") + '</p><p class="pie__redes">' + redes() + "</p></div>" +
      '<p class="pie__legal">© ' + new Date().getFullYear() + " " + esc(CFG.marca) + ". " + esc(pc.nota || "") +
      (cr.texto ? ' <span class="pie__creditos">' + (/^https:\/\//.test(cr.url || "") ? '<a href="' + esc(cr.url) + '" target="_blank" rel="noopener">' + esc(cr.texto) + "</a>" : esc(cr.texto)) + "</span>" : "") + "</p></div>";
  }
  iniciar();
})();
