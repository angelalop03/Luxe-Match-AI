-- =============================================================================
-- LuxeMatch AI · Esquema inicial
--
-- Todas las tablas con datos del usuario tienen Row Level Security: cada
-- usuario solo puede leer y modificar lo suyo (RNF5, RB7, RB8).
-- =============================================================================

-- Utilidad: mantener updated_at al día ------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles (RF2, RF3) · 1:1 con auth.users
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  avatar_url text,
  -- Respuestas del quiz: estilos, eventos, presupuesto, preferencias, clima…
  style_preferences jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Crear el perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- color_profiles (RF7) · resultado del análisis de colorimetría
-- -----------------------------------------------------------------------------
create table public.color_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  season text,              -- p. ej. "Invierno profundo"
  undertone text check (undertone in ('cool', 'warm', 'neutral', 'olive')),
  contrast text check (contrast in ('low', 'medium', 'high')),
  -- [{ "hex": "#1F3A5F", "name": "Azul noche" }, …]
  palette jsonb not null default '[]'::jsonb,
  recommended_colors jsonb not null default '[]'::jsonb,
  avoid_colors jsonb not null default '[]'::jsonb,
  selfie_path text,         -- ruta en el bucket privado "selfies"
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger color_profiles_set_updated_at
  before update on public.color_profiles
  for each row execute function public.set_updated_at();

alter table public.color_profiles enable row level security;

create policy "color_profiles: all own" on public.color_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- garments (RF5, RF6) · armario digital
-- Se borran de verdad: una prenda eliminada no puede reaparecer en
-- recomendaciones futuras (RB10).
-- -----------------------------------------------------------------------------
create table public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (
    category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag')
  ),
  subcategory text,
  primary_color_hex text check (primary_color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  color_name text,
  styles text[] not null default '{}',
  occasions text[] not null default '{}',
  seasons text[] not null default '{}',
  image_path text,           -- ruta en el bucket privado "garments"
  ai_metadata jsonb,         -- salida en bruto del escaneo IA
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index garments_user_category_idx on public.garments (user_id, category);

create trigger garments_set_updated_at
  before update on public.garments
  for each row execute function public.set_updated_at();

alter table public.garments enable row level security;

create policy "garments: all own" on public.garments
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- outfits + outfit_items (RF8, RF10, RB9)
-- -----------------------------------------------------------------------------
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null default 'Mi look',
  occasion text,
  season text,
  explanation text,          -- explicación estilística generada por la IA
  source text not null default 'ai' check (source in ('ai', 'manual')),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index outfits_user_idx on public.outfits (user_id, created_at desc);

create trigger outfits_set_updated_at
  before update on public.outfits
  for each row execute function public.set_updated_at();

alter table public.outfits enable row level security;

create policy "outfits: all own" on public.outfits
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table public.outfit_items (
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  garment_id uuid not null references public.garments (id) on delete cascade,
  position smallint not null default 0,
  primary key (outfit_id, garment_id)
);

create index outfit_items_garment_idx on public.outfit_items (garment_id);

alter table public.outfit_items enable row level security;

-- Solo se pueden enlazar outfits y prendas propios.
create policy "outfit_items: all own" on public.outfit_items
  for all to authenticated
  using (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.garments g
      where g.id = garment_id and g.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- products (RF9) · catálogo ecommerce, lectura pública
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text not null check (
    category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag')
  ),
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  color_name text,
  price numeric(10, 2),
  currency text not null default 'EUR',
  image_url text,
  external_url text not null,
  styles text[] not null default '{}',
  occasions text[] not null default '{}',
  seasons text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category) where is_active;

alter table public.products enable row level security;

create policy "products: read active" on public.products
  for select to anon, authenticated using (is_active);

-- -----------------------------------------------------------------------------
-- analytics_events (RF13) · solo inserción desde la app
-- -----------------------------------------------------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references public.profiles (id) on delete set null,
  event_name text not null check (char_length(event_name) <= 64),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_idx on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;

create policy "analytics_events: insert own" on public.analytics_events
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Storage (RF4, RB7) · buckets privados, una carpeta por usuario:
--   selfies/<user_id>/<archivo>   garments/<user_id>/<archivo>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('selfies', 'selfies', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('garments', 'garments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "storage: read own images" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('selfies', 'garments')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: upload own images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('selfies', 'garments')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: update own images" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('selfies', 'garments')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: delete own images" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('selfies', 'garments')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
