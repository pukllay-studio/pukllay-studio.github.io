import pg from "pg";
import fs from "fs";
const D = "/home/claude/danzaaura-tienda/supabase/";
const db = new pg.Client({ host: "/tmp", port: 5544, user: "postgres", database: "postgres" }); await db.connect();
await db.query("drop schema if exists public cascade; drop schema if exists auth cascade; drop schema if exists storage cascade; drop schema if exists vault cascade; drop role if exists anon; drop role if exists authenticated; create schema public;");
db.exec = (q) => db.query(q);
const ok = (m) => console.log("OK  ", m), mal = (m) => { console.log("FALLA", m); process.exitCode = 1; };
// Stubs mínimos del entorno Supabase
await db.exec(`
create role anon; create role authenticated;
create schema auth; create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
create schema storage; create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text); alter table storage.objects enable row level security;
grant usage on schema public, auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
`);
await db.exec(fs.readFileSync(D + "esquema.sql", "utf8")); ok("esquema.sql se ejecuta");
await db.exec(fs.readFileSync(D + "datos-iniciales.sql", "utf8")); ok("datos-iniciales.sql se ejecuta");
await db.exec(`grant select on all tables in schema public to anon, authenticated; revoke all on public.pedidos, public.pedido_items, public.admins from anon;`);

const cat = (await db.query("select public.catalogo_publico() c")).rows[0].c;
cat.productos.length === 15 ? ok("catálogo público: 15 productos") : mal("catálogo " + cat.productos.length);
cat.productos.find(p => p.id === "body-manga-larga").tallas.length === 10 ? ok("variantes de tallas") : mal("tallas");

async function como(rol, sql, params) { await db.exec(`set role ${rol}`); try { return await db.query(sql, params && params.map(v => typeof v === "object" && v !== null ? JSON.stringify(v) : v)); } finally { await db.exec("reset role"); } }
const cli = { nombre: "Ana Prueba", celular: "987654321", ciudad: "Lima" };

// 1. Pedido válido: total calculado por el servidor
let r = await como("anon", "select public.crear_pedido($1,$2,'') r", [cli, [{ producto: "body-manga-larga", talla: "8", color: "rosado", cantidad: 2 }, { producto: "falda-tul", talla: "4-6", color: "rosado", cantidad: 1 }]]);
Number(r.rows[0].r.total) === 65 ? ok("total del servidor = 2×25 + 15 = 65") : mal("total " + JSON.stringify(r.rows[0].r));
// 2. Precio enviado por el cliente se ignora
r = await como("anon", "select public.crear_pedido($1,$2,'') r", [{ ...cli, celular: "911111111" }, [{ producto: "conjunto-deportivo", talla: "M", color: "negro", cantidad: 1, precio: 1 }]]);
Number(r.rows[0].r.total) === 120 ? ok("precio manipulado ignorado (120)") : mal("precio manipulado");
async function debeFallar(nombre, cliente, items, trampa = "") {
  try { await como("anon", "select public.crear_pedido($1,$2,$3)", [cliente, items, trampa]); mal(nombre + " (se aceptó)"); }
  catch (e) { ok(nombre + " → rechazado: " + e.message); }
}
await debeFallar("talla inexistente", cli, [{ producto: "body-manga-larga", talla: "99", color: "rosado", cantidad: 1 }]);
await debeFallar("producto a consultar", cli, [{ producto: "zapatilla-lona", talla: "30", color: "rosado", cantidad: 1 }]);
await debeFallar("cantidad 50", cli, [{ producto: "body-manga-larga", talla: "8", color: "rosado", cantidad: 50 }]);
await debeFallar("celular inválido", { ...cli, celular: "12345" }, [{ producto: "body-manga-larga", talla: "8", color: "rosado", cantidad: 1 }]);
await debeFallar("honeypot de bots", cli, [{ producto: "body-manga-larga", talla: "8", color: "rosado", cantidad: 1 }], "spam");
await debeFallar("inyección en nombre de producto", cli, [{ producto: "x'; drop table productos; --", talla: "8", color: "rosado", cantidad: 1 }]);
// rate limit: ya hay 1 pedido de 987654321; dos más pasan, el cuarto falla
for (let i = 0; i < 2; i++) await como("anon", "select public.crear_pedido($1,$2,'')", [cli, [{ producto: "pantys-algodon", talla: "S", color: "rosado", cantidad: 1 }]]);
await debeFallar("límite de 3 pedidos por hora por celular", cli, [{ producto: "pantys-algodon", talla: "S", color: "rosado", cantidad: 1 }]);
// Stock: poner 1 unidad y pedir 2
await db.exec("update variantes set stock = 1 where producto_id='body-gimnasia' and talla='S' and color='negro'");
await debeFallar("stock insuficiente", { ...cli, celular: "922222222" }, [{ producto: "body-gimnasia", talla: "S", color: "negro", cantidad: 2 }]);
// RLS: anon no lee pedidos ni escribe productos
try { await como("anon", "select * from pedidos"); mal("anon leyó pedidos"); } catch (e) { ok("anon no puede leer pedidos"); }
try { const x = await como("anon", "update productos set precio = 1 where id='body-manga-larga'"); 
      const p = (await db.query("select precio from productos where id='body-manga-larga'")).rows[0].precio; Number(p) === 25 ? ok("anon no puede cambiar precios") : mal("anon cambió precio"); }
