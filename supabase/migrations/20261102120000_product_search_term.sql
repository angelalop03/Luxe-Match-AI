-- Término corto para buscar cada idea de compra en tiendas reales (RF9),
-- p. ej. "blazer azul marino". Los buscadores de las tiendas funcionan mejor
-- con 2–4 palabras que con el nombre completo del producto.
alter table public.products add column search_term text;
