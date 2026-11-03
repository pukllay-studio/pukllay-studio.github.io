/* ZIP mínimo sin compresión (método "store"), suficiente para descargar config, catálogo e imágenes. */
(function () {
  "use strict";
  var TABLA = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xffffffff; for (var i = 0; i < b.length; i++) c = TABLA[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function bytes(dato) {
    if (dato instanceof Uint8Array) return dato;
    if (typeof dato === "string" && /^data:[^;]+;base64,/.test(dato)) {
      var bin = atob(dato.split(",")[1]), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u;
    }
    return new TextEncoder().encode(String(dato));
  }
  function crear(archivos) { // [{ nombre, dato }]
    var partes = [], central = [], desp = 0, ahora = new Date();
    var hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
    var fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();
    archivos.forEach(function (a) {
      var nombre = new TextEncoder().encode(a.nombre), d = bytes(a.dato), crc = crc32(d);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, hora, true); lh.setUint16(12, fecha, true); lh.setUint32(14, crc, true); lh.setUint32(18, d.length, true); lh.setUint32(22, d.length, true);
      lh.setUint16(26, nombre.length, true); lh.setUint16(28, 0, true);
      partes.push(new Uint8Array(lh.buffer), nombre, d);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, hora, true); ch.setUint16(14, fecha, true); ch.setUint32(16, crc, true); ch.setUint32(20, d.length, true); ch.setUint32(24, d.length, true);
      ch.setUint16(28, nombre.length, true); ch.setUint32(42, desp, true);
      central.push(new Uint8Array(ch.buffer), nombre);
      desp += 30 + nombre.length + d.length;
    });
    var tamCentral = central.reduce(function (s, p) { return s + p.length; }, 0);
    var fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true);
    fin.setUint32(12, tamCentral, true); fin.setUint32(16, desp, true);
    return new Blob(partes.concat(central, [new Uint8Array(fin.buffer)]), { type: "application/zip" });
  }
  window.DA_ZIP = { crear: crear, crc32: crc32 };
})();
