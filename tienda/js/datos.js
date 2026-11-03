/* Capa de datos: catálogo local o Supabase (solo anon key pública + RLS).
   El precio final y el stock SIEMPRE los valida el servidor (función crear_pedido). */
(function () {
  var cfg = window.DA_CONFIG || {};
  var sb = cfg.supabase || {};
  var activo = !!(sb.url && sb.anonKey && /^https:\/\//.test(sb.url));

  function cabeceras() {
    return { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey, "Content-Type": "application/json" };
  }

  async function cargar() {
    if (!activo) return window.DA_CATALOGO;
    try {
      var r = await fetch(sb.url + "/rest/v1/rpc/catalogo_publico", { method: "POST", headers: cabeceras(), body: "{}" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      var datos = await r.json();
      datos.colores = Object.assign({}, window.DA_CATALOGO.colores, datos.colores || {});
      return datos;
    } catch (e) {
      console.warn("Catálogo remoto no disponible, uso el local.", e.message);
      return window.DA_CATALOGO;
    }
  }

  /* Ajustes de la tienda guardados desde el editor (tabla ajustes). Sin Supabase: null y se usa config.js */
  async function cargarAjustes() {
    if (!activo) return null;
    try {
      var r = await fetch(sb.url + "/rest/v1/rpc/ajustes_publicos", { method: "POST", headers: cabeceras(), body: "{}" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      var j = await r.json();
      return j && typeof j === "object" && !Array.isArray(j) ? j : null;
    } catch (e) { console.warn("Ajustes remotos no disponibles, uso config.js.", e.message); return null; }
  }

  /* Envía SOLO ids, variantes y cantidades. Nunca precios: el servidor los calcula. */
  async function crearPedido(pedido) {
    if (!activo) return { local: true };
    var r = await fetch(sb.url + "/rest/v1/rpc/crear_pedido", {
      method: "POST", headers: cabeceras(),
      body: JSON.stringify({ p_cliente: pedido.cliente, p_items: pedido.items, p_trampa: pedido.trampa || "" })
    });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw new Error(j.message || "No pudimos registrar el pedido.");
    return j; // { codigo, total }
  }

  /* Reclamo: el servidor valida, cifra los datos personales y devuelve solo código y fecha. */
  async function registrarReclamo(datos, trampa) {
    var r = await fetch(sb.url + "/rest/v1/rpc/registrar_reclamo", {
      method: "POST", headers: cabeceras(), body: JSON.stringify({ p_datos: datos, p_trampa: trampa || "" })
    });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw new Error(j.message || "No pudimos registrar tu reclamo.");
    return j; // { codigo, fecha }
  }

  window.DA_DATOS = { cargar: cargar, cargarAjustes: cargarAjustes, crearPedido: crearPedido, registrarReclamo: registrarReclamo, remoto: activo };
})();
