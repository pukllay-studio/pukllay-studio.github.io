// Crea dist/vista-previa.html: un solo archivo (CSS y JS en línea) para ver la tienda sin servidor.
const fs = require("fs"), R = f => fs.readFileSync(__dirname + "/../" + f, "utf8");
let h = R("index.html");
h = h.replace(/<!--CSP-->[\s\S]*?<!--\/CSP-->/, "")
     .replace('<link rel="stylesheet" href="css/estilos.css">', "<style>\n" + R("css/estilos.css") + "\n</style>")
     .replace(/<script src="([^"]+)"><\/script>/g, (_, f) => "<script>\n" + R(f).replace(/<\/script/gi, "<\\/script") + "\n</script>")
     .replace(/<!doctype html>\s*/i, "").replace(/<\/?html[^>]*>|<\/?head>|<\/?body>/g, "")
     .replace(/<meta name="viewport"[^>]*>/, "");
fs.mkdirSync(__dirname + "/../dist", { recursive: true });
fs.writeFileSync(__dirname + "/../dist/vista-previa.html", h.trim() + "\n");
console.log("dist/vista-previa.html", (h.length / 1024).toFixed(0) + " KB");

// Documento completo de la tienda (para usarlo como página aparte dentro de la vista previa del editor)
let t = R("index.html").replace(/<!--CSP-->[\s\S]*?<!--\/CSP-->/, "")
  .replace('<link rel="stylesheet" href="css/estilos.css">', "<style>\n" + R("css/estilos.css") + "\n</style>")
  .replace(/<script src="([^"]+)"><\/script>/g, (_, f) => "<script>\n" + R(f).replace(/<\/script/gi, "<\\/script") + "\n</script>");
fs.writeFileSync(__dirname + "/../dist/tienda.html", t);

// Editor en un solo archivo; su vista previa carga tienda.html
let e = R("admin.html").replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "")
  .replace('<link rel="stylesheet" href="css/admin.css">', "<style>\n" + R("css/admin.css") + "\n</style>")
  .replace(/<script src="([^"]+)"><\/script>/g, (_, f) => "<script>\n" + R(f).replace(/<\/script/gi, "<\\/script") + "\n</script>")
  .replace(/src="index\.html"/g, 'src="tienda.html"').replace(/href="index\.html"/g, 'href="tienda.html"')
  .replace(/<!doctype html>\s*/i, "").replace(/<\/?html[^>]*>|<\/?head>|<\/?body>/g, "")
  .replace(/<meta name="viewport"[^>]*>/, "");
fs.writeFileSync(__dirname + "/../dist/editor.html", e.trim() + "\n");
console.log("dist/tienda.html y dist/editor.html listos");
