-- DANZAAURA · esquema Supabase (Postgres). Ejecutar completo en SQL Editor de un proyecto nuevo.
-- Principios: RLS en todas las tablas; el navegador solo usa la anon key; precios, stock y pedidos
-- se validan aquí (funciones SECURITY DEFINER), nunca con datos enviados por el cliente.

create extension if not exists pgcrypto;

-- ============ TABLAS ============
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);

create table public.colores (
  nombre text primary key check (nombre ~ '^[a-z][a-z-]{1,24}$'),
  hex text not null check (hex ~* '^#[0-9a-f]{6}$')
);

create table public.categorias (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  nombre text not null check (length(nombre) between 2 and 60),
  padre text references public.categorias(id) on delete restrict,
  visible boolean not null default true,
  orden int not null default 0,
  calzado boolean not null default false,
  guia_tallas text check (length(guia_tallas) <= 600),
  advertencia text check (length(advertencia) <= 300)   -- solo subcategorías
);

create table public.productos (
  id text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  sku text not null unique check (sku ~ '^[A-Z0-9-]{3,20}$'),
  nombre text not null check (length(nombre) between 2 and 80),
  categoria text not null references public.categorias(id),
  subcategoria text references public.categorias(id),
  descripcion text not null default '' check (length(descripcion) <= 1200),
  material text check (length(material) <= 120),
  marca text check (length(marca) <= 60),
  dibujo text not null default 'bodyCorta',
  precio numeric(10,2) check (precio is null or precio > 0),           -- null = a consultar
  precio_oferta numeric(10,2) check (precio_oferta is null or precio_oferta > 0),
  oferta_hasta timestamptz,
  publico text[] not null default '{}',
  sistema_talla text,
  guia_tallas text check (length(guia_tallas) <= 600),
  tallas text[] not null default '{}',     -- orden de presentación
  colores text[] not null default '{}',
  activo boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now(),
  check (precio_oferta is null or (precio is not null and precio_oferta < precio))
);

create table public.variantes (
  id uuid primary key default gen_random_uuid(),
  producto_id text not null references public.productos(id) on delete cascade,
  talla text not null default '' check (length(talla) <= 12),
  color text references public.colores(nombre),
  stock int check (stock is null or stock >= 0),                         -- null = se confirma por WhatsApp
  activo boolean not null default true,
  unique (producto_id, talla, color)
);

create table public.imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id text not null references public.productos(id) on delete cascade,
  ruta text not null check (ruta ~ '^(img/[a-z0-9-]+\.(webp|png|jpg)|https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/productos/[a-z0-9/_.-]+\.(webp|png|jpg))$'),
  tipo text not null default 'r' check (tipo in ('r','e')),
  w int check (w between 1 and 5000),
  h int check (h between 1 and 5000),
  alt text not null default '' check (length(alt) <= 160),
  color text references public.colores(nombre),
  orden int not null default 0
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  celular text not null,
  ciudad text not null,
  nota text not null default '',
  total numeric(10,2) not null,
  estado text not null default 'nuevo' check (estado in ('nuevo','confirmado','pagado','enviado','entregado','cancelado')),
  origen_hash text,                                                      -- hash de IP, nunca la IP en claro
  creado_en timestamptz not null default now()
);
create index on public.pedidos (celular, creado_en);
create index on public.pedidos (origen_hash, creado_en);

create table public.pedido_items (
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id text not null references public.productos(id),
  talla text not null default '',
  color text,
  cantidad int not null check (cantidad between 1 and 10),
  precio_unit numeric(10,2) not null
);

-- ============ PERMISOS (RLS) ============
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins       enable row level security;
alter table public.colores      enable row level security;
alter table public.categorias   enable row level security;
alter table public.productos    enable row level security;
alter table public.variantes    enable row level security;
alter table public.imagenes     enable row level security;
alter table public.pedidos      enable row level security;
alter table public.pedido_items enable row level security;

