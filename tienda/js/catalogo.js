/* Catálogo local (se usa mientras Supabase no esté configurado).
   Fuentes: bot-negocios/config/negocio.json (precios y tallas) y catalogo-danzaaura.pdf (fotos, materiales y colores).
   Las fotos salen del PDF con tools/fotos.py. tipo r = recorte sobre fondo claro, e = foto con su propio fondo.
   precio: null = "Precio a consultar". stock: null = se confirma por WhatsApp (no se inventa stock).
   Categorías con visible:false existen pero no se muestran hasta que tengan productos. */
window.DA_CATALOGO = {
  colores: {
    negro: "#1d1c1f", blanco: "#f7f5f0", piel: "#d8b39a", durazno: "#f4a97e", rosado: "#e7a0bd", fucsia: "#d1336f",
    rojo: "#c8262f", lila: "#bba6dd", celeste: "#8cc5ee", turquesa: "#22b5c6", azul: "#1f4fa8",
    verde: "#7fb04f", "verde-agua": "#8fc4b0", amarillo: "#efc93a", plateado: "#c3c4c6"
  },
  categorias: [
    { id: "ballet", nombre: "Ballet y danza", visible: true, orden: 1,
      guiaTallas: "Las tallas numéricas (4 a 16) son de niña; XS a XXG son de adulta. Si tienes dudas, escríbenos con la edad y estatura y te recomendamos la talla.",
      sub: [
        { id: "bodies", nombre: "Leotardos y maillots" },
        { id: "pantys", nombre: "Medias y pantys" },
        { id: "faldas", nombre: "Faldas, tutús y vestidos" },
        { id: "conjuntos", nombre: "Conjuntos" },
        { id: "entrenamiento", nombre: "Ropa de entrenamiento" }
      ] },
    { id: "zapatillas", nombre: "Zapatillas de ballet", visible: true, orden: 2, calzado: true,
      guiaTallas: "Tallas peruanas de la 24 a la 40. No convertimos tallas de otros países sin una tabla validada: si dudas, envíanos por WhatsApp el largo del pie en centímetros y te orientamos.",
      sub: [
        { id: "media-punta", nombre: "Zapatillas de media punta" },
        { id: "punta", nombre: "Zapatillas de punta", advertencia: "Las zapatillas de punta deben elegirse con la orientación de tu profesora o profesor de danza. No recomendamos una talla solo con un cuestionario." },
        { id: "caracter", nombre: "Zapatos de carácter" }
      ] },
    { id: "accesorios", nombre: "Accesorios", visible: true, orden: 4,
      sub: [
        { id: "medias", nombre: "Medias" },
        { id: "protectores", nombre: "Protectores para zapatillas" },
        { id: "cabello", nombre: "Accesorios para el cabello" }
      ] },
    { id: "moda", nombre: "Moda y ropa", visible: false, orden: 4,
      sub: ["Polos y camisetas","Blusas","Camisas","Pantalones","Jeans","Leggings","Shorts","Faldas","Vestidos","Chaquetas","Casacas","Abrigos","Sudaderas y poleras","Ropa deportiva","Ropa casual","Ropa interior","Ropa para mujer","Ropa para hombre","Ropa infantil","Accesorios de moda"]
        .map(function (n) { return { id: n.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim().replace(/ +/g, "-"), nombre: n }; }) },
    { id: "karate", nombre: "Artes marciales", visible: true, orden: 3,
      sub: [{ id: "uniformes", nombre: "Uniformes" }].concat(["Karateguis para principiantes","Karateguis para entrenamiento","Karateguis para competición","Uniformes infantiles","Uniformes para adultos","Cinturones","Protectores bucales","Guantes de protección","Espinilleras","Protectores de empeine","Protectores corporales","Bolsos deportivos"]
        .map(function (n) { return { id: n.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim().replace(/ +/g, "-"), nombre: n }; })) }
  ],
  productos: [
    { id: "body-manga-larga", sku: "DA-BML", nombre: "Body manga larga", cat: "ballet", sub: "bodies", dibujo: "bodyLarga",
      precio: 25, tallas: ["4","6","8","10","12","14","16","S","M","L"], publico: ["Niña","Adulta"], colores: ["negro","blanco","durazno","lila","rosado","celeste","verde"], stock: null, orden: 1, material: "Algodón licrado",
      fotos: [{ src: "img/body-ml-negro.webp", w: 1200, h: 947, tipo: "r", color: "negro" }],
      descripcion: "Body de manga larga y cuello clásico, en algodón licrado. Tiene broches. Tallas de niña de la 4 a la 16 y de adulta S, M y L." },
    { id: "body-manga-corta", sku: "DA-BMC", nombre: "Body manga corta", cat: "ballet", sub: "bodies", dibujo: "bodyCorta",
      precio: 20, tallas: ["4","6","8","10","12","14","16","S"], publico: ["Niña","Adulta"], colores: ["amarillo","verde-agua","durazno","lila","rosado","celeste","verde"], stock: null, orden: 2, material: "Algodón licrado",
      fotos: [{ src: "img/body-mc-amarillo.webp", w: 945, h: 1200, tipo: "r", color: "amarillo" }],
      descripcion: "Body de manga corta en algodón licrado, con broches. Tallas de niña de la 4 a la 16 y talla S." },
    { id: "pantys-algodon", sku: "DA-PAN", nombre: "Pantys de algodón", cat: "ballet", sub: "pantys", dibujo: "pantys",
      precio: 18, tallas: ["4","6","8","10","12","14","16","S","M","L"], publico: ["Niña","Adulta"], colores: ["rosado","blanco","negro","durazno","lila","celeste"], stock: null, orden: 3, material: "Algodón licrado",
      fotos: [{ src: "img/pantys-rosado.webp", w: 871, h: 1083, tipo: "r", color: "rosado" }, { src: "img/pantys-blanco.webp", w: 770, h: 1131, tipo: "r", color: "blanco" }],
      descripcion: "Pantys de algodón licrado para clase. Tallas de niña de la 4 a la 16 y de adulta S, M y L." },
    { id: "falda-tul", sku: "DA-FTU", nombre: "Falda de tul", cat: "ballet", sub: "faldas", dibujo: "falda",
      precio: 15, tallas: ["4-6","8-10","12-14","16"], publico: ["Niña"], colores: ["rosado","lila","verde","blanco","durazno","celeste"], stock: null, orden: 4,
      fotos: [{ src: "img/falda-rosado.webp", w: 1200, h: 1055, tipo: "r", color: "rosado" }, { src: "img/falda-lila.webp", w: 1200, h: 869, tipo: "r", color: "lila" }, { src: "img/falda-verde.webp", w: 1200, h: 1079, tipo: "r", color: "verde" }, { src: "img/faldas-tienda.webp", w: 1200, h: 1200, tipo: "e" }],
      descripcion: "Falda de tul ligero con varias capas que le dan volumen y movimiento. Cintura cómoda y ajuste seguro, para clases y presentaciones." },
    { id: "vestido-tul", sku: "DA-VTU", nombre: "Vestido de ballet con tul", cat: "ballet", sub: "faldas", dibujo: "conjunto",
      precio: null, tallas: [], publico: ["Niña"], colores: ["rojo","verde","negro","durazno","lila","rosado","celeste","blanco"], stock: null, orden: 5,
      fotos: [{ src: "img/vestidos-tul.webp", w: 1200, h: 1139, tipo: "r" }],
      descripcion: "Vestido con falda de tul y lazo. Consúltanos precio, tallas y colores por WhatsApp." },
    { id: "conjunto-completo", sku: "DA-CON", nombre: "Conjunto completo", cat: "ballet", sub: "conjuntos", dibujo: "conjunto",
      precio: 65, tallas: ["4-6","8-10","12-14","16"], publico: ["Niña"], colores: ["celeste","amarillo","rosado","fucsia","negro","durazno","rojo","azul","blanco"], stock: null, orden: 6,
      fotos: [{ src: "img/conjunto-celeste.webp", w: 626, h: 1188, tipo: "r", color: "celeste" }, { src: "img/conjunto-amarillo.webp", w: 710, h: 1200, tipo: "r", color: "amarillo" }, { src: "img/conjunto-celeste-set.webp", w: 1200, h: 1193, tipo: "r" }, { src: "img/conjunto-rosado-set.webp", w: 883, h: 1132, tipo: "r", color: "rosado" }, { src: "img/conjunto-fucsia-set.webp", w: 1200, h: 998, tipo: "r", color: "fucsia" }],
      descripcion: "Conjunto de ballet para niña. Tallas por rango: 4-6, 8-10, 12-14 y 16. Te confirmamos por WhatsApp las piezas que incluye." },
    { id: "body-gimnasia", sku: "DA-BGI", nombre: "Body de gimnasia", cat: "ballet", sub: "entrenamiento", dibujo: "bodyGim",
      precio: 40, tallas: ["XS","S","M"], publico: ["Niña","Adulta"], colores: ["lila","turquesa","durazno","negro","rosado","azul","verde"], stock: null, orden: 7,
      fotos: [{ src: "img/gimnasia-lila.webp", w: 761, h: 1200, tipo: "r", color: "lila" }, { src: "img/gimnasia-turquesa.webp", w: 792, h: 1200, tipo: "r", color: "turquesa" }, { src: "img/gimnasia-durazno.webp", w: 811, h: 1200, tipo: "r", color: "durazno" }, { src: "img/gimnasia-grupo.webp", w: 659, h: 1200, tipo: "r" }],
      descripcion: "Body de gimnasia con brillo plateado en el pecho. Tallas XS, S y M." },
    { id: "conjunto-deportivo", sku: "DA-CDE", nombre: "Conjunto deportivo", cat: "karate", sub: "uniformes", dibujo: "deportivo",
      precio: 120, tallas: ["XS","S","M","G","XG","XXG"], publico: ["Niña","Adulta"], colores: ["blanco","negro"], stock: null, orden: 8,
      fotos: [{ src: "img/deportivo-uniforme.webp", w: 504, h: 1158, tipo: "r" }, { src: "img/deportivo-trio.webp", w: 896, h: 725, tipo: "r", color: "blanco" }],
      descripcion: "Conjunto de chaqueta y pantalón para artes marciales. Tela elástica de buena calidad para cualquier actividad física. Tallas de XS a XXG." },
    { id: "zapatilla-lona", sku: "DA-ZLO", nombre: "Zapatilla de lona", cat: "zapatillas", sub: "media-punta", dibujo: "zapatilla",
      precio: null, tallas: rangoTallas(24, 40), publico: [], colores: ["rosado"], stock: null, orden: 9, material: "Lona", sistemaTalla: "Talla peruana",
      fotos: [{ src: "img/zapatilla-lona-par.webp", w: 1038, h: 1200, tipo: "r", color: "rosado" }, { src: "img/zapatilla-lona.webp", w: 948, h: 1200, tipo: "r" }],
      descripcion: "Zapatilla de media punta de lona con suela partida. Tallas de la 24 a la 40. Consúltanos precio y stock." },
    { id: "zapatilla-escarcha", sku: "DA-ZES", nombre: "Zapatilla de escarcha", cat: "zapatillas", sub: "media-punta", dibujo: "zapatillaEscarcha",
      precio: null, tallas: rangoTallas(24, 40), publico: [], colores: ["celeste"], stock: null, orden: 10, sistemaTalla: "Talla peruana",
      fotos: [{ src: "img/zapatilla-escarcha-par.webp", w: 1059, h: 1162, tipo: "r", color: "celeste" }, { src: "img/zapatilla-escarcha.webp", w: 1007, h: 1200, tipo: "r" }],
      descripcion: "Zapatilla de media punta con escarcha brillante. Tallas de la 24 a la 40. Consúltanos precio y stock." },
    { id: "zapatilla-plateada", sku: "DA-ZPL", nombre: "Zapatilla plateada", cat: "zapatillas", sub: "media-punta", dibujo: "zapatilla",
      precio: null, tallas: rangoTallas(24, 40), publico: [], colores: ["plateado"], stock: null, orden: 11, sistemaTalla: "Talla peruana",
      fotos: [{ src: "img/zapatilla-plateada.webp", w: 875, h: 1077, tipo: "r", color: "plateado" }],
      descripcion: "Zapatilla de media punta plateada. Tallas de la 24 a la 40. Consúltanos precio y stock." },
    { id: "zapatilla-cuero-negro", sku: "DA-ZCN", nombre: "Zapatilla de cuero negro", cat: "zapatillas", sub: "media-punta", dibujo: "zapatilla",
      precio: null, tallas: rangoTallas(24, 40), publico: [], colores: ["negro"], stock: null, orden: 12, material: "Cuero", sistemaTalla: "Talla peruana",
      fotos: [{ src: "img/zapatilla-cuero-negro.webp", w: 980, h: 1200, tipo: "r", color: "negro" }],
      descripcion: "Zapatilla de media punta de cuero negro. Tallas de la 24 a la 40. Consúltanos precio y stock." },
    { id: "medias-antideslizantes", sku: "DA-MAN", nombre: "Medias antideslizantes", cat: "accesorios", sub: "medias", dibujo: "medias",
      precio: null, tallas: [], publico: [], colores: [], stock: null, orden: 13,
      fotos: [{ src: "img/medias-antideslizantes.webp", w: 1182, h: 1159, tipo: "r" }],
      descripcion: "Medias con planta antideslizante y tiras cruzadas. Consúltanos precio, tallas y colores." },
    { id: "protector-metatarso", sku: "DA-PME", nombre: "Protector de metatarso", cat: "accesorios", sub: "protectores", dibujo: "protector",
      precio: null, tallas: [], publico: [], colores: [], stock: null, orden: 14,
      fotos: [{ src: "img/protector-metatarso-pie.webp", w: 1128, h: 1124, tipo: "r" }, { src: "img/protector-metatarso.webp", w: 768, h: 827, tipo: "r" }],
      descripcion: "Protector acolchado para la planta del pie. Consúltanos precio y modelos." },
    { id: "adorno-mono", sku: "DA-AMO", nombre: "Adorno para el moño", cat: "accesorios", sub: "cabello", dibujo: "mono",
      precio: null, tallas: [], publico: [], colores: [], stock: null, orden: 15,
      fotos: [{ src: "img/adorno-mono.webp", w: 1050, h: 591, tipo: "r" }],
      descripcion: "Adorno de tul con cintas para el moño de ballet. Consúltanos precio y modelos." }
  ]
};
function rangoTallas(a, b) { var t = []; for (var i = a; i <= b; i++) t.push(String(i)); return t; }
