"""Extrae las fotos del catálogo PDF de DANZAAURA y las guarda en img/ como WebP livianas.
Uso: python3 tools/fotos.py catalogo-danzaaura.pdf   (requiere poppler-utils y Pillow)"""
import os, subprocess, sys, tempfile, glob
from PIL import Image, ImageOps

PDF = os.path.abspath(sys.argv[1]); RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, "img"); os.makedirs(OUT, exist_ok=True)
# nombre de salida: (imagen del PDF, máscara o None, lado máximo)
MAPA = {
  "pantys-rosado": ("003-003", None, 900), "pantys-blanco": ("003-004", None, 900),
  "gimnasia-lila": ("004-005", "004-006", 900), "gimnasia-turquesa": ("004-007", "004-008", 900),
  "gimnasia-durazno": ("004-009", "004-010", 900), "gimnasia-grupo": ("004-011", "004-012", 900),
  "deportivo-trio": ("006-014", None, 1000), "deportivo-uniforme": ("006-015", None, 900),
  "body-mc-amarillo": ("007-016", "007-017", 900), "body-ml-negro": ("007-018", "007-019", 900),
  "falda-verde": ("009-021", "009-022", 900), "falda-rosado": ("009-023", "009-024", 900),
  "faldas-tienda": ("009-025", None, 900), "falda-lila": ("010-026", "010-027", 900),
  "vestidos-tul": ("010-028", "010-029", 900),
  "conjunto-celeste-set": ("012-031", None, 900), "conjunto-rosado-set": ("012-032", None, 900),
  "conjunto-fucsia-set": ("012-033", None, 900), "conjunto-celeste": ("013-034", None, 900),
  "conjunto-amarillo": ("013-035", None, 900),
  "zapatilla-lona": ("014-037", "014-038", 900), "zapatilla-escarcha": ("014-039", "014-040", 900),
  "zapatilla-lona-par": ("015-041", None, 900), "zapatilla-plateada": ("015-042", None, 900),
  "zapatilla-escarcha-par": ("015-043", None, 900), "zapatilla-cuero-negro": ("015-044", None, 900),
  "protector-metatarso": ("017-046", None, 900), "medias-antideslizantes": ("017-047", None, 900),
  "adorno-mono": ("017-048", None, 900), "protector-metatarso-pie": ("017-049", None, 900),
  "bailarina-estudio": ("001-002", None, 1600), "nina-tutu": ("011-030", None, 1200),
}
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(["pdfimages", "-png", "-p", PDF, os.path.join(tmp, "x")], check=True)
    for nombre, (img, mask, lado) in MAPA.items():
        im = Image.open(os.path.join(tmp, f"x-{img}.png")).convert("RGB")
        if mask:
            m = Image.open(os.path.join(tmp, f"x-{mask}.png")).convert("L").resize(im.size)
            im = im.convert("RGBA"); im.putalpha(m)
            im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
        im.thumbnail((lado, lado), Image.LANCZOS)
        im.save(os.path.join(OUT, nombre + ".webp"), "WEBP", quality=80, method=6)
        print(f"{nombre}.webp {im.size[0]}x{im.size[1]}")
    # Logo: negro sobre gris -> negro con transparencia
    logo = Image.open(os.path.join(tmp, "x-001-001.png")).convert("L")
    alfa = ImageOps.invert(logo).point(lambda v: 0 if v < 60 else min(255, int((v - 60) * 1.6)))
    negro = Image.new("RGBA", logo.size, (27, 25, 23, 255)); negro.putalpha(alfa)
    negro = negro.crop(alfa.point(lambda a: 255 if a > 20 else 0).getbbox())
    negro.thumbnail((240, 240), Image.LANCZOS); negro.save(os.path.join(OUT, "logo.webp"), "WEBP", quality=90)
    negro.save(os.path.join(OUT, "logo.png")); print("logo", negro.size)
