/* Configuración de la tienda. Todo lo que ve el cliente se edita aquí o desde el editor (admin.html).
   Para vender la plantilla a otro negocio basta con cambiar este archivo y catalogo.js (o usar el editor).
   Textos admiten marcadores: {marca} {whatsapp} {envio} {cambios} {pago} {precioMinimo}
   Fotos: "img/archivo.webp" o un producto del catálogo como "id-producto:color" (ej. "falda-tul:rosado").
   SEGURIDAD: aquí solo van datos públicos. Nunca pongas la service_role key ni contraseñas. */
window.DA_CONFIG = {
  marca: "DANZAAURA",
  moneda: "PEN",
  idioma: "es-PE",
  whatsapp: "51912443287",               // formato internacional sin "+"
  facebook: "https://www.facebook.com/www.ballet.afp/",
  instagram: "",
  tiktok: "",

  tema: {
    estilo: "deportivo",                 // "deportivo" (gran tienda) o "editorial" (boutique)
    logo: "img/logo.webp",               // vacío = solo el nombre
    nombreConLogo: true,                 // muestra el nombre al lado del logo
    fondo: "#ffffff", papel: "#ffffff", placa: "#eceff1",
    tinta: "#000000", suave: "#565656", acento: "#000000", oscuro: "#1b1b1b",
    destacado: "#f6c3d1",                // franja final y detalles
    fuenteTitulos: "Barlow Condensed",   // ver lista en js/temas.js
    fuenteTexto: "Barlow"
  },

  seo: {
    titulo: "Ropa y zapatillas de ballet",
    descripcion: "DANZAAURA: bodies, pantys, faldas de tul y zapatillas de ballet para niñas y adultas. Envíos a todo el Perú en 1 a 4 días hábiles."
  },

  anuncios: [
    "Envíos a todo el Perú en 1 a 4 días hábiles",
    "Pides por WhatsApp y coordinamos el pago contigo"
  ],

  hero: {
    titulo: "danzaaura",
    titular: "Hecho para bailar",         // titular del banner en el estilo deportivo
    subtitulo: "Ropa y zapatillas de ballet para niñas y adultas, con envío a todo el Perú.",
    boton1: { texto: "Explorar colección", destino: "?ver=tienda" },
    boton2: { texto: "Descubrir ballet y danza", destino: "?ver=tienda&cat=ballet" },
    imagen: "img/bailarina-estudio.webp",
    imagenAlt: "Bailarina en clase de ballet",
    datos: [
      { etiqueta: "Tallas", valor: "Niña 4 a 16 · Adulta XS a XXG" },
      { etiqueta: "Envío", valor: "Todo el Perú, 1 a 4 días hábiles" },
      { etiqueta: "Precios", valor: "Desde {precioMinimo}" }
    ]
  },

  // Secciones de la portada: true = se muestra
  secciones: { vitrina: true, listaPrecios: true, vitrina3d: true, categorias: true, combo: true, comoComprar: true, preguntas: true, contacto: true, carrusel: true, promos: true },

  // Estilo deportivo: carrusel de productos con pestañas por categoría
  carrusel: { titulo: "Explora la colección", todos: "Todo", verTodo: "Ver todo" },

  // Estilo deportivo: bloques destacados con foto (hasta 4)
  promos: {
    titulo: "",
    lista: [
      { titulo: "Zapatillas de media punta", texto: "Lona, escarcha, plateadas y cuero. Tallas 24 a 40.", foto: "zapatilla-lona:rosado", enlace: { texto: "Comprar", destino: "?ver=tienda&cat=zapatillas" } },
      { titulo: "Faldas de tul", texto: "Varias capas, mucho movimiento. Desde S/ 15.", foto: "falda-tul:lila", enlace: { texto: "Comprar", destino: "?ver=producto&id=falda-tul" } },
      { titulo: "Bodies de gimnasia", texto: "Con brillo plateado. Tallas XS a M.", foto: "body-gimnasia:turquesa", enlace: { texto: "Comprar", destino: "?ver=producto&id=body-gimnasia" } },
      { titulo: "Artes marciales", texto: "Uniformes de XS a XXG.", foto: "conjunto-deportivo", enlace: { texto: "Comprar", destino: "?ver=tienda&cat=karate" } }
    ]
  },

  // Estilo deportivo: franja de color antes del pie
  franja: { texto: "¿Dudas con la talla? Escríbenos y te ayudamos a elegir.", boton: "Escribir por WhatsApp" },

  vitrina: {
    titulo: "Elige modelo y color",
    productos: ["falda-tul", "conjunto-completo", "body-gimnasia"],
    enlace: { texto: "Ver ballet y danza", destino: "?ver=tienda&cat=ballet" }
  },

  listaPrecios: {
    titulo: "Lista de precios",
    nota: "Precios en soles. Coordinamos el envío por WhatsApp.",
    foto: "conjunto-completo:amarillo",
    fotoTexto: "Conjunto completo, desde la talla 4-6"
  },

  vitrina3d: {
    titulo: "Gira la vitrina",
    texto: "Arrastra para girar y toca una prenda para verla de cerca.",
    productos: ["body-manga-larga:negro", "falda-tul:rosado", "conjunto-completo:celeste", "zapatilla-lona:rosado",
                "body-gimnasia:lila", "body-manga-corta:amarillo", "zapatilla-escarcha:celeste", "conjunto-deportivo"]
  },

  categorias: {
    titulo: "Compra por categoría",
    portadas: { ballet: "conjunto-completo:celeste", zapatillas: "zapatilla-lona:rosado", karate: "conjunto-deportivo", accesorios: "medias-antideslizantes" }
  },

  // Combo: el cliente elige una talla y suma varias prendas (uniforme, pack, kit...)
  combo: {
    titulo: "Arma el uniforme de clase",
    intro: "Elige la talla una vez. Sumamos el body, las pantys y la falda con su talla correcta.",
    foto: "conjunto-completo:rosado",
    fotoAlt: "Body, pantys, falda de tul y zapatillas de ballet en rosado",
    etiquetaTalla: "Talla de la alumna",
    tallas: ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L"],
    piezas: [
      { nombre: "Body", productos: ["body-manga-larga", "body-manga-corta"], opcional: false, color: "negro" },
      { nombre: "Pantys de algodón", productos: ["pantys-algodon"], opcional: true, color: "rosado" },
      { nombre: "Falda de tul", productos: ["falda-tul"], opcional: true, color: "rosado",
        equivalencias: { "4": "4-6", "6": "4-6", "8": "8-10", "10": "8-10", "12": "12-14", "14": "12-14", "16": "16" } }
    ],
    nota: "¿También zapatillas? Tenemos de la talla 24 a la 40.",
    notaEnlace: { texto: "Ver zapatillas", destino: "?ver=tienda&cat=zapatillas" }
  },

  comoComprar: {
    titulo: "Así compras",
    filas: [
      { titulo: "Pides por WhatsApp", foto: "conjunto-completo:fucsia", puntos: ["Eliges prenda, talla y color aquí", "Envías el pedido con un toque", "Te respondemos para confirmar stock", "Coordinamos el pago contigo"] },
      { titulo: "Te llega a casa", foto: "zapatilla-plateada:plateado", puntos: ["Enviamos a todo el Perú", "De 1 a 4 días hábiles", "El plazo corre desde que confirmas el pago", "Por ahora no enviamos fuera del Perú"] },
      { titulo: "Si no te queda, la cambias", foto: "body-manga-corta:amarillo", puntos: ["La prenda debe estar como la recibiste", "Con sus etiquetas originales", "Llenas un breve formulario", "Te ayudamos por el mismo chat"] },
      { titulo: "Tallas para todas", foto: "pantys-algodon:rosado", puntos: ["Niña: de la 4 a la 16", "Adulta: de XS a XXG, según prenda", "Zapatillas: de la 24 a la 40", "Si dudas, te orientamos antes de pedir"] }
    ]
  },

  preguntas: {
    titulo: "Preguntas frecuentes",
    lista: [
      { p: "¿Cuánto demora el envío?", r: "De 1 a 4 días hábiles después de confirmar el pago, a cualquier ciudad del Perú." },
      { p: "¿Envían fuera del Perú?", r: "Todavía no. Solo hacemos envíos nacionales." },
      { p: "¿Cómo pago?", r: "{pago}" },
      { p: "¿Puedo cambiar una prenda?", r: "{cambios}" },
      { p: "¿Qué tallas tienen?", r: "Tallas de niña de la 4 a la 16 y de adulta de XS a XXG, según la prenda. Cada producto muestra sus tallas disponibles." },
      { p: "¿Y las zapatillas?", r: "Tenemos zapatillas de media punta en tallas 24 a 40: lona, escarcha, plateadas y de cuero negro. El precio y el stock se confirman por WhatsApp." },
      { p: "¿Qué colores hay?", r: "Negro, piel, rojo, azul, celeste, blanco, amarillo, rosado y más, según el producto." },
      { p: "¿Tienen accesorios?", r: "Sí: medias antideslizantes, protectores de metatarso y adornos para el moño." }
    ]
  },

  contacto: {
    frase: "Escríbenos por WhatsApp para pedir o preguntar por tallas y zapatillas.",
    pie: "Tienda en línea · Envíos a todo el Perú"
  },

  pie: {
    foto: "conjunto-completo:amarillo",
    nota: "El color de las fotos puede variar un poco según tu pantalla.",
    creditos: { texto: "", url: "" }      // ej. { texto: "Web hecha por Andy", url: "https://..." }
  },

  mensajes: {
    consulta: "Hola {marca}, quiero hacer una consulta.",
    consultaProducto: "Hola {marca}, quiero consultar por: ",
    pedido: "Hola {marca}, quiero hacer este pedido"
  },

  rangosPrecio: [20, 50],                // filtros: hasta 20, 20 a 50, más de 50

  envio: "Enviamos a todo el Perú. Tu pedido llega en 1 a 4 días hábiles después de confirmar el pago. No hacemos envíos internacionales.",
  cambios: "Aceptamos cambios o devoluciones si la prenda está en el mismo estado en que se entregó y con sus etiquetas originales. Antes te pediremos llenar un breve formulario.",
  pago: "Al confirmar tu pedido te escribimos por WhatsApp para coordinar el pago. No pedimos datos de tarjeta en esta web.",

  // Datos legales del proveedor (obligatorios en el Libro de Reclamaciones). COMPLETAR antes de publicar.
  empresa: { razonSocial: "", ruc: "", direccion: "", correo: "paitan-andy@hotmail.com" },
  // Enlace al Libro de Reclamaciones virtual gratuito de INDECOPI (recomendado). Vacío = formulario propio con Supabase.
  libroReclamacionesUrl: "",

  // Supabase (opcional). Solo URL y anon key PÚBLICA, protegidas por RLS. Vacío = catálogo local.
  supabase: { url: "", anonKey: "" }
};
