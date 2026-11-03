"""Mejora la nitidez de las fotos con Real-ESRGAN x4plus (ncnn, CPU) y vuelve a quitar el fondo.
Uso: python3 tools/nitidez.py <carpeta_modelos_realesrgan> [nombre ...]
Toma img/originales/<nombre>.webp si existe (foto sin recortar); si no, img/<nombre>.webp."""
import os, sys, time
import numpy as np, ncnn
from PIL import Image, ImageFilter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(RAIZ, "img"); ORIG = os.path.join(IMG, "originales")
MODELOS = sys.argv[1]
LADO = 1200
RECORTE_ISNET = ["conjunto-celeste", "conjunto-amarillo", "conjunto-rosado-set", "conjunto-fucsia-set", "zapatilla-escarcha-par",
                 "zapatilla-escarcha", "zapatilla-plateada", "zapatilla-cuero-negro", "adorno-mono", "medias-antideslizantes",
                 "protector-metatarso", "protector-metatarso-pie", "deportivo-uniforme", "deportivo-trio", "pantys-rosado", "pantys-blanco"]
RECORTE_U2NET = ["zapatilla-lona-par", "zapatilla-lona", "conjunto-celeste-set"]
TODAS = RECORTE_ISNET + RECORTE_U2NET + ["body-ml-negro", "body-mc-amarillo", "gimnasia-lila", "gimnasia-turquesa", "gimnasia-durazno",
         "gimnasia-grupo", "falda-rosado", "falda-lila", "falda-verde", "vestidos-tul", "faldas-tienda", "nina-tutu"]

net = ncnn.Net(); net.opt.use_vulkan_compute = False; net.opt.num_threads = os.cpu_count() or 4
net.load_param(os.path.join(MODELOS, "realesrgan-x4plus.param")); net.load_model(os.path.join(MODELOS, "realesrgan-x4plus.bin"))

def x4(rgb, tile=192, pad=12):
    a = np.asarray(rgb, dtype=np.float32) / 255.0; h, w, _ = a.shape
    out = np.zeros((h * 4, w * 4, 3), dtype=np.float32)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad); y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            parte = np.ascontiguousarray(a[y0:y1, x0:x1].transpose(2, 0, 1))
            ex = net.create_extractor(); ex.input("data", ncnn.Mat(parte)); _, r = ex.extract("output")
            r = np.array(r).transpose(1, 2, 0)
            ty, tx = (y - y0) * 4, (x - x0) * 4; th, tw = (min(h, y + tile) - y) * 4, (min(w, x + tile) - x) * 4
            out[y * 4:y * 4 + th, x * 4:x * 4 + tw] = r[ty:ty + th, tx:tx + tw]
    return Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8))

sesiones = {}
def quitar_fondo(im, modelo):
    from rembg import new_session, remove
    if modelo not in sesiones: sesiones[modelo] = new_session(modelo)
    return remove(im, session=sesiones[modelo], post_process_mask=True)

nombres = sys.argv[2:] or TODAS
for n in nombres:
    t = time.time()
    src = os.path.join(ORIG, n + ".webp") if os.path.exists(os.path.join(ORIG, n + ".webp")) else os.path.join(IMG, n + ".webp")
    if not os.path.exists(os.path.join(ORIG, n + ".webp")):
        os.makedirs(ORIG, exist_ok=True); Image.open(src).save(os.path.join(ORIG, n + ".webp"), "WEBP", lossless=True)
    im = Image.open(src); alfa = im.getchannel("A") if im.mode == "RGBA" else None
    base = im.convert("RGB")
    if base.width * base.height > 700 * 700: base.thumbnail((700, 700), Image.LANCZOS)
    grande = x4(base)
    grande.thumbnail((LADO, LADO), Image.LANCZOS)
    if n in RECORTE_ISNET or n in RECORTE_U2NET:
        out = quitar_fondo(grande, "u2net" if n in RECORTE_U2NET else "isnet-general-use")
    elif alfa is not None:
        out = grande.convert("RGBA"); out.putalpha(alfa.resize(grande.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6)))
    else:
        out = grande
    if out.mode == "RGBA":
        c = out.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox(); m = int(max(out.size) * 0.02)
        if c: out = out.crop((max(0, c[0] - m), max(0, c[1] - m), min(out.size[0], c[2] + m), min(out.size[1], c[3] + m)))
    out.save(os.path.join(IMG, n + ".webp"), "WEBP", quality=84, method=6)
    print(f"{n} {out.size[0]}x{out.size[1]} {time.time() - t:.0f}s", flush=True)