-- Lectura pública solo de lo activo/visible
create policy "ver colores"     on public.colores    for select using (true);
create policy "ver categorias"  on public.categorias for select using (visible or public.es_admin());
create policy "ver productos"   on public.productos  for select using (activo or public.es_admin());
create policy "ver variantes"   on public.variantes  for select using (activo or public.es_admin());
create policy "ver imagenes"    on public.imagenes   for select using (true);

-- Escritura solo admin
create policy "admin colores"    on public.colores    for all using (public.es_admin()) with check (public.es_admin());
create policy "admin categorias" on public.categorias for all using (public.es_admin()) with check (public.es_admin());
create policy "admin productos"  on public.productos  for all using (public.es_admin()) with check (public.es_admin());
create policy "admin variantes"  on public.variantes  for all using (public.es_admin()) with check (public.es_admin());
create policy "admin imagenes"   on public.imagenes   for all using (public.es_admin()) with check (public.es_admin());

-- Pedidos: nadie anónimo los lee ni inserta directo (solo vía crear_pedido). Admin lee y cambia estado.
create policy "admin lee pedidos"     on public.pedidos      for select using (public.es_admin());
create policy "admin edita pedidos"   on public.pedidos      for update using (public.es_admin()) with check (public.es_admin());
create policy "admin lee items"       on public.pedido_items for select using (public.es_admin());
create policy "admin ve admins"       on public.admins       for select using (public.es_admin());

revoke all on public.pedidos, public.pedido_items, public.admins from anon;
-- El admin solo puede cambiar el estado de un pedido, no montos ni datos del cliente
revoke update on public.pedidos from authenticated;
grant update (estado) on public.pedidos to authenticated;

-- ============ CATÁLOGO PÚBLICO (mismo formato que js/catalogo.js) ============
create or replace function public.catalogo_publico() returns json
language sql stable security invoker set search_path = public as $$
  select json_build_object(
    'colores', coalesce((select json_object_agg(nombre, hex) from colores), '{}'::json),
    'categorias', coalesce((
      select json_agg(json_build_object(
        'id', c.id, 'nombre', c.nombre, 'visible', c.visible, 'orden', c.orden,
        'calzado', c.calzado, 'guiaTallas', c.guia_tallas,
        'sub', coalesce((select json_agg(json_strip_nulls(json_build_object('id', s.id, 'nombre', s.nombre, 'advertencia', s.advertencia)) order by s.orden)
                         from categorias s where s.padre = c.id), '[]'::json)
      ) order by c.orden) from categorias c where c.padre is null), '[]'::json),
    'productos', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'sku', p.sku, 'nombre', p.nombre, 'cat', p.categoria, 'sub', p.subcategoria,
        'dibujo', p.dibujo, 'descripcion', p.descripcion, 'material', p.material, 'marca', p.marca,
        'precio', case when p.precio_oferta is not null and (p.oferta_hasta is null or p.oferta_hasta > now())
                       then p.precio_oferta else p.precio end,
        'precioAntes', case when p.precio_oferta is not null and (p.oferta_hasta is null or p.oferta_hasta > now())
                       then p.precio end,
        'publico', p.publico, 'sistemaTalla', p.sistema_talla, 'orden', p.orden,
        'fecha', extract(epoch from p.creado_en),
        'guiaTallas', p.guia_tallas,
        'tallas', to_json(p.tallas), 'colores', to_json(p.colores),
        'fotos', coalesce((select json_agg(json_build_object('src', i.ruta, 'w', i.w, 'h', i.h, 'tipo', i.tipo, 'color', i.color) order by i.orden)
                           from imagenes i where i.producto_id = p.id), '[]'::json),
        'stock', null
      ) order by p.orden) from productos p where p.activo), '[]'::json)
  );
$$;

