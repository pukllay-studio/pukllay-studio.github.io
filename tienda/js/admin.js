/* Editor visual de la tienda (plantilla). Sin dependencias.
   Modo local: los cambios se ven en la vista previa y se descargan como archivos (config.js, catalogo.js, imágenes).
   Modo conectado (Supabase en config.js): inicio de sesión de administrador y guardado directo en la base de datos.
   Seguridad: todo texto se escapa al pintar; la sesión vive solo en memoria; el servidor valida y exige rol admin. */
(function () {
  "use strict";
  var T = window.DA_TEMA, ZIP = window.DA_ZIP;
  var BASE_CFG = clon(window.DA_CONFIG), BASE_CAT = clon(window.DA_CATALOGO);
  var SB = BASE_CFG.supabase || {};
  var REMOTO = !!(SB.url && SB.anonKey && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SB.url.replace(/\/$/, "")));
  var CLAVE = "da_editor_borrador";
  var B = null, sesion = null, seccion = "marca", prodSel = 0, catSel = 0, sucio = false, rutaPrevia = "?ver=inicio";
  var panel = document.getElementById("ed-panel"), iframe = document.getElementById("ed-iframe");

  var SECCIONES = [
    ["marca", "Marca y colores"], ["portada", "Portada"], ["secciones", "Secciones de inicio"], ["productos", "Productos"],
    ["categorias", "Categorías y colores"], ["contacto", "Contacto y legal"], ["publicar", "Guardar y publicar"]
  ];
  var PALETAS = {
    "Deportivo blanco y negro": { fondo: "#ffffff", papel: "#ffffff", placa: "#eceff1", tinta: "#000000", suave: "#565656", acento: "#000000", oscuro: "#1b1b1b", destacado: "#f6c3d1" },
    "Vino ballet": { fondo: "#efedea", papel: "#faf8f5", placa: "#f3f0eb", tinta: "#1b1917", suave: "#5a534c", acento: "#8c3a49", oscuro: "#2b2422", destacado: "#e9c7cd" },
    "Boutique negra": { fondo: "#f4f4f2", papel: "#ffffff", placa: "#ecebe8", tinta: "#111111", suave: "#55524d", acento: "#111111", oscuro: "#151515" },
    "Natural oliva": { fondo: "#eeebe3", papel: "#f8f6f0", placa: "#e7e3d8", tinta: "#23261d", suave: "#575a4c", acento: "#4f6238", oscuro: "#2c3324" },
    "Infantil coral": { fondo: "#fbf3ee", papel: "#fffaf6", placa: "#f6e9e1", tinta: "#2a1d1a", suave: "#6a5550", acento: "#c4493b", oscuro: "#3a2420" },
    "Deportivo azul": { fondo: "#eef1f4", papel: "#fbfcfd", placa: "#e5e9ee", tinta: "#121a24", suave: "#4e5a68", acento: "#1f4fa8", oscuro: "#152033" },
    "Joyería esmeralda": { fondo: "#f1efe9", papel: "#fbfaf6", placa: "#e9e6dd", tinta: "#16201c", suave: "#4d5752", acento: "#1f6b52", oscuro: "#14261f" }
  };
  var DESTINOS = [["?ver=tienda", "Toda la tienda"], ["?ver=carrito", "Carrito"], ["?ver=favoritos", "Favoritos"]];
  var MONEDAS = ["PEN", "USD", "EUR", "MXN", "COP", "CLP", "ARS", "BOB"];

  /* ---------- utilidades ---------- */
  function clon(o) { return JSON.parse(JSON.stringify(o == null ? null : o)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function get(o, ruta) { return ruta.split(".").reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
  function set(o, ruta, v) {
    var ks = ruta.split("."), ult = ks.pop(), a = o;
    ks.forEach(function (k, i) { if (a[k] == null || typeof a[k] !== "object") a[k] = /^\d+$/.test(ks[i + 1] || ult) ? [] : {}; a = a[k]; });
    a[ult] = v;
  }
  function slug(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "item"; }
  function unico(base, existe) { var s = base, n = 2; while (existe(s)) s = base + "-" + n++; return s; }
  var tEstado = 0;
  function estado(msg) { var e = document.getElementById("ed-estado"); e.textContent = msg; clearTimeout(tEstado); tEstado = setTimeout(function () { e.textContent = sucio ? "Cambios sin guardar" : ""; }, 3500); }
  function aviso(msg) { var a = document.getElementById("ed-aviso"); a.textContent = msg; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.hidden = true; }, 6000); }
  function productos() { return B.catalogo.productos; }
  function prodActual() { return productos()[prodSel]; }

  /* ---------- borrador ---------- */
  function guardarBorrador() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ config: B.config, catalogo: B.catalogo, fecha: Date.now() })); }
    catch (e) { estado("El borrador es muy grande para guardarlo en este navegador. Descarga o guarda pronto."); }
  }
  function leerBorrador() { try { var b = JSON.parse(localStorage.getItem(CLAVE) || "null"); return b && b.config && b.catalogo ? b : null; } catch (e) { return null; } }
  function cambio(rutaVista) {
    sucio = true; document.getElementById("ed-estado").textContent = "Cambios sin guardar";
    if (rutaVista) rutaPrevia = rutaVista;
    guardarBorrador(); enviarVista();
  }

  /* ---------- vista previa ---------- */
  var tVista = 0;
  function enviarVista(inmediato) {
    clearTimeout(tVista);
    tVista = setTimeout(function () {
      try { iframe.contentWindow.postMessage({ tipo: "da-vista-previa", config: B.config, catalogo: B.catalogo, ir: rutaPrevia }, location.origin); } catch (e) { /* aún cargando */ }
    }, inmediato ? 0 : 220);
  }
  iframe.addEventListener("load", function () { enviarVista(true); });
  document.querySelectorAll("[data-ancho]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-ancho]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      document.getElementById("ed-marco").classList.toggle("es-celular", b.dataset.ancho === "celular");
    });
  });

  /* ---------- campos ---------- */
  var nId = 0;
  function id() { return "c" + (++nId); }
  function ayuda(t) { return t ? '<p class="ed-ayuda">' + esc(t) + "</p>" : ""; }
  function fTexto(ruta, etq, o) {
    o = o || {}; var i = id(), v = get(B.config, ruta);
    var ctl = o.multi ? '<textarea id="' + i + '" data-ruta="' + ruta + '" rows="' + (o.filas || 3) + '" maxlength="' + (o.max || 600) + '">' + esc(v) + "</textarea>"
      : '<input id="' + i + '" data-ruta="' + ruta + '" type="' + (o.tipo || "text") + '" maxlength="' + (o.max || 160) + '" value="' + esc(v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ">";
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + "</label>" + ctl + ayuda(o.ayuda) + "</div>";
  }
  function fColor(ruta, etq, txt) {
    var i = id(), v = T.hex(get(B.config, ruta), "#000000");
    return '<div class="ed-color"><input id="' + i + '" type="color" data-ruta="' + ruta + '" value="' + v + '"><label for="' + i + '"><strong>' + esc(etq) + "</strong><span>" + esc(txt) + "</span></label></div>";
  }
  function fSelect(ruta, etq, ops, o) {
    var i = id(), v = get(B.config, ruta);
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + '</label><select id="' + i + '" data-ruta="' + ruta + '">' +
      ops.map(function (op) { return '<option value="' + esc(op[0]) + '"' + (String(op[0]) === String(v == null ? "" : v) ? " selected" : "") + ">" + esc(op[1]) + "</option>"; }).join("") + "</select>" + ayuda((o || {}).ayuda) + "</div>";
  }
  function fBool(ruta, etq, o) {
    var v = get(B.config, ruta);
    return '<label class="ed-interruptor"><input type="checkbox" data-ruta="' + ruta + '" data-tipo="bool"' + (v !== false && v != null ? " checked" : "") + "><span>" + esc(etq) + "</span></label>" + ayuda((o || {}).ayuda);
  }
  function fComas(ruta, etq, o) {
    var i = id(), v = get(B.config, ruta);
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + '</label><input id="' + i + '" data-ruta="' + ruta + '" data-tipo="' + ((o || {}).numeros ? "numeros" : "comas") + '" value="' + esc((v || []).join(", ")) + '">' + ayuda((o || {}).ayuda || "Separa con comas.") + "</div>";
  }
  function fLineas(ruta, etq, o) {
    var i = id(), v = get(B.config, ruta);
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + '</label><textarea id="' + i + '" data-ruta="' + ruta + '" data-tipo="lineas" rows="' + ((o || {}).filas || 3) + '">' + esc((v || []).join("\n")) + "</textarea>" + ayuda((o || {}).ayuda || "Uno por línea.") + "</div>";
  }
  function fDestino(ruta, etq) {
    var ops = DESTINOS.concat(B.catalogo.categorias.filter(function (c) { return c.visible; }).map(function (c) { return ["?ver=tienda&cat=" + c.id, "Categoría: " + c.nombre]; }));
    var v = get(B.config, ruta); if (v && !ops.some(function (o) { return o[0] === v; })) ops.push([v, v]);
    return fSelect(ruta, etq, ops);
  }
  function miniatura(src) { var s = T.rutaImagen(src); return s ? '<img src="' + esc(s) + '" alt="">' : '<span class="ed-sin-foto">Sin imagen</span>'; }
  function fImagen(ruta, etq, o) {
    var i = id(), v = get(B.config, ruta);
    return '<div class="ed-campo"><span class="ed-etq">' + esc(etq) + '</span><div class="ed-imagen"><div class="ed-imagen__mini">' + miniatura(v) + '</div><div class="ed-imagen__acc">' +
      '<label class="ed-boton ed-boton--claro" for="' + i + '">Subir imagen</label><input class="ed-oculto" id="' + i + '" type="file" accept="image/jpeg,image/png,image/webp" data-imagen="' + ruta + '">' +
      (v ? '<button type="button" class="ed-enlace" data-quitar-imagen="' + ruta + '">Quitar</button>' : "") + "</div></div>" + ayuda((o || {}).ayuda) + "</div>";
  }
  function refsDisponibles() {
    var out = [];
    productos().forEach(function (p) {
      if (!(p.fotos || []).length) return;
      var colores = [""].concat((p.fotos || []).map(function (f) { return f.color; }).filter(Boolean));
      colores.filter(function (c, i) { return colores.indexOf(c) === i; }).forEach(function (c) { out.push([p.id + (c ? ":" + c : ""), p.nombre + (c ? " · " + c : "")]); });
    });
    return out;
  }
  function fRefFoto(ruta, etq, o) {
    var ops = [["", "Ninguna"]].concat(refsDisponibles()), v = get(B.config, ruta);
    if (v && !ops.some(function (x) { return x[0] === v; })) ops.push([v, T.rutaImagen(v) ? "Imagen subida" : v]);
    return fSelect(ruta, etq, ops, o);
  }
  function fMarcas(ruta, etq, ops, o) { // casillas múltiples → arreglo
    var v = get(B.config, ruta) || [];
    return '<fieldset class="ed-campo ed-marcas"><legend>' + esc(etq) + '</legend><div class="ed-marcas__lista">' + ops.map(function (op) {
      return '<label><input type="checkbox" data-marca="' + ruta + '" value="' + esc(op[0]) + '"' + (v.indexOf(op[0]) >= 0 ? " checked" : "") + "><span>" + esc(op[1]) + "</span></label>";
    }).join("") + "</div>" + ayuda((o || {}).ayuda) + "</fieldset>";
  }
  /* Lista de objetos (preguntas, filas, datos, piezas...) */
  function fObjetos(ruta, etq, plantillaNueva, pintarItem, o) {
    var arr = get(B.config, ruta) || [];
    return '<div class="ed-lista"><div class="ed-lista__cab"><span class="ed-etq">' + esc(etq) + '</span><button type="button" class="ed-enlace" data-agregar="' + ruta + '" data-nuevo="' + esc(JSON.stringify(plantillaNueva)) + '"' + ((o || {}).max && arr.length >= o.max ? " disabled" : "") + ">Agregar</button></div>" +
      arr.map(function (it, i) {
        return '<div class="ed-item"><div class="ed-item__cuerpo">' + pintarItem(ruta + "." + i, it, i) + '</div><div class="ed-item__acc">' +
          '<button type="button" data-mover="' + ruta + '" data-i="' + i + '" data-d="-1" aria-label="Subir"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
          '<button type="button" data-mover="' + ruta + '" data-i="' + i + '" data-d="1" aria-label="Bajar"' + (i === arr.length - 1 ? " disabled" : "") + ">↓</button>" +
          '<button type="button" data-borrar="' + ruta + '" data-i="' + i + '" aria-label="Quitar">✕</button></div></div>';
      }).join("") + (arr.length ? "" : '<p class="ed-ayuda">Todavía no hay elementos.</p>') + "</div>";
  }
  function grupo(titulo, contenido, abierto, ayudaTxt) {
    return '<details class="ed-grupo"' + (abierto ? " open" : "") + "><summary>" + esc(titulo) + "</summary>" + ayuda(ayudaTxt) + '<div class="ed-grupo__cuerpo">' + contenido + "</div></details>";
  }

  /* ---------- orden de la portada ---------- */
  var NOMBRES_ORDEN = { comoComprar: "Así compras / beneficios", categorias: "Categorías", carrusel: "Carrusel", combo: "Arma tu combo",
    promos: "Destacados", vitrina3d: "Vitrina que gira", preguntas: "Dudas comunes", contacto: "Contacto" };
  var SOLO = { carrusel: "deportivo", promos: "deportivo", contacto: "editorial" };
  function ordenCompleto() {
    var o = [], base = Object.keys(NOMBRES_ORDEN);
    (Array.isArray(B.config.orden) ? B.config.orden : []).concat(base).forEach(function (k) { if (base.indexOf(k) >= 0 && o.indexOf(k) < 0) o.push(k); });
    return (B.config.orden = o);
  }
  function ordenVisible() {
    var estilo = B.config.tema.estilo === "deportivo" ? "deportivo" : "editorial";
    return ordenCompleto().filter(function (k) { return !SOLO[k] || SOLO[k] === estilo; });
  }
  function fOrden() {
    var vis = ordenVisible();
    return '<ol class="ed-orden">' + vis.map(function (k, i) {
      var oculta = (B.config.secciones || {})[k] === false;
      return '<li class="ed-orden__item' + (oculta ? " es-oculta" : "") + '"><span class="ed-orden__n">' + (i + 1) + '</span><span class="ed-orden__nombre">' + esc(NOMBRES_ORDEN[k]) + (oculta ? " <em>(oculta)</em>" : "") + "</span>" +
        '<button type="button" data-orden="' + k + '" data-d="-1" aria-label="Subir ' + esc(NOMBRES_ORDEN[k]) + '"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
        '<button type="button" data-orden="' + k + '" data-d="1" aria-label="Bajar ' + esc(NOMBRES_ORDEN[k]) + '"' + (i === vis.length - 1 ? " disabled" : "") + ">↓</button></li>";
    }).join("") + "</ol>";
  }
  function moverOrden(k, d) {
    var vis = ordenVisible(), i = vis.indexOf(k), j = i + d; if (i < 0 || j < 0 || j >= vis.length) return;
    var o = B.config.orden, a = o.indexOf(k), b = o.indexOf(vis[j]); o[a] = vis[j]; o[b] = k;
  }

  /* ---------- secciones del editor ---------- */
  function pintarMenu() {
    document.getElementById("ed-menu").innerHTML = SECCIONES.map(function (s) {
      return '<button type="button" data-seccion="' + s[0] + '"' + (s[0] === seccion ? ' aria-current="page"' : "") + ">" + esc(s[1]) + "</button>";
    }).join("");
    document.getElementById("ed-nombre").textContent = B.config.marca || "Editor";
  }
  function pintar() {
    pintarMenu();
    var f = { marca: pMarca, portada: pPortada, secciones: pSecciones, productos: pProductos, categorias: pCategorias, contacto: pContacto, publicar: pPublicar }[seccion];
    var y = panel.scrollTop, mismo = panel.dataset.seccion === seccion;
    var abiertos = mismo ? [].map.call(panel.querySelectorAll("details.ed-grupo"), function (d) { return d.open; }) : null;
    panel.innerHTML = f(); panel.dataset.seccion = seccion;
    if (abiertos) panel.querySelectorAll("details.ed-grupo").forEach(function (d, i) { if (i < abiertos.length) d.open = abiertos[i]; });
    panel.scrollTop = mismo ? y : 0;
  }

  function pMarca() {
    var t = B.config.tema || {};
    var c1 = T.contraste(T.hex(t.tinta, "#000000"), T.hex(t.fondo, "#ffffff")), c2 = T.contraste(T.hex(t.acento, "#000000"), "#ffffff"), c3 = T.contraste(T.hex(t.suave, "#000000"), T.hex(t.fondo, "#ffffff"));
    var alerta = (c1 < 4.5 ? "<li>El texto se lee poco sobre el fondo (" + c1.toFixed(1) + ":1). Usa un texto más oscuro o un fondo más claro.</li>" : "") +
      (c3 < 4.5 ? "<li>El texto secundario se lee poco (" + c3.toFixed(1) + ":1).</li>" : "") +
      (c2 < 3 ? "<li>El acento es muy claro para botones; el texto del botón se pondrá oscuro automáticamente.</li>" : "");
    return '<h1>Marca y colores</h1>' +
      fSelect("tema.estilo", "Diseño de la tienda", [["deportivo", "Deportivo (gran tienda: banner, carruseles)"], ["editorial", "Editorial (boutique: foto fija, vitrina de colores)"]],
        { ayuda: "Cambia la estructura de la portada y el estilo de toda la tienda." }) +
      fTexto("marca", "Nombre del negocio", { max: 40 }) +
      fImagen("tema.logo", "Logo", { ayuda: "PNG o WebP con fondo transparente. Se ve a 40 px de alto." }) +
      fBool("tema.nombreConLogo", "Mostrar el nombre al lado del logo") +
      '<h2>Paletas listas</h2><div class="ed-paletas">' + Object.keys(PALETAS).map(function (n) {
        var p = PALETAS[n];
        return '<button type="button" class="ed-paleta" data-paleta="' + esc(n) + '"><span class="ed-paleta__muestras">' + ["fondo", "tinta", "acento", "oscuro"].map(function (k) { return '<i data-bg="' + p[k] + '"></i>'; }).join("") + "</span>" + esc(n) + "</button>";
      }).join("") + "</div>" +
      '<h2>Colores</h2><div class="ed-colores">' +
        fColor("tema.fondo", "Fondo", "Color general de la página") + fColor("tema.papel", "Papel", "Hojas, campos y tarjetas") +
        fColor("tema.placa", "Fondo de fotos", "Detrás de cada producto") + fColor("tema.tinta", "Texto", "Títulos y párrafos") +
        fColor("tema.suave", "Texto secundario", "Notas y datos pequeños") + fColor("tema.acento", "Acento", "Botones y precios destacados") +
        fColor("tema.oscuro", "Sección oscura", "Vitrina 3D, pie de página") + fColor("tema.destacado", "Color destacado", "Franja final (diseño deportivo)") + "</div>" +
      (alerta ? '<ul class="ed-alerta">' + alerta + "</ul>" : '<p class="ed-ok">Los colores tienen buen contraste.</p>') +
      '<h2>Tipografía</h2>' +
      fSelect("tema.fuenteTitulos", "Títulos", Object.keys(T.FUENTES.titulos).map(function (k) { return [k, k]; })) +
      fSelect("tema.fuenteTexto", "Texto", Object.keys(T.FUENTES.texto).map(function (k) { return [k, k]; }));
  }
  function pPortada() {
    return '<h1>Portada</h1>' +
      (B.config.tema.estilo === "deportivo" ? fTexto("hero.titular", "Titular del banner", { max: 40, ayuda: "Frase corta y fuerte, se muestra en mayúsculas. Ej.: Hecho para bailar." })
        : fTexto("hero.titulo", "Nombre grande", { max: 24, ayuda: "Se ve enorme en la portada. Mejor corto (hasta 10 letras)." })) +
      fTexto("hero.subtitulo", "Frase principal", { multi: true, max: 160, ayuda: "Qué vendes y para quién, en una frase." }) +
      '<div class="ed-fila">' + fTexto("hero.boton1.texto", "Botón principal", { max: 30 }) + fDestino("hero.boton1.destino", "Lleva a") + "</div>" +
      '<div class="ed-fila">' + fTexto("hero.boton2.texto", "Enlace secundario", { max: 40 }) + fDestino("hero.boton2.destino", "Lleva a") + "</div>" +
      fImagen("hero.imagen", "Foto de portada", { ayuda: "Foto vertical o cuadrada de buena calidad. Se recorta para llenar el espacio." }) +
      fTexto("hero.imagenAlt", "Descripción de la foto", { max: 120, ayuda: "Para lectores de pantalla y Google." }) +
      fObjetos("hero.datos", "Datos destacados (máximo 3)", { etiqueta: "", valor: "" }, function (r) {
        return '<div class="ed-fila">' + fTexto(r + ".etiqueta", "Etiqueta", { max: 20 }) + fTexto(r + ".valor", "Valor", { max: 60, ayuda: "Puedes usar {precioMinimo}." }) + "</div>";
      }, { max: 3 }) +
      fLineas("anuncios", "Barra de anuncios", { ayuda: "Una frase por línea. Solo promesas que cumples hoy." });
  }
  function pSecciones() {
    var cats = B.catalogo.categorias.filter(function (c) { return c.visible; });
    var conPrecio = productos().filter(function (p) { return p.precio != null; }).map(function (p) { return [p.id, p.nombre]; });
    var dep = B.config.tema.estilo === "deportivo";
    var gruposDep = grupo("Carrusel de productos", fBool("secciones.carrusel", "Mostrar") + fTexto("carrusel.titulo", "Título") + '<div class="ed-fila">' + fTexto("carrusel.todos", "Pestaña “todo”") + fTexto("carrusel.verTodo", "Enlace final") + "</div>", true,
        "Muestra los productos con pestañas por categoría.") +
      grupo("Destacados con foto", fBool("secciones.promos", "Mostrar") + fTexto("promos.titulo", "Título (opcional)") +
        fObjetos("promos.lista", "Bloques (hasta 4)", { titulo: "", texto: "", foto: "", enlace: { texto: "Comprar", destino: "?ver=tienda" } }, function (r) {
          return fTexto(r + ".titulo", "Título", { max: 40 }) + fTexto(r + ".texto", "Texto", { max: 90 }) + fRefFoto(r + ".foto", "Foto") +
            '<div class="ed-fila">' + fTexto(r + ".enlace.texto", "Texto del enlace", { max: 20 }) + fDestino(r + ".enlace.destino", "Lleva a") + "</div>";
        }, { max: 4 })) +
      grupo("Franja final", fTexto("franja.texto", "Frase", { multi: true, max: 120 }) + fTexto("franja.boton", "Botón de WhatsApp", { max: 30 }));
    return '<h1>Secciones de inicio</h1><p class="ed-ayuda">Activa solo lo que el negocio necesita. Cada sección se puede ocultar.' + (dep ? " En el diseño deportivo “Así compras” se muestra como franja de beneficios." : "") + "</p>" +
      grupo("Orden de la portada", fOrden(), true, "De arriba hacia abajo, después de la portada. El pie de página siempre va al final.") +
      (dep ? gruposDep : "") +
      (dep ? "" : grupo("Elige modelo y color", fBool("secciones.vitrina", "Mostrar") + fTexto("vitrina.titulo", "Título") +
        fMarcas("vitrina.productos", "Productos (hasta 4)", productos().filter(function (p) { return p.colores.length; }).map(function (p) { return [p.id, p.nombre]; })) +
        '<div class="ed-fila">' + fTexto("vitrina.enlace.texto", "Texto del enlace") + fDestino("vitrina.enlace.destino", "Lleva a") + "</div>", true) +
      grupo("Lista de precios", fBool("secciones.listaPrecios", "Mostrar") + fTexto("listaPrecios.titulo", "Título") + fTexto("listaPrecios.nota", "Nota") +
        fRefFoto("listaPrecios.foto", "Foto que acompaña") + fTexto("listaPrecios.fotoTexto", "Texto de la foto"))) +
      grupo("Vitrina 3D giratoria", fBool("secciones.vitrina3d", "Mostrar") + fTexto("vitrina3d.titulo", "Título") + fTexto("vitrina3d.texto", "Texto") +
        fMarcas("vitrina3d.productos", "Fotos que giran (5 a 10)", refsDisponibles(), { ayuda: "Funciona mejor con fotos sin fondo." })) +
      grupo("Compra por categoría", fBool("secciones.categorias", "Mostrar") + fTexto("categorias.titulo", "Título") +
        cats.map(function (c) { return fRefFoto("categorias.portadas." + c.id, "Foto de " + c.nombre); }).join("")) +
      grupo("Combo (uniforme, pack o kit)", fBool("secciones.combo", "Mostrar") + fTexto("combo.titulo", "Título") + fTexto("combo.intro", "Texto", { multi: true }) +
        fRefFoto("combo.foto", "Foto") + fTexto("combo.etiquetaTalla", "Pregunta de talla") + fComas("combo.tallas", "Tallas que se pueden elegir") +
        fObjetos("combo.piezas", "Prendas del combo", { nombre: "", productos: [], opcional: true, color: "" }, function (r, it) {
          return fTexto(r + ".nombre", "Nombre", { max: 40 }) +
            fMarcas(r + ".productos", "Producto o modelos", conPrecio, { ayuda: "Si marcas varios, el cliente elige el modelo." }) +
            fBool(r + ".opcional", "El cliente puede quitarla") +
            '<div class="ed-campo"><label for="eq' + r.replace(/\./g, "") + '">Equivalencia de tallas (opcional)</label><input id="eq' + r.replace(/\./g, "") + '" data-ruta="' + r + '.equivalencias" data-tipo="equiv" value="' +
            esc(Object.keys(it.equivalencias || {}).map(function (k) { return k + "=" + it.equivalencias[k]; }).join(", ")) + '"><p class="ed-ayuda">Ej.: 4=4-6, 6=4-6, 8=8-10. Vacío = usa la misma talla.</p></div>';
        }) + fTexto("combo.nota", "Nota al pie") + '<div class="ed-fila">' + fTexto("combo.notaEnlace.texto", "Texto del enlace") + fDestino("combo.notaEnlace.destino", "Lleva a") + "</div>") +
      grupo("Así compras", fBool("secciones.comoComprar", "Mostrar") + fTexto("comoComprar.titulo", "Título") +
        fObjetos("comoComprar.filas", "Pasos", { titulo: "", foto: "", puntos: [] }, function (r) { return fTexto(r + ".titulo", "Título") + fRefFoto(r + ".foto", "Foto") + fLineas(r + ".puntos", "Puntos"); }, { max: 6 })) +
      grupo("Preguntas frecuentes", fBool("secciones.preguntas", "Mostrar") + fTexto("preguntas.titulo", "Título") +
        fObjetos("preguntas.lista", "Preguntas", { p: "", r: "" }, function (r) { return fTexto(r + ".p", "Pregunta", { max: 120 }) + fTexto(r + ".r", "Respuesta", { multi: true, max: 600, ayuda: "Puedes usar {pago}, {envio} o {cambios}." }); })) +
      (dep ? "" : grupo("Contacto", fBool("secciones.contacto", "Mostrar") + fTexto("contacto.frase", "Frase", { multi: true }) + fTexto("contacto.pie", "Texto pequeño"))) +
      grupo("Pie de página", fRefFoto("pie.foto", "Foto") + fTexto("pie.nota", "Nota legal") + '<div class="ed-fila">' + fTexto("pie.creditos.texto", "Créditos") + fTexto("pie.creditos.url", "Enlace de créditos", { ph: "https://" }) + "</div>");
  }

  /* ---------- productos ---------- */
  function pProductos() {
    var ps = productos(); if (prodSel >= ps.length) prodSel = Math.max(0, ps.length - 1);
    var p = ps[prodSel];
    return '<h1>Productos</h1><div class="ed-maestro"><div class="ed-maestro__lista"><div class="ed-maestro__acc"><button type="button" class="ed-boton" data-accion="nuevo-producto">Nuevo producto</button></div>' +
      '<ul class="ed-items">' + ps.map(function (q, i) {
        var f = (q.fotos || [])[0];
        return '<li><button type="button" data-prod="' + i + '"' + (i === prodSel ? ' aria-current="true"' : "") + '><span class="ed-items__mini">' + miniatura(f && f.src) + "</span><span><strong>" + esc(q.nombre) + "</strong><small>" +
          (q.precio == null ? "A consultar" : esc(q.precio)) + (q.oculto ? " · oculto" : "") + "</small></span></button></li>";
      }).join("") + "</ul></div>" + (p ? formProducto(p) : '<p class="ed-ayuda">Agrega tu primer producto.</p>') + "</div>";
  }
  function pf(campo, etq, o) { // campo de producto
    o = o || {}; var i = id(), p = prodActual(), v = p[campo];
    if (o.comas) v = (v || []).join(", ");
    var ctl = o.multi ? '<textarea id="' + i + '" data-p="' + campo + '" rows="4" maxlength="1200">' + esc(v) + "</textarea>"
      : '<input id="' + i + '" data-p="' + campo + '"' + (o.comas ? ' data-tipo="comas"' : "") + (o.numero ? ' data-tipo="precio" inputmode="decimal"' : "") + ' value="' + esc(v == null ? "" : v) + '"' + (o.solo ? " readonly" : "") + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ">";
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + "</label>" + ctl + ayuda(o.ayuda) + "</div>";
  }
  function formProducto(p) {
    var c = B.catalogo.categorias.find(function (x) { return x.id === p.cat; }) || B.catalogo.categorias[0];
    var colores = Object.keys(B.catalogo.colores);
    return '<div class="ed-maestro__detalle"><div class="ed-detalle__cab"><h2>' + esc(p.nombre) + '</h2><div><button type="button" class="ed-enlace" data-accion="duplicar-producto">Duplicar</button>' +
      '<button type="button" class="ed-enlace ed-enlace--peligro" data-accion="borrar-producto">Eliminar</button></div></div>' +
      pf("nombre", "Nombre") +
      '<div class="ed-fila">' + pf("sku", "Código") + pf("precio", "Precio", { numero: true, ph: "Vacío = a consultar", ayuda: "Solo números, ej. 25 o 25.90" }) + "</div>" +
      '<div class="ed-fila"><div class="ed-campo"><label for="pcat">Categoría</label><select id="pcat" data-p="cat">' + B.catalogo.categorias.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === p.cat ? " selected" : "") + ">" + esc(x.nombre) + "</option>"; }).join("") + "</select></div>" +
      '<div class="ed-campo"><label for="psub">Subcategoría</label><select id="psub" data-p="sub"><option value="">Ninguna</option>' + (c ? c.sub : []).map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === p.sub ? " selected" : "") + ">" + esc(x.nombre) + "</option>"; }).join("") + "</select></div></div>" +
      pf("tallas", "Tallas", { comas: true, ayuda: "Separa con comas, ej. S, M, L. Vacío = talla única o a consultar." }) +
      '<fieldset class="ed-campo ed-marcas"><legend>Colores disponibles</legend><div class="ed-marcas__lista">' + colores.map(function (n) {
        return '<label class="ed-chip"><input type="checkbox" data-pcolor="' + esc(n) + '"' + (p.colores.indexOf(n) >= 0 ? " checked" : "") + '><i data-bg="' + esc(B.catalogo.colores[n]) + '"></i><span>' + esc(n) + "</span></label>";
      }).join("") + '</div><p class="ed-ayuda">Para crear colores nuevos ve a “Categorías y colores”.</p></fieldset>' +
      pf("publico", "Para quién", { comas: true, ayuda: "Opcional, ej. Niña, Adulta. Crea el filtro “Para”." }) +
      pf("material", "Material") + pf("descripcion", "Descripción", { multi: true }) +
      pf("guiaTallas", "Guía de tallas propia (opcional)", { ayuda: "Si está vacía se usa la de la categoría." }) +
      '<label class="ed-interruptor"><input type="checkbox" data-p="oculto" data-tipo="boolp"' + (p.oculto ? " checked" : "") + "><span>Ocultar en la tienda</span></label>" +
      '<h3>Fotos</h3><p class="ed-ayuda">La primera es la principal. Marca el color de cada foto para que cambie al elegir color. Usa fotos sin fondo para que todo el catálogo se vea parejo.</p>' +
      '<div class="ed-fotos">' + (p.fotos || []).map(function (f, i) {
        return '<div class="ed-foto"><div class="ed-foto__mini">' + miniatura(f.src) + "</div>" +
          '<select data-pfoto="' + i + '" data-campo="color" aria-label="Color de la foto ' + (i + 1) + '"><option value="">Sin color</option>' + p.colores.map(function (n) { return '<option value="' + esc(n) + '"' + (f.color === n ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + "</select>" +
          '<select data-pfoto="' + i + '" data-campo="tipo" aria-label="Tipo de la foto ' + (i + 1) + '"><option value="r"' + (f.tipo !== "e" ? " selected" : "") + '>Sin fondo</option><option value="e"' + (f.tipo === "e" ? " selected" : "") + ">Con fondo</option></select>" +
          '<div class="ed-foto__acc"><button type="button" data-moverfoto="' + i + '" data-d="-1" aria-label="Mover antes"' + (i === 0 ? " disabled" : "") + '>←</button><button type="button" data-moverfoto="' + i + '" data-d="1" aria-label="Mover después"' + (i === p.fotos.length - 1 ? " disabled" : "") + '>→</button><button type="button" data-borrarfoto="' + i + '" aria-label="Quitar foto">✕</button></div></div>';
      }).join("") +
      '<label class="ed-foto ed-foto--nueva" for="pfotos"><span>+ Agregar fotos</span><input class="ed-oculto" id="pfotos" type="file" accept="image/jpeg,image/png,image/webp" multiple data-pfotos></label></div></div>';
  }
  function nuevoProducto(base) {
    var ps = productos(), cat0 = (B.catalogo.categorias[0] || {}).id || "general";
    var p = base ? clon(base) : { nombre: "Producto nuevo", cat: cat0, sub: "", dibujo: "", precio: null, tallas: [], publico: [], colores: [], stock: null, fotos: [], descripcion: "" };
    p.nombre = base ? p.nombre + " (copia)" : p.nombre;
    p.id = unico(slug(p.nombre), function (s) { return ps.some(function (q) { return q.id === s; }); });
    p.sku = unico("P-" + slug(p.nombre).toUpperCase().replace(/-/g, "").slice(0, 8), function (s) { return ps.some(function (q) { return q.sku === s; }); });
    p.orden = ps.length + 1; ps.push(p); prodSel = ps.length - 1;
    cambio("?ver=producto&id=" + p.id); pintar();
  }

  /* ---------- categorías y colores ---------- */
  function pCategorias() {
    var cs = B.catalogo.categorias; if (catSel >= cs.length) catSel = 0;
    var c = cs[catSel];
    return '<h1>Categorías y colores</h1><div class="ed-maestro"><div class="ed-maestro__lista"><div class="ed-maestro__acc"><button type="button" class="ed-boton" data-accion="nueva-categoria">Nueva categoría</button></div><ul class="ed-items">' +
      cs.map(function (x, i) {
        var n = productos().filter(function (p) { return p.cat === x.id; }).length;
        return '<li><button type="button" data-catsel="' + i + '"' + (i === catSel ? ' aria-current="true"' : "") + "><span><strong>" + esc(x.nombre) + "</strong><small>" + n + " productos" + (x.visible ? "" : " · oculta") + "</small></span></button></li>";
      }).join("") + "</ul></div>" + (c ? formCategoria(c) : "") + "</div>" +
      '<h2>Colores del catálogo</h2><p class="ed-ayuda">Nombre corto en minúsculas (ej. rosado, verde-agua) y su color.</p><div class="ed-paleta-colores">' +
      Object.keys(B.catalogo.colores).map(function (n) {
        return '<div class="ed-color-item"><input type="color" data-colorcat="' + esc(n) + '" value="' + esc(T.hex(B.catalogo.colores[n], "#cccccc")) + '" aria-label="Color ' + esc(n) + '"><span>' + esc(n) + '</span><button type="button" class="ed-enlace" data-borrarcolor="' + esc(n) + '" aria-label="Quitar ' + esc(n) + '">✕</button></div>';
      }).join("") + '</div><form class="ed-fila ed-nuevo-color" data-form="color"><div class="ed-campo"><label for="nc-n">Nuevo color</label><input id="nc-n" name="n" maxlength="24" placeholder="ej. lavanda"></div><div class="ed-campo"><label for="nc-h">Tono</label><input id="nc-h" name="h" type="color" value="#b9a6dd"></div><button class="ed-boton ed-boton--claro" type="submit">Agregar color</button></form>';
  }
  function cf(campo, etq, o) {
    o = o || {}; var i = id(), c = B.catalogo.categorias[catSel], v = c[campo];
    if (o.bool) return '<label class="ed-interruptor"><input type="checkbox" data-c="' + campo + '" data-tipo="boolp"' + (v ? " checked" : "") + "><span>" + esc(etq) + "</span></label>";
    return '<div class="ed-campo"><label for="' + i + '">' + esc(etq) + "</label>" + (o.multi ? '<textarea id="' + i + '" data-c="' + campo + '" rows="3">' + esc(v) + "</textarea>" : '<input id="' + i + '" data-c="' + campo + '" value="' + esc(v == null ? "" : v) + '">') + ayuda(o.ayuda) + "</div>";
  }
  function formCategoria(c) {
    var n = productos().filter(function (p) { return p.cat === c.id; }).length;
    return '<div class="ed-maestro__detalle"><div class="ed-detalle__cab"><h2>' + esc(c.nombre) + '</h2><div>' +
      '<button type="button" class="ed-enlace" data-movercat="-1"' + (catSel === 0 ? " disabled" : "") + ">Subir</button>" +
      '<button type="button" class="ed-enlace" data-movercat="1"' + (catSel === B.catalogo.categorias.length - 1 ? " disabled" : "") + ">Bajar</button>" +
      '<button type="button" class="ed-enlace ed-enlace--peligro" data-accion="borrar-categoria"' + (n ? ' disabled title="Mueve o elimina sus productos primero"' : "") + ">Eliminar</button></div></div>" +
      cf("nombre", "Nombre") + cf("visible", "Mostrar en la tienda", { bool: true }) + cf("calzado", "Es calzado (filtro de tallas aparte)", { bool: true }) +
      cf("guiaTallas", "Guía de tallas", { multi: true, ayuda: "Se muestra en cada producto de esta categoría." }) +
      '<h3>Subcategorías</h3>' + (c.sub || []).map(function (s, i) {
        return '<div class="ed-item"><div class="ed-item__cuerpo"><div class="ed-fila"><div class="ed-campo"><label for="sn' + i + '">Nombre</label><input id="sn' + i + '" data-sub="' + i + '" data-campo="nombre" value="' + esc(s.nombre) + '"></div>' +
          '<div class="ed-campo"><label for="sa' + i + '">Aviso (opcional)</label><input id="sa' + i + '" data-sub="' + i + '" data-campo="advertencia" value="' + esc(s.advertencia || "") + '"></div></div></div>' +
          '<div class="ed-item__acc"><button type="button" data-borrarsub="' + i + '" aria-label="Quitar subcategoría">✕</button></div></div>';
      }).join("") + '<button type="button" class="ed-enlace" data-accion="nueva-sub">Agregar subcategoría</button></div>';
  }

  /* ---------- contacto y legal ---------- */
  function pContacto() {
    return '<h1>Contacto y legal</h1>' +
      grupo("Contacto", fTexto("whatsapp", "WhatsApp", { ph: "51912345678", ayuda: "Con código de país y sin “+”. Recibe todos los pedidos." }) +
        fTexto("facebook", "Facebook", { ph: "https://facebook.com/..." }) + fTexto("instagram", "Instagram", { ph: "https://instagram.com/..." }) + fTexto("tiktok", "TikTok", { ph: "https://tiktok.com/@..." }), true) +
      grupo("Mensajes de WhatsApp", fTexto("mensajes.consulta", "Consulta general") + fTexto("mensajes.consultaProducto", "Consulta de producto") + fTexto("mensajes.pedido", "Inicio del pedido"), false, "Puedes usar {marca}.") +
      grupo("Envíos, cambios y pago", fTexto("envio", "Envíos", { multi: true }) + fTexto("cambios", "Cambios y devoluciones", { multi: true }) + fTexto("pago", "Pago", { multi: true })) +
      grupo("Datos legales (Libro de Reclamaciones)", fTexto("empresa.razonSocial", "Razón social") + fTexto("empresa.ruc", "RUC", { max: 11 }) + fTexto("empresa.direccion", "Dirección") +
        fTexto("empresa.correo", "Correo", { tipo: "email" }) + fTexto("libroReclamacionesUrl", "Enlace al libro de INDECOPI (opcional)", { ph: "https://" }), false, "Obligatorio en Perú para vender en línea.") +
      grupo("Google y moneda", fTexto("seo.titulo", "Título para Google", { max: 70 }) + fTexto("seo.descripcion", "Descripción para Google", { multi: true, max: 170 }) +
        '<div class="ed-fila">' + fSelect("moneda", "Moneda", MONEDAS.map(function (m) { return [m, m]; })) + fComas("rangosPrecio", "Rangos del filtro de precio", { numeros: true, ayuda: "Dos números, ej. 20, 50" }) + "</div>");
  }

  /* ---------- guardar y publicar ---------- */
  function pPublicar() {
    var conectado = REMOTO ? (sesion ? '<p class="ed-ok">Sesión iniciada como ' + esc(sesion.email) + '.</p><div class="ed-fila"><button type="button" class="ed-boton" data-accion="guardar-remoto">Guardar en la tienda</button><button type="button" class="ed-enlace" data-accion="salir">Cerrar sesión</button></div>'
      : '<form class="ed-login" data-form="login"><h3>Iniciar sesión de administrador</h3><div class="ed-campo"><label for="lg-c">Correo</label><input id="lg-c" name="correo" type="email" autocomplete="username" required></div>' +
        '<div class="ed-campo"><label for="lg-p">Contraseña</label><input id="lg-p" name="clave" type="password" autocomplete="current-password" required minlength="8"></div><button type="submit" class="ed-boton">Entrar</button></form>')
      : '<p class="ed-ayuda">Esta tienda no está conectada a una base de datos. Los cambios se guardan como archivos: descárgalos y súbelos a tu hosting reemplazando los anteriores.</p>';
    return '<h1>Guardar y publicar</h1>' +
      grupo(REMOTO ? "Guardar en la base de datos" : "Descargar archivos", conectado + (REMOTO ? "" : '<button type="button" class="ed-boton" data-accion="descargar">Descargar archivos (.zip)</button>' +
        '<p class="ed-ayuda">Incluye js/config.js, js/catalogo.js y las fotos nuevas en img/. Copia todo a la carpeta de la tienda y vuelve a publicar.</p>'), true) +
      grupo("Respaldo", '<div class="ed-fila"><button type="button" class="ed-boton ed-boton--claro" data-accion="exportar-json">Exportar respaldo (.json)</button>' +
        '<label class="ed-boton ed-boton--claro" for="imp">Importar respaldo</label><input class="ed-oculto" id="imp" type="file" accept="application/json,.json" data-importar></div>' +
        '<p class="ed-ayuda">Sirve para copiar una tienda a otra o guardar una versión antes de cambios grandes.</p>') +
      grupo("Volver al inicio", '<button type="button" class="ed-boton ed-boton--claro" data-accion="restablecer">Volver a la versión publicada</button><p class="ed-ayuda">Borra el borrador de este navegador.</p>');
  }

  /* ---------- eventos del panel ---------- */
  panel.addEventListener("input", function (e) { manejarCampo(e.target, false); });
  panel.addEventListener("change", function (e) { manejarCampo(e.target, true); });
  function manejarCampo(el, fin) {
    var tipo = el.dataset.tipo, v = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.ruta) {
      if (tipo === "comas") v = String(v).split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      else if (tipo === "numeros") v = String(v).split(",").map(function (x) { return Number(x.trim()); }).filter(function (x) { return x > 0; });
      else if (tipo === "lineas") v = String(v).split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      else if (tipo === "equiv") { var o = null; String(v).split(",").forEach(function (par) { var m = par.split("="); if (m.length === 2 && m[0].trim()) { o = o || {}; o[m[0].trim()] = m[1].trim(); } }); v = o; }
      set(B.config, el.dataset.ruta, v);
      cambio(rutaDeSeccion());
      if (fin && /^tema\./.test(el.dataset.ruta) && seccion === "marca") pintar();
      if (el.dataset.ruta === "tema.estilo") { rutaPrevia = "?ver=inicio"; enviarVista(true); }
      if (el.dataset.ruta === "marca") pintarMenu();
      return;
    }
    if (el.dataset.marca && fin) {
      var arr = []; panel.querySelectorAll('[data-marca="' + el.dataset.marca + '"]:checked').forEach(function (x) { arr.push(x.value); });
      set(B.config, el.dataset.marca, arr); cambio(rutaDeSeccion()); return;
    }
    var p = prodActual();
    if (el.dataset.p && p) {
      var k = el.dataset.p;
      if (tipo === "comas") v = String(v).split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      if (tipo === "precio") { v = String(v).replace(",", ".").trim(); v = v === "" ? null : (isFinite(+v) && +v >= 0 ? Math.round(+v * 100) / 100 : p.precio); }
      if (tipo === "boolp") v = !!el.checked;
      p[k] = v; cambio("?ver=producto&id=" + p.id);
      if (k === "nombre") renombrarEnLista(p.nombre);
      if (k === "cat") { p.sub = ""; opcionesSub(p); }
      return;
    }
    if (el.dataset.pcolor && p && fin) {
      var n = el.dataset.pcolor, i = p.colores.indexOf(n);
      if (el.checked && i < 0) p.colores.push(n); if (!el.checked && i >= 0) p.colores.splice(i, 1);
      cambio("?ver=producto&id=" + p.id); pintar(); return;
    }
    if (el.dataset.pfoto != null && p && fin) { p.fotos[+el.dataset.pfoto][el.dataset.campo] = v; cambio("?ver=producto&id=" + p.id); return; }
    var c = B.catalogo.categorias[catSel];
    if (el.dataset.c && c) { c[el.dataset.c] = tipo === "boolp" ? !!el.checked : v; cambio("?ver=tienda&cat=" + c.id); if (el.dataset.c === "nombre") renombrarEnLista(c.nombre); return; }
    if (el.dataset.sub != null && c) {
      var s = c.sub[+el.dataset.sub]; s[el.dataset.campo] = v;
      if (el.dataset.campo === "advertencia" && !v) delete s.advertencia;
      cambio("?ver=tienda&cat=" + c.id); return;
    }
    if (el.dataset.colorcat && fin) { B.catalogo.colores[el.dataset.colorcat] = v; cambio(rutaDeSeccion()); return; }
    if (el.type === "file" && !fin) return; // los archivos se procesan una sola vez, en "change"
    if (el.dataset.imagen && el.files && el.files[0]) { subirImagen(el.files[0], function (src) { set(B.config, el.dataset.imagen, src); cambio(rutaDeSeccion()); pintar(); }); return; }
    if (el.hasAttribute("data-pfotos") && el.files && p) {
      [].slice.call(el.files, 0, 8).forEach(function (f) {
        subirImagen(f, function (src, w, h) { p.fotos = p.fotos || []; p.fotos.push({ src: src, w: w, h: h, tipo: "r" }); cambio("?ver=producto&id=" + p.id); pintar(); });
      });
      return;
    }
    if (el.hasAttribute("data-importar") && el.files && el.files[0]) importar(el.files[0]);
  }
  /* Actualiza textos sin redibujar el formulario (no se pierde el campo donde está escribiendo) */
  function renombrarEnLista(nombre) {
    var b = panel.querySelector(".ed-items button[aria-current] strong"); if (b) b.textContent = nombre;
    var h = panel.querySelector(".ed-detalle__cab h2"); if (h) h.textContent = nombre;
  }
  function opcionesSub(p) {
    var c = B.catalogo.categorias.find(function (x) { return x.id === p.cat; }), sel = panel.querySelector("#psub"); if (!sel) return;
    sel.innerHTML = '<option value="">Ninguna</option>' + (c ? c.sub || [] : []).map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.nombre) + "</option>"; }).join("");
  }
  function rutaDeSeccion() {
    if (seccion === "productos" && prodActual()) return "?ver=producto&id=" + prodActual().id;
    if (seccion === "categorias" && B.catalogo.categorias[catSel]) return "?ver=tienda&cat=" + B.catalogo.categorias[catSel].id;
    if (seccion === "contacto") return rutaPrevia;
    return "?ver=inicio";
  }

  document.getElementById("ed-menu").addEventListener("click", function (e) {
    var b = e.target.closest("[data-seccion]"); if (!b) return;
    seccion = b.dataset.seccion; pintar(); panel.scrollTop = 0; panel.focus();
    rutaPrevia = rutaDeSeccion(); enviarVista(true);
  });
  panel.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.dataset.form === "login") return entrar(f.correo.value.trim(), f.clave.value);
    if (f.dataset.form === "color") {
      var n = slug(f.n.value).slice(0, 24);
      if (!/^[a-z][a-z-]{1,23}$/.test(n)) return aviso("El nombre del color debe tener letras minúsculas, sin números (ej. lavanda o verde-agua).");
      if (B.catalogo.colores[n]) return aviso("Ese color ya existe.");
      B.catalogo.colores[n] = T.hex(f.h.value, "#cccccc"); cambio(rutaDeSeccion()); pintar();
    }
  });
  panel.addEventListener("click", function (e) {
    var t = e.target.closest("button, [data-paleta]"); if (!t) return;
    var d = t.dataset, p = prodActual(), c = B.catalogo.categorias[catSel], arr;
    if (d.paleta) { B.config.tema = Object.assign({}, B.config.tema, PALETAS[d.paleta]); cambio("?ver=inicio"); pintar(); return; }
    if (d.quitarImagen) { set(B.config, d.quitarImagen, ""); cambio(rutaDeSeccion()); pintar(); return; }
    if (d.agregar) { arr = get(B.config, d.agregar) || []; arr.push(JSON.parse(d.nuevo)); set(B.config, d.agregar, arr); cambio(rutaDeSeccion()); pintar(); return; }
    if (d.borrar) { arr = get(B.config, d.borrar); arr.splice(+d.i, 1); cambio(rutaDeSeccion()); pintar(); return; }
    if (d.orden) { moverOrden(d.orden, +d.d); cambio("?ver=inicio"); pintar(); return; }
    if (d.mover) { arr = get(B.config, d.mover); var i = +d.i, j = i + +d.d; if (j >= 0 && j < arr.length) { arr.splice(j, 0, arr.splice(i, 1)[0]); cambio(rutaDeSeccion()); pintar(); } return; }
    if (d.prod != null) { prodSel = +d.prod; pintar(); rutaPrevia = rutaDeSeccion(); enviarVista(true); return; }
    if (d.catsel != null) { catSel = +d.catsel; pintar(); rutaPrevia = rutaDeSeccion(); enviarVista(true); return; }
    if (d.moverfoto != null && p) { var a = +d.moverfoto, b = a + +d.d; p.fotos.splice(b, 0, p.fotos.splice(a, 1)[0]); cambio("?ver=producto&id=" + p.id); pintar(); return; }
    if (d.borrarfoto != null && p) { p.fotos.splice(+d.borrarfoto, 1); cambio("?ver=producto&id=" + p.id); pintar(); return; }
    if (d.movercat && c) { var k = catSel + +d.movercat; var cs = B.catalogo.categorias; cs.splice(k, 0, cs.splice(catSel, 1)[0]); cs.forEach(function (x, n) { x.orden = n + 1; }); catSel = k; cambio(rutaDeSeccion()); pintar(); return; }
    if (d.borrarsub != null && c) { c.sub.splice(+d.borrarsub, 1); cambio(rutaDeSeccion()); pintar(); return; }
    if (d.borrarcolor) {
      var usado = productos().some(function (q) { return q.colores.indexOf(d.borrarcolor) >= 0; });
      if (usado) return aviso("Ese color lo usan productos. Desmárcalo en ellos antes de quitarlo.");
      delete B.catalogo.colores[d.borrarcolor]; cambio(rutaDeSeccion()); pintar(); return;
    }
    switch (d.accion) {
      case "nuevo-producto": return nuevoProducto();
      case "duplicar-producto": return p && nuevoProducto(p);
      case "borrar-producto":
        if (!p) return;
        if (t.dataset.confirmar !== "1") { t.dataset.confirmar = "1"; t.textContent = "¿Eliminar? Toca otra vez"; setTimeout(function () { if (t.isConnected) { t.dataset.confirmar = ""; t.textContent = "Eliminar"; } }, 4000); return; }
        productos().splice(prodSel, 1); prodSel = Math.max(0, prodSel - 1); cambio("?ver=tienda"); pintar(); return;
      case "nueva-categoria":
        var nombre = "Categoría nueva", idc = unico(slug(nombre), function (s) { return B.catalogo.categorias.some(function (x) { return x.id === s; }); });
        B.catalogo.categorias.push({ id: idc, nombre: nombre, visible: true, orden: B.catalogo.categorias.length + 1, sub: [] }); catSel = B.catalogo.categorias.length - 1; cambio(); pintar(); return;
      case "borrar-categoria": if (c) { B.catalogo.categorias.splice(catSel, 1); catSel = 0; cambio("?ver=tienda"); pintar(); } return;
      case "nueva-sub": if (c) { c.sub = c.sub || []; var nm = "Subcategoría " + (c.sub.length + 1); c.sub.push({ id: unico(slug(nm), function (s) { return c.sub.some(function (x) { return x.id === s; }); }), nombre: nm }); cambio(); pintar(); } return;
      case "descargar": return descargar();
      case "exportar-json": return bajar(new Blob([JSON.stringify({ config: B.config, catalogo: B.catalogo }, null, 2)], { type: "application/json" }), "respaldo-" + slug(B.config.marca) + ".json");
      case "restablecer":
        if (t.dataset.confirmar !== "1") { t.dataset.confirmar = "1"; t.textContent = "¿Seguro? Toca otra vez"; return; }
        try { localStorage.removeItem(CLAVE); } catch (er) { /* sin almacenamiento */ }
        return iniciar(true);
      case "guardar-remoto": return guardarRemoto();
      case "salir": sesion = null; pintar(); return;
    }
  });

  /* ---------- imágenes: se reducen a WebP de hasta 1400 px en el navegador ---------- */
  function subirImagen(archivo, listo) {
    if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) return aviso("Solo se aceptan fotos JPG, PNG o WebP.");
    if (archivo.size > 12 * 1024 * 1024) return aviso("La foto pesa más de 12 MB. Usa una más liviana.");
    estado("Preparando foto…");
    var url = URL.createObjectURL(archivo), img = new Image();
    img.onload = function () {
      var lado = 1400, k = Math.min(1, lado / Math.max(img.width, img.height)), w = Math.round(img.width * k), h = Math.round(img.height * k);
      var cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      cv.toBlob(function (blob) {
        if (!blob) return aviso("No se pudo procesar la foto.");
        if (REMOTO && sesion) {
          var nombre = slug(archivo.name.replace(/\.[^.]+$/, "")) + "-" + Math.random().toString(36).slice(2, 8) + ".webp";
          fetch(SB.url + "/storage/v1/object/productos/" + nombre, { method: "POST", headers: { apikey: SB.anonKey, Authorization: "Bearer " + sesion.token, "Content-Type": "image/webp", "x-upsert": "false" }, body: blob })
            .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); listo(SB.url.replace(/\/$/, "") + "/storage/v1/object/public/productos/" + nombre, w, h); estado("Foto subida"); })
            .catch(function (er) { aviso("No se pudo subir la foto (" + er.message + "). Revisa tu sesión."); });
        } else {
          var fr = new FileReader(); fr.onload = function () { listo(fr.result, w, h); estado("Foto lista"); }; fr.readAsDataURL(blob);
        }
      }, "image/webp", 0.86);
    };
    img.onerror = function () { URL.revokeObjectURL(url); aviso("El archivo no es una imagen válida."); };
    img.src = url;
  }

  /* ---------- guardar ---------- */
  function validar() {
    var errores = [], ids = {};
    if (!B.config.marca) errores.push("Falta el nombre del negocio.");
    if (!/^\d{8,15}$/.test(String(B.config.whatsapp || ""))) errores.push("El WhatsApp debe tener solo números, con código de país (8 a 15 dígitos).");
    productos().forEach(function (p) {
      if (ids[p.id]) errores.push("Hay dos productos con el mismo código interno: " + p.id); ids[p.id] = 1;
      if (!p.nombre) errores.push("Hay un producto sin nombre.");
      if (!B.catalogo.categorias.some(function (c) { return c.id === p.cat; })) errores.push(p.nombre + " no tiene una categoría válida.");
    });
    return errores;
  }
  function textoArchivo(nombre, global, dato, nota) {
    return "/* " + nota + "\n   Generado por el editor el " + new Date().toLocaleString("es-PE") + ". */\nwindow." + global + " = " + JSON.stringify(dato, null, 2) + ";\n";
  }
  function descargar() {
    var errores = validar(); if (errores.length) return aviso(errores[0]);
    var archivos = [], vistos = {};
    function sacarImagenes(o) { // reemplaza imágenes en memoria por archivos img/subida-xxxx.webp
      if (typeof o === "string") {
        if (/^data:image\/(webp|png|jpeg);base64,/.test(o)) {
          var nombre = "img/subida-" + ZIP.crc32(new TextEncoder().encode(o)).toString(16) + (o.indexOf("image/png") > 0 ? ".png" : o.indexOf("image/jpeg") > 0 ? ".jpg" : ".webp");
          if (!vistos[nombre]) { vistos[nombre] = 1; archivos.push({ nombre: nombre, dato: o }); }
          return nombre;
        }
        return o;
      }
      if (Array.isArray(o)) return o.map(sacarImagenes);
      if (o && typeof o === "object") { var r = {}; Object.keys(o).forEach(function (k) { r[k] = sacarImagenes(o[k]); }); return r; }
      return o;
    }
    var cfg = sacarImagenes(B.config), catl = sacarImagenes(B.catalogo);
    cfg.supabase = BASE_CFG.supabase || { url: "", anonKey: "" };
    archivos.unshift({ nombre: "js/catalogo.js", dato: textoArchivo("catalogo", "DA_CATALOGO", catl, "Catálogo de la tienda: categorías, colores y productos.") });
    archivos.unshift({ nombre: "js/config.js", dato: textoArchivo("config", "DA_CONFIG", cfg, "Configuración de la tienda. SEGURIDAD: aquí solo van datos públicos.") });
    bajar(ZIP.crear(archivos), "tienda-" + slug(B.config.marca) + ".zip");
    sucio = false; estado("Archivos descargados");
  }
  function bajar(blob, nombre) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function importar(archivo) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result);
        if (!d || !d.config || !d.catalogo || !Array.isArray(d.catalogo.productos)) throw new Error("formato");
        B = { config: T.completar(BASE_CFG, d.config), catalogo: d.catalogo }; prodSel = 0; catSel = 0; cambio("?ver=inicio"); pintar(); estado("Respaldo importado");
      } catch (e) { aviso("Ese archivo no es un respaldo válido de la tienda."); }
    };
    fr.readAsText(archivo);
  }
  function api(ruta, cuerpo, conSesion) {
    var h = { apikey: SB.anonKey, "Content-Type": "application/json" };
    h.Authorization = "Bearer " + (conSesion && sesion ? sesion.token : SB.anonKey);
    return fetch(SB.url + ruta, { method: "POST", headers: h, body: JSON.stringify(cuerpo || {}) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.message || j.error_description || j.msg || "Error " + r.status); return j; });
    });
  }
  function entrar(correo, clave) {
    estado("Entrando…");
    api("/auth/v1/token?grant_type=password", { email: correo, password: clave })
      .then(function (j) { sesion = { token: j.access_token, email: (j.user || {}).email || correo }; return api("/rest/v1/rpc/es_admin", {}, true); })
      .then(function (esAdmin) { if (esAdmin !== true) { sesion = null; throw new Error("Esta cuenta no es administradora de la tienda."); } estado("Sesión iniciada"); pintar(); })
      .catch(function (e) { sesion = null; aviso(e.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : e.message); pintar(); });
  }
  function guardarRemoto() {
    var errores = validar(); if (errores.length) return aviso(errores[0]);
    if (!sesion) { seccion = "publicar"; pintar(); return aviso("Inicia sesión para guardar."); }
    var cfg = clon(B.config); delete cfg.supabase;
    estado("Guardando…");
    api("/rest/v1/rpc/guardar_ajustes", { p_datos: cfg }, true)
      .then(function () { return api("/rest/v1/rpc/guardar_catalogo", { p_catalogo: B.catalogo }, true); })
      .then(function () { sucio = false; try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } estado("Guardado. La tienda ya muestra los cambios."); })
      .catch(function (e) { aviso("No se pudo guardar: " + e.message); });
  }
  var bv = document.getElementById("ed-ver-vista");
  bv.addEventListener("click", function () { var on = document.body.classList.toggle("ver-vista"); bv.setAttribute("aria-pressed", on); bv.textContent = on ? "Volver al editor" : "Vista previa"; if (on) enviarVista(true); });
  document.getElementById("ed-guardar").addEventListener("click", function () {
    if (REMOTO) guardarRemoto(); else { seccion = "publicar"; pintar(); descargar(); }
  });
  document.getElementById("ed-descartar").addEventListener("click", function (e) {
    var t = e.currentTarget;
    if (t.dataset.confirmar !== "1") { t.dataset.confirmar = "1"; t.textContent = "¿Descartar? Toca otra vez"; setTimeout(function () { t.dataset.confirmar = ""; t.textContent = "Descartar cambios"; }, 4000); return; }
    t.dataset.confirmar = ""; t.textContent = "Descartar cambios";
    try { localStorage.removeItem(CLAVE); } catch (er) { /* nada */ }
    iniciar(true);
  });
  window.addEventListener("beforeunload", function (e) { if (sucio) { e.preventDefault(); e.returnValue = ""; } });

  /* Pinta muestras de color sin estilos en línea (CSP sin 'unsafe-inline') */
  new MutationObserver(function () {
    panel.querySelectorAll("[data-bg]").forEach(function (el) { var c = T.hex(el.dataset.bg, ""); if (c) el.style.setProperty("background", c); el.removeAttribute("data-bg"); });
  }).observe(panel, { childList: true, subtree: true });

  /* ---------- arranque ---------- */
  function iniciar(limpio) {
    var b = !limpio && leerBorrador();
    var desdeRemoto = REMOTO && !b ? Promise.all([api("/rest/v1/rpc/ajustes_publicos"), api("/rest/v1/rpc/catalogo_publico")]).catch(function () { return [null, null]; }) : Promise.resolve([null, null]);
    desdeRemoto.then(function (r) {
      B = b ? { config: T.completar(BASE_CFG, b.config), catalogo: b.catalogo }
        : { config: r[0] ? T.completar(BASE_CFG, r[0]) : clon(BASE_CFG), catalogo: r[1] && r[1].productos ? r[1] : clon(BASE_CAT) };
      sucio = !!b; document.getElementById("ed-modo").textContent = REMOTO ? "Conectado a la base de datos" : "Modo local";
      document.getElementById("ed-estado").textContent = b ? "Borrador recuperado de " + new Date(b.fecha).toLocaleString("es-PE") : "";
      pintar(); rutaPrevia = rutaDeSeccion(); enviarVista(true);
    });
  }
  iniciar(false);
})();
