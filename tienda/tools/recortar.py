"""Quita el fondo de las fotos de producto (rembg, modelo isnet-general-use) para que todas
queden sobre el mismo fondo claro de la tienda. Uso: python3 tools/recortar.py
Guarda el original en img/originales/ la primera vez.
Las zapatillas de lona y el set celeste usan el modelo u2net (isnet confunde la prenda con el fondo)."""
import os, shutil
from PIL import Image
from rembg import new_session, remove

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(RAIZ, "img"); ORIG = os.path.join(IMG, "originales"); os.makedirs(ORIG, exist_ok=True)
FOTOS = ["conjunto-celeste", "conjunto-amarillo", "conjunto-rosado-set", "conjunto-fucsia-set",
         "zapatilla-escarcha-par", "zapatilla-escarcha", "zapatilla-plateada",
         "zapatilla-cuero-negro", "adorno-mono", "medias-antideslizantes", "protector-metatarso", "protector-metatarso-pie",
         "deportivo-uniforme", "deportivo-trio", "pantys-rosado", "pantys-blanco"]
sesion = new_session("isnet-general-use")
FOTOS_U2NET = ["zapatilla-lona-par", "zapatilla-lona", "conjunto-celeste-set"]
sesion_u2 = new_session("u2net")
for n in FOTOS + FOTOS_U2NET:
    src = os.path.join(IMG, n + ".webp"); copia = os.path.join(ORIG, n + ".webp")
    if not os.path.exists(copia): shutil.copy(src, copia)
    im = Image.open(copia).convert("RGB")
    out = remove(im, session=sesion_u2 if n in FOTOS_U2NET else sesion, post_process_mask=True)
    a = out.getchannel("A"); caja = a.point(lambda v: 255 if v > 12 else 0).getbbox()
    if caja:
        m = int(max(out.size) * 0.02)
        caja = (max(0, caja[0] - m), max(0, caja[1] - m), min(out.size[0], caja[2] + m), min(out.size[1], caja[3] + m))
        out = out.crop(caja)
    out.save(src, "WEBP", quality=82, method=6)
    print(n, out.size)