-- ============ CREAR PEDIDO (precio, stock y límites en el servidor) ============
create or replace function public.crear_pedido(p_cliente jsonb, p_items jsonb, p_trampa text default '')
returns json language plpgsql security definer set search_path = public as $$
declare
  v_nombre text := btrim(regexp_replace(coalesce(p_cliente->>'nombre',''), '\s+', ' ', 'g'));
  v_cel    text := regexp_replace(coalesce(p_cliente->>'celular',''), '\D', '', 'g');
  v_ciudad text := btrim(regexp_replace(coalesce(p_cliente->>'ciudad',''), '\s+', ' ', 'g'));
  v_nota   text := left(btrim(coalesce(p_cliente->>'nota','')), 200);
  v_ip     text := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for',''), ',', 1);
  v_hash   text;
  v_item   jsonb;
  v_prod   productos%rowtype;
  v_var    variantes%rowtype;
  v_cant   int;
  v_precio numeric(10,2);
  v_total  numeric(10,2) := 0;
  v_id     uuid;
  v_codigo text;
begin
  if coalesce(p_trampa,'') <> '' then raise exception 'Solicitud rechazada.'; end if;
  if length(v_nombre) not between 2 and 60 then raise exception 'Nombre inválido.'; end if;
  if v_cel !~ '^9[0-9]{8}$' then raise exception 'Celular inválido.'; end if;
  if length(v_ciudad) not between 2 and 60 then raise exception 'Ciudad inválida.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'El pedido debe tener entre 1 y 20 productos.';
  end if;

  -- Límite de solicitudes: 3 pedidos por celular y 10 por origen cada hora
  v_hash := encode(digest(v_ip || 'danzaaura', 'sha256'), 'hex');
  if (select count(*) from pedidos where celular = v_cel and creado_en > now() - interval '1 hour') >= 3
     or (select count(*) from pedidos where origen_hash = v_hash and creado_en > now() - interval '1 hour') >= 10 then
    raise exception 'Demasiados pedidos seguidos. Escríbenos por WhatsApp.';
  end if;

  v_codigo := 'DA-' || to_char(now() at time zone 'America/Lima', 'YYMMDD') || '-' || upper(encode(gen_random_bytes(3), 'hex'));
  insert into pedidos (codigo, nombre, celular, ciudad, nota, total, origen_hash)
  values (v_codigo, v_nombre, v_cel, v_ciudad, v_nota, 0, v_hash) returning id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cant := (v_item->>'cantidad')::int;
    if v_cant is null or v_cant not between 1 and 10 then raise exception 'Cantidad inválida.'; end if;

    select * into v_prod from productos where id = v_item->>'producto' and activo;
    if not found or v_prod.precio is null then raise exception 'Producto no disponible para pedido en línea.'; end if;

    select * into v_var from variantes
     where producto_id = v_prod.id and activo
       and talla = coalesce(v_item->>'talla','')
       and color is not distinct from nullif(v_item->>'color','');
    if not found then raise exception 'La talla o el color de % no está disponible.', v_prod.nombre; end if;
    if v_var.stock is not null and v_var.stock < v_cant then
      raise exception 'Solo quedan % unidades de % en esa talla y color.', v_var.stock, v_prod.nombre;
    end if;

    v_precio := case when v_prod.precio_oferta is not null and (v_prod.oferta_hasta is null or v_prod.oferta_hasta > now())
                     then v_prod.precio_oferta else v_prod.precio end;
    insert into pedido_items (pedido_id, producto_id, talla, color, cantidad, precio_unit)
    values (v_id, v_prod.id, v_var.talla, v_var.color, v_cant, v_precio);
    v_total := v_total + v_precio * v_cant;
  end loop;

  update pedidos set total = v_total where id = v_id;
  return json_build_object('codigo', v_codigo, 'total', v_total);  -- solo lo necesario
end;
$$;

