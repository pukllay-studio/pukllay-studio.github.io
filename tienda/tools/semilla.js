// Genera supabase/datos-iniciales.sql a partir de js/catalogo.js (fuente única de datos reales).
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../js/catalogo.js", "utf8"), ctx);
const C = ctx.window.DA_CATALOGO;
const q = v => v == null ? "null" : "'" + String(v).replace(/'/g, "''") + "'";
let s = "-- Datos iniciales (generado por tools/semilla.js). Ejecutar después de esquema.sql.\n";
s += "insert into colores (nombre, hex) values\n" + Object.entries(C.colores).map(([n, h]) => `(${q(n)}, ${q(h)})`).join(",\n") + ";\n";
C.categorias.forEach(c => {
  s += `insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values (${q(c.id)}, ${q(c.nombre)}, ${c.visible}, ${c.orden}, ${!!c.calzado}, ${q(c.guiaTallas)});\n`;
  c.sub.forEach((sc, i) => s += `insert into categorias (id, nombre, padre, visible, orden, advertencia) values (${q(c.id + "-" + sc.id)}, ${q(sc.nombre)}, ${q(c.id)}, true, ${i}, ${q(sc.advertencia)});\n`);
});
C.productos.forEach(p => {
  const arr = xs => `array[${(xs || []).map(q).join(",")}]::text[]`;
  s += `insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values (${q(p.id)}, ${q(p.sku)}, ${q(p.nombre)}, ${q(p.cat)}, ${q(p.cat + "-" + p.sub)}, ${q(p.descripcion)}, ${q(p.material)}, ${q(p.dibujo)}, ${p.precio == null ? "null" : p.precio}, ${arr(p.publico)}, ${q(p.sistemaTalla)}, ${q(p.guiaTallas)}, ${arr(p.tallas)}, ${arr(p.colores)}, ${p.orden});\n`;
  (p.fotos || []).forEach((f, i) => s += `insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values (${q(p.id)}, ${q(f.src)}, ${q(f.tipo || "r")}, ${f.w || "null"}, ${f.h || "null"}, ${q(f.color)}, ${i + 1});\n`);
  const tallas = p.tallas.length ? p.tallas : [""], colores = p.colores.length ? p.colores : [null];
  const filas = []; tallas.forEach(t => colores.forEach(c => filas.push(`(${q(p.id)}, ${q(t)}, ${q(c)}, null)`)));
  s += "insert into variantes (producto_id, talla, color, stock) values\n" + filas.join(",\n") + ";\n";
});
fs.writeFileSync(__dirname + "/../supabase/datos-iniciales.sql", s);
console.log("OK", C.productos.length, "productos");
