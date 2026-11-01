-- =============================================================================
-- Métricas de producto (RF13) sobre analytics_events.
--
-- Vistas de solo lectura para el equipo (Supabase Studio o service_role).
-- Las usuarias de la app no pueden consultarlas: los datos son agregados de
-- todas las cuentas.
-- =============================================================================

-- Eventos por día y tipo, con usuarias únicas.
create view public.analytics_daily as
select
  date_trunc('day', created_at)::date as day,
  event_name,
  count(*) as events,
  count(distinct user_id) as users
from public.analytics_events
group by 1, 2;

-- Generación de outfits: volumen, uso de IA frente a reglas y tiempo de respuesta.
create view public.analytics_outfit_generation as
select
  date_trunc('day', created_at)::date as day,
  properties ->> 'source' as source,
  count(*) as generations,
  round(avg((properties ->> 'ms')::numeric)) as avg_ms,
  round(avg((properties ->> 'proposals')::numeric), 1) as avg_proposals
from public.analytics_events
where event_name = 'outfit_generated'
group by 1, 2;

-- Clics ecommerce por pantalla de origen y categoría.
create view public.analytics_ecommerce_clicks as
select
  properties ->> 'source' as source,
  properties ->> 'category' as category,
  count(*) as clicks,
  count(distinct user_id) as users
from public.analytics_events
where event_name = 'ecommerce_click'
group by 1, 2;

-- Coste y rendimiento de la IA por tipo de análisis.
create view public.analytics_ai_usage as
select
  event_name,
  properties ->> 'model' as model,
  count(*) as calls,
  sum((properties ->> 'input_tokens')::int) as input_tokens,
  sum((properties ->> 'output_tokens')::int) as output_tokens,
  round(avg((properties ->> 'ms')::numeric)) as avg_ms,
  percentile_cont(0.95) within group (order by (properties ->> 'ms')::numeric) as p95_ms
from public.analytics_events
where event_name in ('ai_garment_scan', 'ai_color_analysis', 'ai_restyle', 'outfit_generated')
  and properties ? 'input_tokens'
group by 1, 2;

-- Pantallas más visitadas (interacción).
create view public.analytics_screens as
select
  properties ->> 'screen' as screen,
  count(*) as views,
  count(distinct user_id) as users
from public.analytics_events
where event_name = 'screen_view'
group by 1;

revoke all on
  public.analytics_daily,
  public.analytics_outfit_generation,
  public.analytics_ecommerce_clicks,
  public.analytics_ai_usage,
  public.analytics_screens
from anon, authenticated;

grant select on
  public.analytics_daily,
  public.analytics_outfit_generation,
  public.analytics_ecommerce_clicks,
  public.analytics_ai_usage,
  public.analytics_screens
to service_role;
