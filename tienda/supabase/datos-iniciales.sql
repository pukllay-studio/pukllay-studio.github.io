-- Datos iniciales (generado por tools/semilla.js). Ejecutar después de esquema.sql.
insert into colores (nombre, hex) values
('negro', '#1d1c1f'),
('blanco', '#f7f5f0'),
('piel', '#d8b39a'),
('durazno', '#f4a97e'),
('rosado', '#e7a0bd'),
('fucsia', '#d1336f'),
('rojo', '#c8262f'),
('lila', '#bba6dd'),
('celeste', '#8cc5ee'),
('turquesa', '#22b5c6'),
('azul', '#1f4fa8'),
('verde', '#7fb04f'),
('verde-agua', '#8fc4b0'),
('amarillo', '#efc93a'),
('plateado', '#c3c4c6');
insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values ('ballet', 'Ballet y danza', true, 1, false, 'Las tallas numéricas (4 a 16) son de niña; XS a XXG son de adulta. Si tienes dudas, escríbenos con la edad y estatura y te recomendamos la talla.');
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('ballet-bodies', 'Leotardos y maillots', 'ballet', true, 0, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('ballet-pantys', 'Medias y pantys', 'ballet', true, 1, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('ballet-faldas', 'Faldas, tutús y vestidos', 'ballet', true, 2, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('ballet-conjuntos', 'Conjuntos', 'ballet', true, 3, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('ballet-entrenamiento', 'Ropa de entrenamiento', 'ballet', true, 4, null);
insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values ('zapatillas', 'Zapatillas de ballet', true, 2, true, 'Tallas peruanas de la 24 a la 40. No convertimos tallas de otros países sin una tabla validada: si dudas, envíanos por WhatsApp el largo del pie en centímetros y te orientamos.');
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('zapatillas-media-punta', 'Zapatillas de media punta', 'zapatillas', true, 0, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('zapatillas-punta', 'Zapatillas de punta', 'zapatillas', true, 1, 'Las zapatillas de punta deben elegirse con la orientación de tu profesora o profesor de danza. No recomendamos una talla solo con un cuestionario.');
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('zapatillas-caracter', 'Zapatos de carácter', 'zapatillas', true, 2, null);
insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values ('accesorios', 'Accesorios', true, 4, false, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('accesorios-medias', 'Medias', 'accesorios', true, 0, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('accesorios-protectores', 'Protectores para zapatillas', 'accesorios', true, 1, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('accesorios-cabello', 'Accesorios para el cabello', 'accesorios', true, 2, null);
insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values ('moda', 'Moda y ropa', false, 4, false, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-polos-y-camisetas', 'Polos y camisetas', 'moda', true, 0, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-blusas', 'Blusas', 'moda', true, 1, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-camisas', 'Camisas', 'moda', true, 2, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-pantalones', 'Pantalones', 'moda', true, 3, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-jeans', 'Jeans', 'moda', true, 4, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-leggings', 'Leggings', 'moda', true, 5, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-shorts', 'Shorts', 'moda', true, 6, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-faldas', 'Faldas', 'moda', true, 7, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-vestidos', 'Vestidos', 'moda', true, 8, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-chaquetas', 'Chaquetas', 'moda', true, 9, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-casacas', 'Casacas', 'moda', true, 10, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-abrigos', 'Abrigos', 'moda', true, 11, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-sudaderas-y-poleras', 'Sudaderas y poleras', 'moda', true, 12, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-deportiva', 'Ropa deportiva', 'moda', true, 13, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-casual', 'Ropa casual', 'moda', true, 14, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-interior', 'Ropa interior', 'moda', true, 15, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-para-mujer', 'Ropa para mujer', 'moda', true, 16, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-para-hombre', 'Ropa para hombre', 'moda', true, 17, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-ropa-infantil', 'Ropa infantil', 'moda', true, 18, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('moda-accesorios-de-moda', 'Accesorios de moda', 'moda', true, 19, null);
insert into categorias (id, nombre, visible, orden, calzado, guia_tallas) values ('karate', 'Artes marciales', true, 3, false, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-uniformes', 'Uniformes', 'karate', true, 0, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-karateguis-para-principiantes', 'Karateguis para principiantes', 'karate', true, 1, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-karateguis-para-entrenamiento', 'Karateguis para entrenamiento', 'karate', true, 2, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-karateguis-para-competicion', 'Karateguis para competición', 'karate', true, 3, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-uniformes-infantiles', 'Uniformes infantiles', 'karate', true, 4, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-uniformes-para-adultos', 'Uniformes para adultos', 'karate', true, 5, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-cinturones', 'Cinturones', 'karate', true, 6, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-protectores-bucales', 'Protectores bucales', 'karate', true, 7, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-guantes-de-proteccion', 'Guantes de protección', 'karate', true, 8, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-espinilleras', 'Espinilleras', 'karate', true, 9, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-protectores-de-empeine', 'Protectores de empeine', 'karate', true, 10, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-protectores-corporales', 'Protectores corporales', 'karate', true, 11, null);
insert into categorias (id, nombre, padre, visible, orden, advertencia) values ('karate-bolsos-deportivos', 'Bolsos deportivos', 'karate', true, 12, null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('body-manga-larga', 'DA-BML', 'Body manga larga', 'ballet', 'ballet-bodies', 'Body de manga larga y cuello clásico, en algodón licrado. Tiene broches. Tallas de niña de la 4 a la 16 y de adulta S, M y L.', 'Algodón licrado', 'bodyLarga', 25, array['Niña','Adulta']::text[], null, null, array['4','6','8','10','12','14','16','S','M','L']::text[], array['negro','blanco','durazno','lila','rosado','celeste','verde']::text[], 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-manga-larga', 'img/body-ml-negro.webp', 'r', 1200, 947, 'negro', 1);
insert into variantes (producto_id, talla, color, stock) values
('body-manga-larga', '4', 'negro', null),
('body-manga-larga', '4', 'blanco', null),
('body-manga-larga', '4', 'durazno', null),
('body-manga-larga', '4', 'lila', null),
('body-manga-larga', '4', 'rosado', null),
('body-manga-larga', '4', 'celeste', null),
('body-manga-larga', '4', 'verde', null),
('body-manga-larga', '6', 'negro', null),
('body-manga-larga', '6', 'blanco', null),
('body-manga-larga', '6', 'durazno', null),
('body-manga-larga', '6', 'lila', null),
('body-manga-larga', '6', 'rosado', null),
('body-manga-larga', '6', 'celeste', null),
('body-manga-larga', '6', 'verde', null),
('body-manga-larga', '8', 'negro', null),
('body-manga-larga', '8', 'blanco', null),
('body-manga-larga', '8', 'durazno', null),
('body-manga-larga', '8', 'lila', null),
('body-manga-larga', '8', 'rosado', null),
('body-manga-larga', '8', 'celeste', null),
('body-manga-larga', '8', 'verde', null),
('body-manga-larga', '10', 'negro', null),
('body-manga-larga', '10', 'blanco', null),
('body-manga-larga', '10', 'durazno', null),
('body-manga-larga', '10', 'lila', null),
('body-manga-larga', '10', 'rosado', null),
('body-manga-larga', '10', 'celeste', null),
('body-manga-larga', '10', 'verde', null),
('body-manga-larga', '12', 'negro', null),
('body-manga-larga', '12', 'blanco', null),
('body-manga-larga', '12', 'durazno', null),
('body-manga-larga', '12', 'lila', null),
('body-manga-larga', '12', 'rosado', null),
('body-manga-larga', '12', 'celeste', null),
('body-manga-larga', '12', 'verde', null),
('body-manga-larga', '14', 'negro', null),
('body-manga-larga', '14', 'blanco', null),
('body-manga-larga', '14', 'durazno', null),
('body-manga-larga', '14', 'lila', null),
('body-manga-larga', '14', 'rosado', null),
('body-manga-larga', '14', 'celeste', null),
('body-manga-larga', '14', 'verde', null),
('body-manga-larga', '16', 'negro', null),
('body-manga-larga', '16', 'blanco', null),
('body-manga-larga', '16', 'durazno', null),
('body-manga-larga', '16', 'lila', null),
('body-manga-larga', '16', 'rosado', null),
('body-manga-larga', '16', 'celeste', null),
('body-manga-larga', '16', 'verde', null),
('body-manga-larga', 'S', 'negro', null),
('body-manga-larga', 'S', 'blanco', null),
('body-manga-larga', 'S', 'durazno', null),
('body-manga-larga', 'S', 'lila', null),
('body-manga-larga', 'S', 'rosado', null),
('body-manga-larga', 'S', 'celeste', null),
('body-manga-larga', 'S', 'verde', null),
('body-manga-larga', 'M', 'negro', null),
('body-manga-larga', 'M', 'blanco', null),
('body-manga-larga', 'M', 'durazno', null),
('body-manga-larga', 'M', 'lila', null),
('body-manga-larga', 'M', 'rosado', null),
('body-manga-larga', 'M', 'celeste', null),
('body-manga-larga', 'M', 'verde', null),
('body-manga-larga', 'L', 'negro', null),
('body-manga-larga', 'L', 'blanco', null),
('body-manga-larga', 'L', 'durazno', null),
('body-manga-larga', 'L', 'lila', null),
('body-manga-larga', 'L', 'rosado', null),
('body-manga-larga', 'L', 'celeste', null),
('body-manga-larga', 'L', 'verde', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('body-manga-corta', 'DA-BMC', 'Body manga corta', 'ballet', 'ballet-bodies', 'Body de manga corta en algodón licrado, con broches. Tallas de niña de la 4 a la 16 y talla S.', 'Algodón licrado', 'bodyCorta', 20, array['Niña','Adulta']::text[], null, null, array['4','6','8','10','12','14','16','S']::text[], array['amarillo','verde-agua','durazno','lila','rosado','celeste','verde']::text[], 2);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-manga-corta', 'img/body-mc-amarillo.webp', 'r', 945, 1200, 'amarillo', 1);
insert into variantes (producto_id, talla, color, stock) values
('body-manga-corta', '4', 'amarillo', null),
('body-manga-corta', '4', 'verde-agua', null),
('body-manga-corta', '4', 'durazno', null),
('body-manga-corta', '4', 'lila', null),
('body-manga-corta', '4', 'rosado', null),
('body-manga-corta', '4', 'celeste', null),
('body-manga-corta', '4', 'verde', null),
('body-manga-corta', '6', 'amarillo', null),
('body-manga-corta', '6', 'verde-agua', null),
('body-manga-corta', '6', 'durazno', null),
('body-manga-corta', '6', 'lila', null),
('body-manga-corta', '6', 'rosado', null),
('body-manga-corta', '6', 'celeste', null),
('body-manga-corta', '6', 'verde', null),
('body-manga-corta', '8', 'amarillo', null),
('body-manga-corta', '8', 'verde-agua', null),
('body-manga-corta', '8', 'durazno', null),
('body-manga-corta', '8', 'lila', null),
('body-manga-corta', '8', 'rosado', null),
('body-manga-corta', '8', 'celeste', null),
('body-manga-corta', '8', 'verde', null),
('body-manga-corta', '10', 'amarillo', null),
('body-manga-corta', '10', 'verde-agua', null),
('body-manga-corta', '10', 'durazno', null),
('body-manga-corta', '10', 'lila', null),
('body-manga-corta', '10', 'rosado', null),
('body-manga-corta', '10', 'celeste', null),
('body-manga-corta', '10', 'verde', null),
('body-manga-corta', '12', 'amarillo', null),
('body-manga-corta', '12', 'verde-agua', null),
('body-manga-corta', '12', 'durazno', null),
('body-manga-corta', '12', 'lila', null),
('body-manga-corta', '12', 'rosado', null),
('body-manga-corta', '12', 'celeste', null),
('body-manga-corta', '12', 'verde', null),
('body-manga-corta', '14', 'amarillo', null),
('body-manga-corta', '14', 'verde-agua', null),
('body-manga-corta', '14', 'durazno', null),
('body-manga-corta', '14', 'lila', null),
('body-manga-corta', '14', 'rosado', null),
('body-manga-corta', '14', 'celeste', null),
('body-manga-corta', '14', 'verde', null),
('body-manga-corta', '16', 'amarillo', null),
('body-manga-corta', '16', 'verde-agua', null),
('body-manga-corta', '16', 'durazno', null),
('body-manga-corta', '16', 'lila', null),
('body-manga-corta', '16', 'rosado', null),
('body-manga-corta', '16', 'celeste', null),
('body-manga-corta', '16', 'verde', null),
('body-manga-corta', 'S', 'amarillo', null),
('body-manga-corta', 'S', 'verde-agua', null),
('body-manga-corta', 'S', 'durazno', null),
('body-manga-corta', 'S', 'lila', null),
('body-manga-corta', 'S', 'rosado', null),
('body-manga-corta', 'S', 'celeste', null),
('body-manga-corta', 'S', 'verde', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('pantys-algodon', 'DA-PAN', 'Pantys de algodón', 'ballet', 'ballet-pantys', 'Pantys de algodón licrado para clase. Tallas de niña de la 4 a la 16 y de adulta S, M y L.', 'Algodón licrado', 'pantys', 18, array['Niña','Adulta']::text[], null, null, array['4','6','8','10','12','14','16','S','M','L']::text[], array['rosado','blanco','negro','durazno','lila','celeste']::text[], 3);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('pantys-algodon', 'img/pantys-rosado.webp', 'r', 871, 1083, 'rosado', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('pantys-algodon', 'img/pantys-blanco.webp', 'r', 770, 1131, 'blanco', 2);
insert into variantes (producto_id, talla, color, stock) values
('pantys-algodon', '4', 'rosado', null),
('pantys-algodon', '4', 'blanco', null),
('pantys-algodon', '4', 'negro', null),
('pantys-algodon', '4', 'durazno', null),
('pantys-algodon', '4', 'lila', null),
('pantys-algodon', '4', 'celeste', null),
('pantys-algodon', '6', 'rosado', null),
('pantys-algodon', '6', 'blanco', null),
('pantys-algodon', '6', 'negro', null),
('pantys-algodon', '6', 'durazno', null),
('pantys-algodon', '6', 'lila', null),
('pantys-algodon', '6', 'celeste', null),
('pantys-algodon', '8', 'rosado', null),
('pantys-algodon', '8', 'blanco', null),
('pantys-algodon', '8', 'negro', null),
('pantys-algodon', '8', 'durazno', null),
('pantys-algodon', '8', 'lila', null),
('pantys-algodon', '8', 'celeste', null),
('pantys-algodon', '10', 'rosado', null),
('pantys-algodon', '10', 'blanco', null),
('pantys-algodon', '10', 'negro', null),
('pantys-algodon', '10', 'durazno', null),
('pantys-algodon', '10', 'lila', null),
('pantys-algodon', '10', 'celeste', null),
('pantys-algodon', '12', 'rosado', null),
('pantys-algodon', '12', 'blanco', null),
('pantys-algodon', '12', 'negro', null),
('pantys-algodon', '12', 'durazno', null),
('pantys-algodon', '12', 'lila', null),
('pantys-algodon', '12', 'celeste', null),
('pantys-algodon', '14', 'rosado', null),
('pantys-algodon', '14', 'blanco', null),
('pantys-algodon', '14', 'negro', null),
('pantys-algodon', '14', 'durazno', null),
('pantys-algodon', '14', 'lila', null),
('pantys-algodon', '14', 'celeste', null),
('pantys-algodon', '16', 'rosado', null),
('pantys-algodon', '16', 'blanco', null),
('pantys-algodon', '16', 'negro', null),
('pantys-algodon', '16', 'durazno', null),
('pantys-algodon', '16', 'lila', null),
('pantys-algodon', '16', 'celeste', null),
('pantys-algodon', 'S', 'rosado', null),
('pantys-algodon', 'S', 'blanco', null),
('pantys-algodon', 'S', 'negro', null),
('pantys-algodon', 'S', 'durazno', null),
('pantys-algodon', 'S', 'lila', null),
('pantys-algodon', 'S', 'celeste', null),
('pantys-algodon', 'M', 'rosado', null),
('pantys-algodon', 'M', 'blanco', null),
('pantys-algodon', 'M', 'negro', null),
('pantys-algodon', 'M', 'durazno', null),
('pantys-algodon', 'M', 'lila', null),
('pantys-algodon', 'M', 'celeste', null),
('pantys-algodon', 'L', 'rosado', null),
('pantys-algodon', 'L', 'blanco', null),
('pantys-algodon', 'L', 'negro', null),
('pantys-algodon', 'L', 'durazno', null),
('pantys-algodon', 'L', 'lila', null),
('pantys-algodon', 'L', 'celeste', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('falda-tul', 'DA-FTU', 'Falda de tul', 'ballet', 'ballet-faldas', 'Falda de tul ligero con varias capas que le dan volumen y movimiento. Cintura cómoda y ajuste seguro, para clases y presentaciones.', null, 'falda', 15, array['Niña']::text[], null, null, array['4-6','8-10','12-14','16']::text[], array['rosado','lila','verde','blanco','durazno','celeste']::text[], 4);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('falda-tul', 'img/falda-rosado.webp', 'r', 1200, 1055, 'rosado', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('falda-tul', 'img/falda-lila.webp', 'r', 1200, 869, 'lila', 2);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('falda-tul', 'img/falda-verde.webp', 'r', 1200, 1079, 'verde', 3);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('falda-tul', 'img/faldas-tienda.webp', 'e', 1200, 1200, null, 4);
insert into variantes (producto_id, talla, color, stock) values
('falda-tul', '4-6', 'rosado', null),
('falda-tul', '4-6', 'lila', null),
('falda-tul', '4-6', 'verde', null),
('falda-tul', '4-6', 'blanco', null),
('falda-tul', '4-6', 'durazno', null),
('falda-tul', '4-6', 'celeste', null),
('falda-tul', '8-10', 'rosado', null),
('falda-tul', '8-10', 'lila', null),
('falda-tul', '8-10', 'verde', null),
('falda-tul', '8-10', 'blanco', null),
('falda-tul', '8-10', 'durazno', null),
('falda-tul', '8-10', 'celeste', null),
('falda-tul', '12-14', 'rosado', null),
('falda-tul', '12-14', 'lila', null),
('falda-tul', '12-14', 'verde', null),
('falda-tul', '12-14', 'blanco', null),
('falda-tul', '12-14', 'durazno', null),
('falda-tul', '12-14', 'celeste', null),
('falda-tul', '16', 'rosado', null),
('falda-tul', '16', 'lila', null),
('falda-tul', '16', 'verde', null),
('falda-tul', '16', 'blanco', null),
('falda-tul', '16', 'durazno', null),
('falda-tul', '16', 'celeste', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('vestido-tul', 'DA-VTU', 'Vestido de ballet con tul', 'ballet', 'ballet-faldas', 'Vestido con falda de tul y lazo. Consúltanos precio, tallas y colores por WhatsApp.', null, 'conjunto', null, array['Niña']::text[], null, null, array[]::text[], array['rojo','verde','negro','durazno','lila','rosado','celeste','blanco']::text[], 5);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('vestido-tul', 'img/vestidos-tul.webp', 'r', 1200, 1139, null, 1);
insert into variantes (producto_id, talla, color, stock) values
('vestido-tul', '', 'rojo', null),
('vestido-tul', '', 'verde', null),
('vestido-tul', '', 'negro', null),
('vestido-tul', '', 'durazno', null),
('vestido-tul', '', 'lila', null),
('vestido-tul', '', 'rosado', null),
('vestido-tul', '', 'celeste', null),
('vestido-tul', '', 'blanco', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('conjunto-completo', 'DA-CON', 'Conjunto completo', 'ballet', 'ballet-conjuntos', 'Conjunto de ballet para niña. Tallas por rango: 4-6, 8-10, 12-14 y 16. Te confirmamos por WhatsApp las piezas que incluye.', null, 'conjunto', 65, array['Niña']::text[], null, null, array['4-6','8-10','12-14','16']::text[], array['celeste','amarillo','rosado','fucsia','negro','durazno','rojo','azul','blanco']::text[], 6);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-completo', 'img/conjunto-celeste.webp', 'r', 626, 1188, 'celeste', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-completo', 'img/conjunto-amarillo.webp', 'r', 710, 1200, 'amarillo', 2);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-completo', 'img/conjunto-celeste-set.webp', 'r', 1200, 1193, null, 3);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-completo', 'img/conjunto-rosado-set.webp', 'r', 883, 1132, 'rosado', 4);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-completo', 'img/conjunto-fucsia-set.webp', 'r', 1200, 998, 'fucsia', 5);
insert into variantes (producto_id, talla, color, stock) values
('conjunto-completo', '4-6', 'celeste', null),
('conjunto-completo', '4-6', 'amarillo', null),
('conjunto-completo', '4-6', 'rosado', null),
('conjunto-completo', '4-6', 'fucsia', null),
('conjunto-completo', '4-6', 'negro', null),
('conjunto-completo', '4-6', 'durazno', null),
('conjunto-completo', '4-6', 'rojo', null),
('conjunto-completo', '4-6', 'azul', null),
('conjunto-completo', '4-6', 'blanco', null),
('conjunto-completo', '8-10', 'celeste', null),
('conjunto-completo', '8-10', 'amarillo', null),
('conjunto-completo', '8-10', 'rosado', null),
('conjunto-completo', '8-10', 'fucsia', null),
('conjunto-completo', '8-10', 'negro', null),
('conjunto-completo', '8-10', 'durazno', null),
('conjunto-completo', '8-10', 'rojo', null),
('conjunto-completo', '8-10', 'azul', null),
('conjunto-completo', '8-10', 'blanco', null),
('conjunto-completo', '12-14', 'celeste', null),
('conjunto-completo', '12-14', 'amarillo', null),
('conjunto-completo', '12-14', 'rosado', null),
('conjunto-completo', '12-14', 'fucsia', null),
('conjunto-completo', '12-14', 'negro', null),
('conjunto-completo', '12-14', 'durazno', null),
('conjunto-completo', '12-14', 'rojo', null),
('conjunto-completo', '12-14', 'azul', null),
('conjunto-completo', '12-14', 'blanco', null),
('conjunto-completo', '16', 'celeste', null),
('conjunto-completo', '16', 'amarillo', null),
('conjunto-completo', '16', 'rosado', null),
('conjunto-completo', '16', 'fucsia', null),
('conjunto-completo', '16', 'negro', null),
('conjunto-completo', '16', 'durazno', null),
('conjunto-completo', '16', 'rojo', null),
('conjunto-completo', '16', 'azul', null),
('conjunto-completo', '16', 'blanco', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('body-gimnasia', 'DA-BGI', 'Body de gimnasia', 'ballet', 'ballet-entrenamiento', 'Body de gimnasia con brillo plateado en el pecho. Tallas XS, S y M.', null, 'bodyGim', 40, array['Niña','Adulta']::text[], null, null, array['XS','S','M']::text[], array['lila','turquesa','durazno','negro','rosado','azul','verde']::text[], 7);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-gimnasia', 'img/gimnasia-lila.webp', 'r', 761, 1200, 'lila', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-gimnasia', 'img/gimnasia-turquesa.webp', 'r', 792, 1200, 'turquesa', 2);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-gimnasia', 'img/gimnasia-durazno.webp', 'r', 811, 1200, 'durazno', 3);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('body-gimnasia', 'img/gimnasia-grupo.webp', 'r', 659, 1200, null, 4);
insert into variantes (producto_id, talla, color, stock) values
('body-gimnasia', 'XS', 'lila', null),
('body-gimnasia', 'XS', 'turquesa', null),
('body-gimnasia', 'XS', 'durazno', null),
('body-gimnasia', 'XS', 'negro', null),
('body-gimnasia', 'XS', 'rosado', null),
('body-gimnasia', 'XS', 'azul', null),
('body-gimnasia', 'XS', 'verde', null),
('body-gimnasia', 'S', 'lila', null),
('body-gimnasia', 'S', 'turquesa', null),
('body-gimnasia', 'S', 'durazno', null),
('body-gimnasia', 'S', 'negro', null),
('body-gimnasia', 'S', 'rosado', null),
('body-gimnasia', 'S', 'azul', null),
('body-gimnasia', 'S', 'verde', null),
('body-gimnasia', 'M', 'lila', null),
('body-gimnasia', 'M', 'turquesa', null),
('body-gimnasia', 'M', 'durazno', null),
('body-gimnasia', 'M', 'negro', null),
('body-gimnasia', 'M', 'rosado', null),
('body-gimnasia', 'M', 'azul', null),
('body-gimnasia', 'M', 'verde', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('conjunto-deportivo', 'DA-CDE', 'Conjunto deportivo', 'karate', 'karate-uniformes', 'Conjunto de chaqueta y pantalón para artes marciales. Tela elástica de buena calidad para cualquier actividad física. Tallas de XS a XXG.', null, 'deportivo', 120, array['Niña','Adulta']::text[], null, null, array['XS','S','M','G','XG','XXG']::text[], array['blanco','negro']::text[], 8);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-deportivo', 'img/deportivo-uniforme.webp', 'r', 504, 1158, null, 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('conjunto-deportivo', 'img/deportivo-trio.webp', 'r', 896, 725, 'blanco', 2);
insert into variantes (producto_id, talla, color, stock) values
('conjunto-deportivo', 'XS', 'blanco', null),
('conjunto-deportivo', 'XS', 'negro', null),
('conjunto-deportivo', 'S', 'blanco', null),
('conjunto-deportivo', 'S', 'negro', null),
('conjunto-deportivo', 'M', 'blanco', null),
('conjunto-deportivo', 'M', 'negro', null),
('conjunto-deportivo', 'G', 'blanco', null),
('conjunto-deportivo', 'G', 'negro', null),
('conjunto-deportivo', 'XG', 'blanco', null),
('conjunto-deportivo', 'XG', 'negro', null),
('conjunto-deportivo', 'XXG', 'blanco', null),
('conjunto-deportivo', 'XXG', 'negro', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('zapatilla-lona', 'DA-ZLO', 'Zapatilla de lona', 'zapatillas', 'zapatillas-media-punta', 'Zapatilla de media punta de lona con suela partida. Tallas de la 24 a la 40. Consúltanos precio y stock.', 'Lona', 'zapatilla', null, array[]::text[], 'Talla peruana', null, array['24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40']::text[], array['rosado']::text[], 9);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-lona', 'img/zapatilla-lona-par.webp', 'r', 1038, 1200, 'rosado', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-lona', 'img/zapatilla-lona.webp', 'r', 948, 1200, null, 2);
insert into variantes (producto_id, talla, color, stock) values
('zapatilla-lona', '24', 'rosado', null),
('zapatilla-lona', '25', 'rosado', null),
('zapatilla-lona', '26', 'rosado', null),
('zapatilla-lona', '27', 'rosado', null),
('zapatilla-lona', '28', 'rosado', null),
('zapatilla-lona', '29', 'rosado', null),
('zapatilla-lona', '30', 'rosado', null),
('zapatilla-lona', '31', 'rosado', null),
('zapatilla-lona', '32', 'rosado', null),
('zapatilla-lona', '33', 'rosado', null),
('zapatilla-lona', '34', 'rosado', null),
('zapatilla-lona', '35', 'rosado', null),
('zapatilla-lona', '36', 'rosado', null),
('zapatilla-lona', '37', 'rosado', null),
('zapatilla-lona', '38', 'rosado', null),
('zapatilla-lona', '39', 'rosado', null),
('zapatilla-lona', '40', 'rosado', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('zapatilla-escarcha', 'DA-ZES', 'Zapatilla de escarcha', 'zapatillas', 'zapatillas-media-punta', 'Zapatilla de media punta con escarcha brillante. Tallas de la 24 a la 40. Consúltanos precio y stock.', null, 'zapatillaEscarcha', null, array[]::text[], 'Talla peruana', null, array['24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40']::text[], array['celeste']::text[], 10);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-escarcha', 'img/zapatilla-escarcha-par.webp', 'r', 1059, 1162, 'celeste', 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-escarcha', 'img/zapatilla-escarcha.webp', 'r', 1007, 1200, null, 2);
insert into variantes (producto_id, talla, color, stock) values
('zapatilla-escarcha', '24', 'celeste', null),
('zapatilla-escarcha', '25', 'celeste', null),
('zapatilla-escarcha', '26', 'celeste', null),
('zapatilla-escarcha', '27', 'celeste', null),
('zapatilla-escarcha', '28', 'celeste', null),
('zapatilla-escarcha', '29', 'celeste', null),
('zapatilla-escarcha', '30', 'celeste', null),
('zapatilla-escarcha', '31', 'celeste', null),
('zapatilla-escarcha', '32', 'celeste', null),
('zapatilla-escarcha', '33', 'celeste', null),
('zapatilla-escarcha', '34', 'celeste', null),
('zapatilla-escarcha', '35', 'celeste', null),
('zapatilla-escarcha', '36', 'celeste', null),
('zapatilla-escarcha', '37', 'celeste', null),
('zapatilla-escarcha', '38', 'celeste', null),
('zapatilla-escarcha', '39', 'celeste', null),
('zapatilla-escarcha', '40', 'celeste', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('zapatilla-plateada', 'DA-ZPL', 'Zapatilla plateada', 'zapatillas', 'zapatillas-media-punta', 'Zapatilla de media punta plateada. Tallas de la 24 a la 40. Consúltanos precio y stock.', null, 'zapatilla', null, array[]::text[], 'Talla peruana', null, array['24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40']::text[], array['plateado']::text[], 11);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-plateada', 'img/zapatilla-plateada.webp', 'r', 875, 1077, 'plateado', 1);
insert into variantes (producto_id, talla, color, stock) values
('zapatilla-plateada', '24', 'plateado', null),
('zapatilla-plateada', '25', 'plateado', null),
('zapatilla-plateada', '26', 'plateado', null),
('zapatilla-plateada', '27', 'plateado', null),
('zapatilla-plateada', '28', 'plateado', null),
('zapatilla-plateada', '29', 'plateado', null),
('zapatilla-plateada', '30', 'plateado', null),
('zapatilla-plateada', '31', 'plateado', null),
('zapatilla-plateada', '32', 'plateado', null),
('zapatilla-plateada', '33', 'plateado', null),
('zapatilla-plateada', '34', 'plateado', null),
('zapatilla-plateada', '35', 'plateado', null),
('zapatilla-plateada', '36', 'plateado', null),
('zapatilla-plateada', '37', 'plateado', null),
('zapatilla-plateada', '38', 'plateado', null),
('zapatilla-plateada', '39', 'plateado', null),
('zapatilla-plateada', '40', 'plateado', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('zapatilla-cuero-negro', 'DA-ZCN', 'Zapatilla de cuero negro', 'zapatillas', 'zapatillas-media-punta', 'Zapatilla de media punta de cuero negro. Tallas de la 24 a la 40. Consúltanos precio y stock.', 'Cuero', 'zapatilla', null, array[]::text[], 'Talla peruana', null, array['24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40']::text[], array['negro']::text[], 12);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('zapatilla-cuero-negro', 'img/zapatilla-cuero-negro.webp', 'r', 980, 1200, 'negro', 1);
insert into variantes (producto_id, talla, color, stock) values
('zapatilla-cuero-negro', '24', 'negro', null),
('zapatilla-cuero-negro', '25', 'negro', null),
('zapatilla-cuero-negro', '26', 'negro', null),
('zapatilla-cuero-negro', '27', 'negro', null),
('zapatilla-cuero-negro', '28', 'negro', null),
('zapatilla-cuero-negro', '29', 'negro', null),
('zapatilla-cuero-negro', '30', 'negro', null),
('zapatilla-cuero-negro', '31', 'negro', null),
('zapatilla-cuero-negro', '32', 'negro', null),
('zapatilla-cuero-negro', '33', 'negro', null),
('zapatilla-cuero-negro', '34', 'negro', null),
('zapatilla-cuero-negro', '35', 'negro', null),
('zapatilla-cuero-negro', '36', 'negro', null),
('zapatilla-cuero-negro', '37', 'negro', null),
('zapatilla-cuero-negro', '38', 'negro', null),
('zapatilla-cuero-negro', '39', 'negro', null),
('zapatilla-cuero-negro', '40', 'negro', null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('medias-antideslizantes', 'DA-MAN', 'Medias antideslizantes', 'accesorios', 'accesorios-medias', 'Medias con planta antideslizante y tiras cruzadas. Consúltanos precio, tallas y colores.', null, 'medias', null, array[]::text[], null, null, array[]::text[], array[]::text[], 13);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('medias-antideslizantes', 'img/medias-antideslizantes.webp', 'r', 1182, 1159, null, 1);
insert into variantes (producto_id, talla, color, stock) values
('medias-antideslizantes', '', null, null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('protector-metatarso', 'DA-PME', 'Protector de metatarso', 'accesorios', 'accesorios-protectores', 'Protector acolchado para la planta del pie. Consúltanos precio y modelos.', null, 'protector', null, array[]::text[], null, null, array[]::text[], array[]::text[], 14);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('protector-metatarso', 'img/protector-metatarso-pie.webp', 'r', 1128, 1124, null, 1);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('protector-metatarso', 'img/protector-metatarso.webp', 'r', 768, 827, null, 2);
insert into variantes (producto_id, talla, color, stock) values
('protector-metatarso', '', null, null);
insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, orden) values ('adorno-mono', 'DA-AMO', 'Adorno para el moño', 'accesorios', 'accesorios-cabello', 'Adorno de tul con cintas para el moño de ballet. Consúltanos precio y modelos.', null, 'mono', null, array[]::text[], null, null, array[]::text[], array[]::text[], 15);
insert into imagenes (producto_id, ruta, tipo, w, h, color, orden) values ('adorno-mono', 'img/adorno-mono.webp', 'r', 1050, 591, null, 1);
insert into variantes (producto_id, talla, color, stock) values
('adorno-mono', '', null, null);
