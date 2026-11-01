-- Restyle (RF14): ideas para transformar y reutilizar una prenda, guardadas
-- junto a ella para no volver a generarlas cada vez.
alter table public.garments
  add column restyle jsonb,
  add column restyled_at timestamptz;
