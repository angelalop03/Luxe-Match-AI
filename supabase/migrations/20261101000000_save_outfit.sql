-- =============================================================================
-- Guardado de outfits (RF10) en una sola transacción.
--
-- Crea o actualiza un outfit y sustituye sus prendas. Valida la regla RB9:
-- todo outfit lleva una parte de arriba y una de abajo, o un vestido.
-- Es SECURITY INVOKER, así que RLS sigue aplicando: solo se pueden usar
-- prendas y outfits propios (RB7).
-- =============================================================================

-- Detalles del estilismo generado (RB9: explicación estilística) y la pieza
-- que falta, que usarán las recomendaciones de compra (RB6).
alter table public.outfits
  add column color_harmony text,
  add column styling_tip text,
  add column missing_piece text,
  add column missing_piece_category text check (
    missing_piece_category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag')
  );

alter table public.outfits drop constraint outfits_source_check;
alter table public.outfits add constraint outfits_source_check
  check (source in ('ai', 'rules', 'manual'));

create or replace function public.save_outfit(
  p_garment_ids uuid[],
  p_name text,
  p_occasion text default null,
  p_season text default null,
  p_explanation text default null,
  p_source text default 'ai',
  p_is_favorite boolean default false,
  p_outfit_id uuid default null,
  p_color_harmony text default null,
  p_styling_tip text default null,
  p_missing_piece text default null,
  p_missing_piece_category text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_outfit_id uuid;
  v_requested int;
  v_found int;
  v_tops int;
  v_bottoms int;
  v_dresses int;
begin
  select count(distinct g) into v_requested from unnest(p_garment_ids) as g;
  if v_requested = 0 then
    raise exception 'invalid_outfit: el outfit no tiene prendas' using errcode = '22023';
  end if;

  -- Por RLS, solo se ven las prendas del usuario: las ajenas o eliminadas no cuentan (RB10).
  select
    count(*),
    count(*) filter (where category = 'top'),
    count(*) filter (where category = 'bottom'),
    count(*) filter (where category = 'dress')
  into v_found, v_tops, v_bottoms, v_dresses
  from public.garments
  where id = any (p_garment_ids);

  if v_found <> v_requested then
    raise exception 'invalid_outfit: alguna prenda ya no existe' using errcode = '22023';
  end if;

  if not ((v_tops >= 1 and v_bottoms >= 1) or v_dresses >= 1) then
    raise exception 'invalid_outfit: hace falta una parte de arriba y una de abajo, o un vestido'
      using errcode = '22023';
  end if;

  if p_outfit_id is null then
    insert into public.outfits (
      name, occasion, season, explanation, source, is_favorite,
      color_harmony, styling_tip, missing_piece, missing_piece_category
    )
    values (
      coalesce(nullif(trim(p_name), ''), 'Mi look'), p_occasion, p_season, p_explanation,
      p_source, p_is_favorite, p_color_harmony, p_styling_tip,
      nullif(p_missing_piece, ''), p_missing_piece_category
    )
    returning id into v_outfit_id;
  else
    -- Al editar solo cambian nombre, ocasión, temporada, favorito y prendas.
    update public.outfits
    set name = coalesce(nullif(trim(p_name), ''), name),
        occasion = p_occasion,
        season = p_season,
        is_favorite = p_is_favorite
    where id = p_outfit_id
    returning id into v_outfit_id;

    if v_outfit_id is null then
      raise exception 'invalid_outfit: outfit no encontrado' using errcode = '22023';
    end if;

    -- Si cambian las prendas, la explicación generada ya no describe el look:
    -- pasa a ser un outfit editado por la persona.
    if exists (
      (select garment_id from public.outfit_items where outfit_id = v_outfit_id
       except select unnest(p_garment_ids))
      union all
      (select unnest(p_garment_ids)
       except select garment_id from public.outfit_items where outfit_id = v_outfit_id)
    ) then
      update public.outfits
      set source = 'manual',
          explanation = null,
          color_harmony = null,
          styling_tip = null,
          missing_piece = null,
          missing_piece_category = null
      where id = v_outfit_id;
    end if;

    delete from public.outfit_items where outfit_id = v_outfit_id;
  end if;

  insert into public.outfit_items (outfit_id, garment_id, position)
  select v_outfit_id, garment_id, (min(ord) - 1)::smallint
  from unnest(p_garment_ids) with ordinality as t(garment_id, ord)
  group by garment_id;

  return v_outfit_id;
end;
$$;

revoke execute on function public.save_outfit from public, anon;
grant execute on function public.save_outfit to authenticated;
