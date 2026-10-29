-- Detalles del análisis de colorimetría (RF7): explicación, consejos y metales.
alter table public.color_profiles
  add column summary text,
  add column tips jsonb not null default '[]'::jsonb,
  add column best_metals text[] not null default '{}';
