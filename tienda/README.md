# Tienda en línea (plantilla) · ejemplo DANZAAURA

Tienda web sin dependencias (HTML, CSS y JS) con editor visual. Los pedidos llegan por WhatsApp. Opcionalmente se conecta a Supabase para tener catálogo editable en línea, stock, registro de pedidos y Libro de Reclamaciones.

Tiene **dos diseños** que se eligen en el editor: **Deportivo** (gran tienda: banner con titular, carrusel con pestañas, destacados, franja de color y pie en columnas) y **Editorial** (boutique: foto fija, vitrina de colores, lista de precios).

Todo el contenido (marca, colores, fuentes, textos, secciones, productos y fotos) vive en `js/config.js` y `js/catalogo.js`, o en la base de datos. El código no tiene nada propio de un negocio, así que la misma tienda sirve para cualquier cliente.

## Estructura
| Archivo | Para qué |
| --- | --- |
| `index.html` | La tienda: inicio, catálogo, producto, favoritos, carrito y páginas legales (`?ver=...`) |
| `admin.html` | Editor visual sin código, con vista previa en vivo |
| `js/config.js` | Marca, tema, textos, secciones, combo, preguntas, mensajes, datos legales, conexión Supabase (solo URL y anon key) |
| `js/catalogo.js` | Categorías, colores y productos con sus fotos |
| `js/temas.js` | Colores derivados, fuentes permitidas y validación de imágenes (lo usan tienda y editor) |
| `js/app.js` | Tienda: vistas, filtros, buscador, carrito lateral, combo, vitrina 3D, pedido |
| `js/admin.js` · `js/zip.js` · `css/admin.css` | Editor y su descarga en .zip |
| `js/datos.js` | Lee ajustes y catálogo de Supabase, crea pedidos y reclamos |
| `plantillas/tienda-generica.json` | Punto de partida para un cliente nuevo (se importa en el editor) |
| `supabase/esquema.sql` | Tablas, RLS, pedidos, editor (`guardar_ajustes`, `guardar_catalogo`) y Libro de Reclamaciones |
| `supabase/datos-iniciales.sql` | Catálogo de DANZAAURA (generado con `node tools/semilla.js`) |
| `_headers` | Cabeceras de seguridad (Cloudflare Pages / Netlify) |
| `tools/` | Pruebas y utilidades de fotos |

## Vender la tienda a otro negocio

### Opción A · Tienda conectada (recomendada)
El dueño entra al editor, cambia lo que quiera y al pulsar **Guardar** la tienda se actualiza al instante.
1. Copia la carpeta del proyecto para el cliente.
2. Crea un proyecto gratis en supabase.com. En SQL Editor ejecuta `supabase/esquema.sql` (no ejecutes `datos-iniciales.sql`, es el catálogo de DANZAAURA).
3. En Authentication crea el usuario del dueño y hazlo administrador: `insert into admins values ('<id-del-usuario>');`
4. Pon **Project URL** y **anon public key** en `js/config.js` → `supabase`. Nunca la `service_role`.
5. Publica la carpeta en Cloudflare Pages (gratis) y conecta el dominio del cliente.
6. Entra a `tudominio/admin.html`, inicia sesión, ve a **Guardar y publicar → Respaldo → Importar** y carga `plantillas/tienda-generica.json`. Cambia marca, logo, colores, textos, productos y fotos, y pulsa **Guardar**.
7. Entrega al cliente el enlace del editor y su correo y contraseña.

### Opción B · Tienda sin base de datos
Para negocios que cambian poco. Abre `admin.html` en el hosting (o en tu PC con `python3 -m http.server`), edita, pulsa **Guardar** para descargar el .zip y reemplaza `js/config.js`, `js/catalogo.js` y las fotos nuevas de `img/` en la carpeta publicada.

### Qué puede cambiar el cliente desde el editor
- **Marca:** nombre, logo, 6 paletas listas o colores propios (con aviso de contraste), tipografía de títulos y de texto.
- **Portada:** frase, botones, foto, datos destacados, barra de anuncios.
- **Secciones:** mostrar u ocultar cada una (vitrina de colores, lista de precios, vitrina 3D, categorías, combo, “así compras”, preguntas, contacto) y editar sus textos y fotos.
- **Productos:** crear, duplicar, ocultar, eliminar, precio, tallas, colores, fotos por color, descripción y guía de tallas.
- **Categorías y colores:** nombres, orden, subcategorías con aviso, colores del catálogo.
- **Contacto y legal:** WhatsApp, redes, mensajes, envíos, cambios, pago, razón social, RUC, Libro de Reclamaciones, textos para Google, moneda.
- **Respaldo:** exportar e importar la tienda completa en .json, para copiar una tienda a otra.

Para poner tu firma en cada tienda que vendas, usa **Secciones → Pie de página → Créditos**.

## Activar Supabase en DANZAAURA
1. Ejecuta `esquema.sql` y luego `datos-iniciales.sql`.
2. Crea tu usuario y agrégalo a `admins`.
3. Copia URL y anon key en `js/config.js`.
4. Límites del plan gratis: 500 MB de base, 1 GB de fotos; el proyecto se pausa tras 7 días sin uso.

## Libro de Reclamaciones (obligatorio en Perú)
- Recomendado: registra la tienda en la herramienta gratuita de INDECOPI y pega el enlace en el editor (**Contacto y legal**) o en `libroReclamacionesUrl`.
- Formulario propio: con Supabase activo guarda documento, domicilio, celular y correo cifrados. Crea la clave con `select vault.create_secret('<clave-larga>', 'clave_datos');`. No envía copia por correo.
- Completa razón social, RUC y dirección de cada cliente.

## Seguridad
- Editor: sesión solo en memoria; el servidor exige rol admin en cada guardado (`guardar_ajustes`, `guardar_catalogo`) y rechaza imágenes sin subir o de dominios ajenos.
- Tienda: todo texto se escapa; enlaces, imágenes, colores y fuentes pasan por listas blancas; CSP sin `unsafe-inline`.
- Precios, stock y totales los calcula el servidor; RLS en todas las tablas.

## Pruebas
- Tienda, diseño editorial: `python3 -m http.server 8765` y `python3 tools/prueba-tienda.py` (62 comprobaciones).
- Tienda, diseño deportivo: `python3 tools/prueba-deportivo.py` (21 comprobaciones).
- Editor: `python3 tools/prueba-editor.py` (35 comprobaciones).
- Base de datos: `node tools/prueba-esquema.mjs` contra un Postgres local (47 comprobaciones).

## Fotos
- `python3 tools/fotos.py catalogo.pdf` extrae las fotos de un catálogo PDF.
- `python3 tools/nitidez.py <modelos-realesrgan>` mejora la nitidez (Real-ESRGAN x4) y quita el fondo (rembg). Originales en `img/originales/`.

## Antes de publicar
- Confirmar el WhatsApp y los colores de cada producto.
- Cambiar `TU-DOMINIO` en `robots.txt` y crear `sitemap.xml`.
