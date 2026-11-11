# Pruebas del diseño DEPORTIVO (gran tienda). Uso: python3 tools/prueba-deportivo.py [url] [carpeta]
import sys, re, os
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/"
OUT = sys.argv[2] if len(sys.argv) > 2 else "capturas-deportivo"
os.makedirs(OUT, exist_ok=True)
fallas = 0
def ok(c, m):
    global fallas
    print(("OK   " if c else "FALLA ") + m)
    if not c: fallas += 1
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())
    pg.goto(URL); pg.wait_for_selector(".banner"); pg.wait_for_timeout(500)
    ok(pg.evaluate("document.body.classList.contains('estilo-deportivo')"), "se activa el diseño deportivo")
    ok(pg.locator("h1").count() == 1 and pg.inner_text(".banner h1").strip().lower() == "hecho para bailar", "banner con un solo h1 y el titular de la configuración")
    ok(pg.locator(".banner .boton-d").count() == 2, "banner con dos botones")
    ok(pg.locator(".beneficios li").count() == 4, "franja de beneficios")
    n = pg.locator("#carr-pista .tarjeta").count(); ok(n >= 8, f"carrusel con productos ({n})")
    ok(pg.locator("#carr-pista .tarjeta__etiqueta-precio").first.is_visible(), "precio sobre la foto")
    pg.click("[data-carr='zapatillas']"); pg.wait_for_timeout(200)
    ok(pg.locator("#carr-pista .tarjeta").count() == 4 and "cat=zapatillas" in pg.get_attribute("#carr-todo", "href"), "pestaña de categoría filtra el carrusel")
    x0 = pg.evaluate("document.getElementById('carr-pista').scrollLeft"); pg.click("[data-carr='']"); pg.wait_for_timeout(200)
    pg.click(".carrusel__flecha--der"); pg.wait_for_timeout(900)
    ok(pg.evaluate("document.getElementById('carr-pista').scrollLeft") > x0, "flecha desplaza el carrusel")
    pg.locator("#carr-pista .fav").first.click(); pg.wait_for_timeout(200)
    ok(pg.inner_text("[data-favs]") == "1", "favoritos desde el carrusel")
    ok(pg.locator(".promo").count() == 4, "cuatro destacados con foto")
    ok(pg.locator(".promo img").count() == 4, "destacados con fotos reales")
    ok(pg.locator(".categoria").count() == 4 and pg.locator(".uniforme").count() == 1, "categorías y combo presentes")
    ok(pg.locator(".franja .boton-d").count() == 1 and "wa.me" in pg.get_attribute(".franja .boton-d", "href"), "franja final con WhatsApp")
    ok(pg.locator(".pie-d__col").count() == 3 and pg.locator(".pie-d a[href='?ver=reclamaciones']").count() == 1, "pie con columnas y Libro de Reclamaciones")
    orden = pg.evaluate("[...document.querySelectorAll('#app > *')].map(e=>e.classList[0]).join(',')")
    ok(orden == "banner,beneficios,categorias,carrusel,uniforme,promos,v3d,preguntas", f"cuerpo en el orden configurado ({orden})")
    ok(pg.locator("#app h2").count() >= 6 and pg.locator("#app h1").count() == 1, "cada sección con su título")
    pg.screenshot(path=f"{OUT}/inicio.png", full_page=True)
    pg.click(".promo >> nth=1"); pg.wait_for_selector(".producto")
    ok("falda" in pg.url and pg.locator(".producto__nombre").count() == 1, "un destacado abre su producto")
    pg.goto(URL + "?ver=tienda"); pg.wait_for_selector(".rejilla .tarjeta")
    ok(pg.locator(".tarjeta__meta").first.is_visible() and not pg.locator(".tarjeta__accion").first.is_visible(), "tarjeta deportiva en el catálogo")
    m = b.new_page(viewport={"width": 390, "height": 844}); m.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())
    for ruta in ["", "?ver=tienda", "?ver=producto&id=falda-tul", "?ver=carrito"]:
        m.goto(URL + ruta); m.wait_for_timeout(400)
        ok(m.evaluate("document.documentElement.scrollWidth") <= 390, f"390px {ruta or 'inicio'}: sin scroll horizontal")
    m.goto(URL); m.wait_for_timeout(400); m.screenshot(path=f"{OUT}/movil.png", full_page=True)
    ok(not errs, "sin errores de consola" + ("" if not errs else ": " + " | ".join(errs[:3])))
    b.close()
print(f"\n{'TODO OK' if not fallas else str(fallas) + ' FALLAS'}")
sys.exit(1 if fallas else 0)