-- Confirmar pedido (admin): descuenta stock con bloqueo de filas para evitar sobreventa
create or replace function public.confirmar_pedido(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.es_admin() then raise exception 'No autorizado.'; end if;
  perform 1 from pedidos where id = p_id and estado = 'nuevo' for update;
  if not found then raise exception 'El pedido no existe o ya fue confirmado.'; end if;
  for r in select i.*, v.id as var_id, v.stock from pedido_items i
           join variantes v on v.producto_id = i.producto_id and v.talla = i.talla and v.color is not distinct from i.color
           where i.pedido_id = p_id for update of v loop
    if r.stock is not null then
      if r.stock < r.cantidad then raise exception 'Stock insuficiente para %.', r.producto_id; end if;
      update variantes set stock = stock - r.cantidad where id = r.var_id;
    end if;
  end loop;
  update pedidos set estado = 'confirmado' where id = p_id;
end;
$$;

revoke all on function public.crear_pedido(jsonb, jsonb, text) from public;
revoke all on function public.confirmar_pedido(uuid) from public;
grant execute on function public.crear_pedido(jsonb, jsonb, text) to anon, authenticated;
grant execute on function public.catalogo_publico() to anon, authenticated;
grant execute on function public.confirmar_pedido(uuid) to authenticated;

-- ============ FOTOS (Storage) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 3145728, array['image/webp','image/avif','image/jpeg','image/png'])
on conflict (id) do nothing;
create policy "fotos: admin sube"   on storage.objects for insert with check (bucket_id = 'productos' and public.es_admin());
create policy "fotos: admin cambia" on storage.objects for update using (bucket_id = 'productos' and public.es_admin());
create policy "fotos: admin borra"  on storage.objects for delete using (bucket_id = 'productos' and public.es_admin());

-- ============ LIBRO DE RECLAMACIONES ============
-- Antes de usarlo, guarda una clave larga en Vault (Dashboard > Project Settings > Vault, o por SQL):
--   select vault.create_secret('<clave-larga-aleatoria>', 'clave_datos');
-- Los datos personales (documento, domicilio, celular, correo) se guardan cifrados con esa clave.
create table public.reclamaciones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('reclamo','queja')),
  nombre text not null,
  tipo_doc text not null check (tipo_doc in ('DNI','CE','Pasaporte')),
  documento_cif bytea not null,
  domicilio_cif bytea not null,
  celular_cif bytea not null,
  correo_cif bytea not null,
  tutor text not null default '',
  producto text not null,
  pedido text not null default '',
  monto numeric(10,2),
  detalle text not null,
  solicitud text not null,
  estado text not null default 'recibido' check (estado in ('recibido','en_revision','respondido')),
  respuesta text not null default '',
  origen_hash text,
  creado_en timestamptz not null default now()
);
alter table public.reclamaciones enable row level security;
create policy "admin lee reclamos" on public.reclamaciones for select using (public.es_admin());
revoke all on public.reclamaciones from anon;
revoke update on public.reclamaciones from authenticated;
grant update (estado, respuesta) on public.reclamaciones to authenticated;
create policy "admin responde reclamos" on public.reclamaciones for update using (public.es_admin()) with check (public.es_admin());

create or replace function public.clave_datos() returns text
language sql stable security definer set search_path = public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'clave_datos' limit 1;
$$;
revoke all on function public.clave_datos() from public, anon, authenticated;

create or replace function public.registrar_reclamo(p_datos jsonb, p_trampa text default '')
returns json language plpgsql security definer set search_path = public as $$
declare
  v_tipo text := coalesce(p_datos->>'tipo', 'reclamo');
  v_nombre text := btrim(regexp_replace(coalesce(p_datos->>'nombre',''), '\s+', ' ', 'g'));
  v_tdoc text := coalesce(p_datos->>'tipoDoc', 'DNI');
  v_doc text := regexp_replace(coalesce(p_datos->>'documento',''), '\s', '', 'g');
  v_dom text := btrim(coalesce(p_datos->>'domicilio',''));
  v_cel text := regexp_replace(coalesce(p_datos->>'celular',''), '\D', '', 'g');
  v_correo text := lower(btrim(coalesce(p_datos->>'correo','')));
  v_det text := btrim(coalesce(p_datos->>'detalle',''));
  v_sol text := btrim(coalesce(p_datos->>'solicitud',''));
  v_prod text := coalesce(p_datos->>'producto','');
  v_monto numeric := nullif(p_datos->>'monto','')::numeric;
  v_ip text := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for',''), ',', 1);
  v_hash text := encode(digest(v_ip || 'danzaaura-libro', 'sha256'), 'hex');
  v_clave text := public.clave_datos();
  v_codigo text;
  v_ahora timestamptz := now();
