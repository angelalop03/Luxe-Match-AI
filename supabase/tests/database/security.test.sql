-- =============================================================================
-- Tests de seguridad y reglas de negocio en la base de datos (pgTAP).
-- Ejecutar con:  npx supabase test db
-- Todo ocurre dentro de una transacción que se deshace al final.
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

-- Dos usuarias de prueba -----------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local', '{"full_name": "Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.local', '{"full_name": "Bea"}');

insert into public.products (name, category, external_url)
values ('Producto de test', 'bag', 'https://example.com/test');

-- 1. El registro crea el perfil automáticamente
select is(
  (select full_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Ana',
  'handle_new_user crea el perfil con el nombre'
);

-- Como Ana ------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.garments (id, name, category) values
       ('aaaaaaaa-0000-0000-0000-000000000001', 'Camisa', 'top'),
       ('aaaaaaaa-0000-0000-0000-000000000002', 'Pantalón', 'bottom'),
       ('aaaaaaaa-0000-0000-0000-000000000003', 'Vestido', 'dress') $$,
  'Ana puede añadir prendas a su armario'
);

select is(
  (select count(*) from public.garments),
  3::bigint,
  'Ana ve sus 3 prendas'
);

select throws_ok(
  $$ select public.save_outfit(array['aaaaaaaa-0000-0000-0000-000000000001']::uuid[], 'Solo camisa') $$,
  '22023',
  null,
  'RB9: no se puede guardar un outfit solo con parte de arriba'
);

select lives_ok(
  $$ select public.save_outfit(
       array['aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002']::uuid[],
       'Look oficina', 'oficina', 'otono', 'Explicación', 'ai') $$,
  'RB9: parte de arriba + parte de abajo es un outfit válido'
);

select lives_ok(
  $$ select public.save_outfit(array['aaaaaaaa-0000-0000-0000-000000000003']::uuid[], 'Solo vestido') $$,
  'RB9: un vestido solo es un outfit válido'
);

select lives_ok(
  $$ insert into public.analytics_events (event_name) values ('test_event') $$,
  'Ana puede registrar eventos propios'
);

select throws_ok(
  $$ insert into public.analytics_events (user_id, event_name)
     values ('22222222-2222-2222-2222-222222222222', 'suplantacion') $$,
  '42501',
  null,
  'Ana no puede registrar eventos en nombre de otra persona'
);

select lives_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('garments', '11111111-1111-1111-1111-111111111111/foto.jpg') $$,
  'RB7: Ana puede subir imágenes a su carpeta'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('garments', '22222222-2222-2222-2222-222222222222/foto.jpg') $$,
  '42501',
  null,
  'RB7: Ana no puede subir imágenes a la carpeta de otra persona'
);

-- Como Bea ------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select is(
  (select count(*) from public.garments),
  0::bigint,
  'RB7: Bea no ve las prendas de Ana'
);

select is(
  (select count(*) from public.outfits),
  0::bigint,
  'Bea no ve los outfits de Ana'
);

select is_empty(
  $$ update public.garments set name = 'Hackeada'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' returning id $$,
  'Bea no puede modificar prendas de Ana'
);

select throws_ok(
  $$ insert into public.garments (user_id, name, category)
     values ('11111111-1111-1111-1111-111111111111', 'Intrusa', 'top') $$,
  '42501',
  null,
  'Bea no puede crear prendas en el armario de Ana'
);

select throws_ok(
  $$ select public.save_outfit(
       array['aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002']::uuid[],
       'Robado') $$,
  '22023',
  null,
  'Bea no puede crear outfits con prendas de Ana'
);

-- Sin sesión ----------------------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select ok(
  (select count(*) from public.products) > 0,
  'El catálogo es público'
);

select is(
  (select count(*) from public.profiles),
  0::bigint,
  'Sin sesión no se ve ningún perfil'
);

-- RB10: al borrar una prenda desaparece de los outfits ----------------------------
reset role;
delete from public.garments where id = 'aaaaaaaa-0000-0000-0000-000000000002';

select is(
  (select count(*) from public.outfit_items where garment_id = 'aaaaaaaa-0000-0000-0000-000000000002'),
  0::bigint,
  'RB10: una prenda eliminada no queda en ningún outfit'
);

select * from finish();
rollback;