catch (e) { ok("anon no puede cambiar precios"); }
// Admin: confirmar descuenta stock
const uid = "11111111-1111-1111-1111-111111111111";
await db.exec(`insert into auth.users values ('${uid}'); insert into admins values ('${uid}'); update variantes set stock = 5 where producto_id='body-manga-larga' and talla='8' and color='rosado';`);
const ped = (await db.query("select p.id from pedidos p join pedido_items i on i.pedido_id=p.id where i.producto_id='body-manga-larga' limit 1")).rows[0].id;
await db.exec(`set request.jwt.claim.sub = '${uid}'`);
await como("authenticated", "select public.confirmar_pedido($1)", [ped]);
const st = (await db.query("select stock from variantes where producto_id='body-manga-larga' and talla='8' and color='rosado'")).rows[0].stock;
st === 3 ? ok("confirmar pedido descuenta stock 5 → 3") : mal("stock " + st);
try { await como("authenticated", "update pedidos set total = 1 where id=$1", [ped]); mal("admin cambió total"); } catch (e) { ok("admin no puede alterar el total del pedido"); }
await db.exec(`set request.jwt.claim.sub = ''`);
try { await como("authenticated", "select public.confirmar_pedido($1)", [ped]); mal("no-admin confirmó"); } catch (e) { ok("usuario no admin no puede confirmar"); }