begin
  if coalesce(p_trampa,'') <> '' then raise exception 'Solicitud rechazada.'; end if;
  if v_clave is null or length(v_clave) < 16 then raise exception 'El libro aún no está configurado.'; end if;
  if v_tipo not in ('reclamo','queja') then raise exception 'Tipo inválido.'; end if;
  if length(v_nombre) not between 3 and 80 then raise exception 'Nombre inválido.'; end if;
  if v_tdoc not in ('DNI','CE','Pasaporte') then raise exception 'Documento inválido.'; end if;
  if (v_tdoc = 'DNI' and v_doc !~ '^[0-9]{8}$') or (v_tdoc <> 'DNI' and v_doc !~ '^[A-Za-z0-9]{6,12}$') then raise exception 'Número de documento inválido.'; end if;
  if length(v_dom) not between 5 and 160 then raise exception 'Domicilio inválido.'; end if;
  if v_cel !~ '^9[0-9]{8}$' then raise exception 'Celular inválido.'; end if;
  if length(v_correo) > 120 or v_correo !~ '^[^\s@]+@[^\s@]+\.[a-z]{2,}$' then raise exception 'Correo inválido.'; end if;
  if v_prod <> 'OTRO' and not exists (select 1 from productos where sku = v_prod) then raise exception 'Producto inválido.'; end if;
  if v_monto is not null and (v_monto < 0 or v_monto > 100000) then raise exception 'Monto inválido.'; end if;
  if length(v_det) not between 10 and 1000 or length(v_sol) not between 5 and 500 then raise exception 'Completa el detalle y lo que solicitas.'; end if;
  if (select count(*) from reclamaciones where origen_hash = v_hash and creado_en > v_ahora - interval '1 hour') >= 3 then
    raise exception 'Demasiados envíos seguidos. Intenta más tarde o escríbenos por WhatsApp.';
  end if;
  v_codigo := 'LR-' || to_char(v_ahora at time zone 'America/Lima', 'YYYYMMDD') || '-' || upper(encode(gen_random_bytes(3), 'hex'));
  insert into reclamaciones (codigo, tipo, nombre, tipo_doc, documento_cif, domicilio_cif, celular_cif, correo_cif, tutor, producto, pedido, monto, detalle, solicitud, origen_hash, creado_en)
  values (v_codigo, v_tipo, v_nombre, v_tdoc, pgp_sym_encrypt(v_doc, v_clave), pgp_sym_encrypt(v_dom, v_clave), pgp_sym_encrypt(v_cel, v_clave), pgp_sym_encrypt(v_correo, v_clave),
          left(btrim(coalesce(p_datos->>'tutor','')), 80), v_prod, left(upper(coalesce(p_datos->>'pedido','')), 20), v_monto, v_det, v_sol, v_hash, v_ahora);
  return json_build_object('codigo', v_codigo, 'fecha', to_char(v_ahora at time zone 'America/Lima', 'DD/MM/YYYY HH24:MI'));
end;
$$;