// ===== Libro de Reclamaciones =====
const rec = { tipo: "reclamo", nombre: "Ana Prueba", tipoDoc: "DNI", documento: "12345678", domicilio: "Av. Lima 123, Lima", celular: "987654321", correo: "ana@correo.pe", producto: "DA-FTU", detalle: "La falda llegó con una costura abierta.", solicitud: "Cambio por otra igual." };
await db.exec(`set request.jwt.claim.sub = ''`);
try { await como("anon", "select public.registrar_reclamo($1,'')", [rec]); mal("reclamo sin clave aceptado"); } catch (e) { ok("sin clave en Vault el libro no acepta datos → " + e.message); }
await db.exec("insert into vault.decrypted_secrets values ('clave_datos', 'clave-de-prueba-muy-larga-123456')");
r = await como("anon", "select public.registrar_reclamo($1,'') r", [rec]);
/^LR-\d{8}-[0-9A-F]{6}$/.test(r.rows[0].r.codigo) && Object.keys(r.rows[0].r).length === 2 ? ok("reclamo registrado, responde solo código y fecha: " + r.rows[0].r.codigo) : mal("respuesta reclamo " + JSON.stringify(r.rows[0].r));
const fila = (await db.query("select documento_cif::text d, celular_cif::text c from reclamaciones limit 1")).rows[0];
!fila.d.includes("12345678") && !fila.c.includes("987654321") ? ok("DNI y celular guardados cifrados") : mal("datos en claro");
await debeFallarR("DNI de 7 dígitos", { ...rec, documento: "1234567" });
await debeFallarR("correo inválido", { ...rec, correo: "ana@" });
await debeFallarR("producto inexistente", { ...rec, producto: "XX-999" });
await debeFallarR("detalle vacío", { ...rec, detalle: "" });
await debeFallarR("honeypot", rec, "bot");
for (let i = 0; i < 2; i++) await como("anon", "select public.registrar_reclamo($1,'')", [rec]);
await debeFallarR("límite de 3 reclamos por hora", rec);
try { const x = await como("anon", "select * from reclamaciones"); x.rows.length === 0 ? ok("anon no ve ningún reclamo (RLS)") : mal("anon leyó reclamos"); } catch (e) { ok("anon no puede leer reclamos"); }
try { await como("anon", "select public.clave_datos()"); mal("anon leyó la clave"); } catch (e) { ok("anon no puede leer la clave de cifrado"); }
const idr = (await db.query("select id from reclamaciones limit 1")).rows[0].id;
try { await como("authenticated", "select public.ver_reclamo($1)", [idr]); mal("no admin descifró"); } catch (e) { ok("usuario no admin no puede descifrar reclamos"); }
await db.exec(`set request.jwt.claim.sub = '${uid}'`);
const vr = (await como("authenticated", "select public.ver_reclamo($1) v", [idr])).rows[0].v;
vr.documento === "12345678" && vr.correo === "ana@correo.pe" ? ok("admin descifra el reclamo para responder") : mal("descifrado admin");
// ===== Editor: ajustes y catálogo =====
await db.exec(`set request.jwt.claim.sub = ''`);
const aj = (await como("anon", "select public.ajustes_publicos() a")).rows[0].a;
aj === null ? ok("sin ajustes guardados la tienda usa config.js (null)") : mal("ajustes iniciales " + JSON.stringify(aj));
try { await como("anon", "select public.guardar_ajustes($1)", [{ marca: "X", whatsapp: "51999999999" }]); mal("anon guardó ajustes"); } catch (e) { ok("anon no puede guardar ajustes"); }
try { await como("authenticated", "select public.guardar_catalogo($1)", [{ productos: [], categorias: [] }]); mal("no admin guardó catálogo"); } catch (e) { ok("usuario no admin no puede guardar el catálogo"); }
await db.exec(`set request.jwt.claim.sub = '${uid}'`);
await como("authenticated", "select public.guardar_ajustes($1)", [{ marca: "Tienda Nueva", whatsapp: "51987654321", tema: { acento: "#1f4fa8" }, supabase: { url: "x" } }]);
const aj2 = (await como("anon", "select public.ajustes_publicos() a")).rows[0].a;
aj2.marca === "Tienda Nueva" && !("supabase" in aj2) ? ok("admin guarda ajustes; el público los lee sin datos de conexión") : mal("ajustes " + JSON.stringify(aj2));
try { await como("authenticated", "select public.guardar_ajustes($1)", [{ marca: "X", whatsapp: "51987654321", tema: { logo: "data:image/png;base64,AAAA" } }]); mal("aceptó data:image"); } catch (e) { ok("ajustes con imágenes sin subir → rechazado"); }
try { await como("authenticated", "select public.guardar_ajustes($1)", [{ marca: "X", whatsapp: "abc" }]); mal("aceptó whatsapp inválido"); } catch (e) { ok("ajustes con WhatsApp inválido → rechazado"); }
const catAntes = (await db.query("select public.catalogo_publico() c")).rows[0].c;
const nuevo = JSON.parse(JSON.stringify(catAntes));
nuevo.productos = nuevo.productos.filter(p => p.id !== "adorno-mono");
nuevo.productos[0].nombre = "Body manga larga clásico"; nuevo.productos[0].precio = 27;
nuevo.productos.push({ id: "polo-dry-fit", sku: "p-polo", nombre: "Polo dry fit", cat: "ballet", sub: "bodies", precio: 39.9, tallas: ["S", "M", "L"], colores: ["azul"], publico: [], fotos: [{ src: "img/body-mc-amarillo.webp", w: 900, h: 1100, tipo: "r", color: "azul" }], descripcion: "Polo" });
nuevo.categorias.push({ id: "moda-urbana", nombre: "Moda urbana", visible: true, sub: [{ id: "polos", nombre: "Polos" }] });
await db.query("update variantes set stock = 7 where producto_id = 'body-manga-larga' and talla = '8' and color = 'rosado'");
const rg = (await como("authenticated", "select public.guardar_catalogo($1) r", [nuevo])).rows[0].r;
rg.productos === nuevo.productos.length ? ok("admin guarda el catálogo completo (" + rg.productos + " productos)") : mal("guardar_catalogo " + JSON.stringify(rg));
const catDesp = (await db.query("select public.catalogo_publico() c")).rows[0].c;
const polo = catDesp.productos.find(p => p.id === "polo-dry-fit");
polo && polo.sku === "P-POLO" && polo.tallas.join() === "S,M,L" && polo.fotos.length === 1 && polo.sub === "ballet-bodies" ? ok("producto nuevo con tallas en orden, foto y subcategoría") : mal("polo " + JSON.stringify(polo));
!catDesp.productos.some(p => p.id === "adorno-mono") ? ok("producto quitado queda inactivo (no se borra el historial)") : mal("adorno sigue visible");
catDesp.productos.find(p => p.id === "body-manga-larga").precio == 27 ? ok("precio actualizado") : mal("precio no cambió");
(await db.query("select stock from variantes where producto_id='body-manga-larga' and talla='8' and color='rosado'")).rows[0].stock === 7 ? ok("el stock se conserva al guardar") : mal("stock perdido");
catDesp.categorias.some(c => c.id === "moda-urbana" && c.sub[0].id === "moda-urbana-polos") ? ok("categoría nueva con subcategoría") : mal("categoría nueva");
r = await como("anon", "select public.crear_pedido($1,$2,'') r", [{ nombre: "Leo", celular: "933333333", ciudad: "Lima" }, [{ producto: "polo-dry-fit", talla: "M", color: "azul", cantidad: 2 }]]);
Number(r.rows[0].r.total) === 79.8 ? ok("se puede pedir el producto nuevo: 2 × 39.90 = 79.80") : mal("pedido polo " + JSON.stringify(r.rows[0].r));
try { await como("authenticated", "select public.guardar_catalogo($1)", [{ ...nuevo, productos: [{ ...nuevo.productos[0], fotos: [{ src: "data:image/png;base64,AAAA" }] }] }]); mal("catálogo con data:image aceptado"); } catch (e) { ok("catálogo con fotos sin subir → rechazado"); }
try { await como("authenticated", "select public.guardar_catalogo($1)", [{ ...nuevo, productos: [{ ...nuevo.productos[0], fotos: [{ src: "https://evil.com/x.webp" }] }] }]); mal("ruta externa aceptada"); } catch (e) { ok("foto de un dominio ajeno → rechazada"); }
await db.exec(`set request.jwt.claim.sub = ''`);
async function debeFallarR(nombre, datos, trampa = "") {
  try { await como("anon", "select public.registrar_reclamo($1,$2)", [datos, trampa]); mal(nombre + " (se aceptó)"); }
  catch (e) { ok(nombre + " → rechazado: " + e.message); }
}
await db.end();