-- Solo el admin descifra un reclamo para responderlo
create or replace function public.ver_reclamo(p_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare r reclamaciones%rowtype; k text := public.clave_datos();
begin
  if not public.es_admin() then raise exception 'No autorizado.'; end if;
  select * into r from reclamaciones where id = p_id;
  if not found then raise exception 'No existe.'; end if;
  return json_build_object('codigo', r.codigo, 'tipo', r.tipo, 'nombre', r.nombre, 'tipo_doc', r.tipo_doc,
    'documento', pgp_sym_decrypt(r.documento_cif, k), 'domicilio', pgp_sym_decrypt(r.domicilio_cif, k),
    'celular', pgp_sym_decrypt(r.celular_cif, k), 'correo', pgp_sym_decrypt(r.correo_cif, k),
    'tutor', r.tutor, 'producto', r.producto, 'pedido', r.pedido, 'monto', r.monto, 'detalle', r.detalle,
    'solicitud', r.solicitud, 'estado', r.estado, 'fecha', r.creado_en);
end;
$$;
revoke all on function public.registrar_reclamo(jsonb, text) from public;
revoke all on function public.ver_reclamo(uuid) from public;
grant execute on function public.registrar_reclamo(jsonb, text) to anon, authenticated;
grant execute on function public.ver_reclamo(uuid) to authenticated;

-- ============ EDITOR VISUAL (admin.html) ============
-- Ajustes de la tienda (marca, colores, textos, secciones). Una sola fila. Lectura pública, escritura solo admin.
create table public.ajustes (
  id int primary key default 1 check (id = 1),
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
alter table public.ajustes enable row level security;
create policy "ver ajustes" on public.ajustes for select using (true);
revoke insert, update, delete on public.ajustes from anon, authenticated;

create or replace function public.ajustes_publicos() returns jsonb
language sql stable security definer set search_path = public as $$
  select datos - 'supabase' from ajustes where id = 1;
$$;

create or replace function public.guardar_ajustes(p_datos jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado.'; end if;
  if jsonb_typeof(p_datos) <> 'object' then raise exception 'Ajustes inválidos.'; end if;
  if pg_column_size(p_datos) > 300000 then raise exception 'La configuración es demasiado grande.'; end if;
  if p_datos::text ~ 'data:image' then raise exception 'Hay imágenes sin subir. Súbelas con la sesión iniciada.'; end if;
  if coalesce(p_datos->>'whatsapp', '') !~ '^[0-9]{8,15}$' then raise exception 'WhatsApp inválido.'; end if;
  insert into ajustes (id, datos, actualizado) values (1, p_datos - 'supabase', now())
  on conflict (id) do update set datos = excluded.datos, actualizado = now();
end;
$$;

-- Guarda el catálogo completo (mismo formato que js/catalogo.js) en una transacción.
-- No borra productos con historial: los que faltan quedan inactivos. Conserva el stock de las variantes.
create or replace function public.guardar_catalogo(p_catalogo jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  c jsonb; s jsonb; p jsonb; f jsonb; k text; v text; n int := 0; o int; so int;
  v_sub text; v_ids text[] := '{}'; v_cats text[] := '{}'; v_tallas text[]; v_colores text[]; t text; col text;
begin
  if not public.es_admin() then raise exception 'No autorizado.'; end if;
  if jsonb_typeof(p_catalogo->'productos') <> 'array' or jsonb_typeof(p_catalogo->'categorias') <> 'array' then raise exception 'Catálogo inválido.'; end if;
  if pg_column_size(p_catalogo) > 3000000 then raise exception 'El catálogo es demasiado grande.'; end if;
  if jsonb_array_length(p_catalogo->'productos') > 1000 then raise exception 'Máximo 1000 productos.'; end if;
  if p_catalogo::text ~ 'data:image' then raise exception 'Hay fotos sin subir. Súbelas con la sesión iniciada.'; end if;

  for k, v in select key, value #>> '{}' from jsonb_each(coalesce(p_catalogo->'colores', '{}'::jsonb)) loop
    insert into colores (nombre, hex) values (k, v) on conflict (nombre) do update set hex = excluded.hex;
  end loop;

  o := 0;
  for c in select * from jsonb_array_elements(p_catalogo->'categorias') loop
    o := o + 1; v_cats := v_cats || (c->>'id');
    insert into categorias (id, nombre, padre, visible, orden, calzado, guia_tallas)
    values (c->>'id', c->>'nombre', null, coalesce((c->>'visible')::boolean, true), o, coalesce((c->>'calzado')::boolean, false), nullif(c->>'guiaTallas', ''))
    on conflict (id) do update set nombre = excluded.nombre, padre = null, visible = excluded.visible, orden = excluded.orden,
      calzado = excluded.calzado, guia_tallas = excluded.guia_tallas;
    so := 0;
    for s in select * from jsonb_array_elements(coalesce(c->'sub', '[]'::jsonb)) loop
      so := so + 1;
      v_sub := case when s->>'id' like (c->>'id') || '-%' then s->>'id' else (c->>'id') || '-' || (s->>'id') end;
      v_cats := v_cats || v_sub;
      insert into categorias (id, nombre, padre, visible, orden, advertencia)
      values (v_sub, s->>'nombre', c->>'id', true, so, nullif(s->>'advertencia', ''))
      on conflict (id) do update set nombre = excluded.nombre, padre = excluded.padre, visible = true, orden = excluded.orden, advertencia = excluded.advertencia;
    end loop;
  end loop;
  update categorias set visible = false where not (id = any (v_cats));

  for p in select * from jsonb_array_elements(p_catalogo->'productos') loop
    n := n + 1; v_ids := v_ids || (p->>'id');
    select coalesce(array_agg(x), '{}') into v_tallas from jsonb_array_elements_text(coalesce(p->'tallas', '[]'::jsonb)) x;
    select coalesce(array_agg(x), '{}') into v_colores from jsonb_array_elements_text(coalesce(p->'colores', '[]'::jsonb)) x;
    v_sub := nullif(p->>'sub', '');
    if v_sub is not null and not (v_sub like (p->>'cat') || '-%') then v_sub := (p->>'cat') || '-' || v_sub; end if;
    if v_sub is not null and not exists (select 1 from categorias where id = v_sub) then v_sub := null; end if;
    insert into productos (id, sku, nombre, categoria, subcategoria, descripcion, material, dibujo, precio, publico, sistema_talla, guia_tallas, tallas, colores, activo, orden)
    values (p->>'id', upper(p->>'sku'), p->>'nombre', p->>'cat', v_sub, coalesce(p->>'descripcion', ''), nullif(p->>'material', ''), coalesce(nullif(p->>'dibujo', ''), 'bodyCorta'),
            nullif(p->>'precio', '')::numeric, coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'publico', '[]'::jsonb)) x), '{}'),
            nullif(p->>'sistemaTalla', ''), nullif(p->>'guiaTallas', ''), v_tallas, v_colores, not coalesce((p->>'oculto')::boolean, false), n)
    on conflict (id) do update set sku = excluded.sku, nombre = excluded.nombre, categoria = excluded.categoria, subcategoria = excluded.subcategoria,
      descripcion = excluded.descripcion, material = excluded.material, dibujo = excluded.dibujo, precio = excluded.precio, publico = excluded.publico,
      sistema_talla = excluded.sistema_talla, guia_tallas = excluded.guia_tallas, tallas = excluded.tallas, colores = excluded.colores, activo = excluded.activo, orden = excluded.orden;

    update variantes set activo = false where producto_id = p->>'id';
    foreach t in array (case when cardinality(v_tallas) = 0 then array[''] else v_tallas end) loop
      foreach col in array (case when cardinality(v_colores) = 0 then array[null::text] else v_colores end) loop
        insert into variantes (producto_id, talla, color) values (p->>'id', t, col)
        on conflict (producto_id, talla, color) do update set activo = true;
      end loop;
    end loop;

    delete from imagenes where producto_id = p->>'id';
    o := 0;
    for f in select * from jsonb_array_elements(coalesce(p->'fotos', '[]'::jsonb)) loop
      o := o + 1;
      insert into imagenes (producto_id, ruta, tipo, w, h, color, orden)
      values (p->>'id', f->>'src', case when f->>'tipo' = 'e' then 'e' else 'r' end, nullif(f->>'w', '')::int, nullif(f->>'h', '')::int,
              case when exists (select 1 from colores where nombre = f->>'color') then f->>'color' end, o);
    end loop;
  end loop;
  update productos set activo = false where not (id = any (v_ids));
  return json_build_object('productos', n);
end;
$$;

revoke all on function public.guardar_ajustes(jsonb) from public;
revoke all on function public.guardar_catalogo(jsonb) from public;
grant execute on function public.ajustes_publicos() to anon, authenticated;
grant execute on function public.guardar_ajustes(jsonb) to authenticated;
grant execute on function public.guardar_catalogo(jsonb) to authenticated;
grant execute on function public.es_admin() to anon, authenticated;
