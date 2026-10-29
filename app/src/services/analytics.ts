import { supabase } from '@/lib/supabase';

/** Eventos registrados para RF13. Añade aquí los nuevos para mantenerlos tipados. */
export type AnalyticsEvent =
  | 'sign_up'
  | 'sign_in'
  | 'onboarding_completed'
  | 'style_preferences_updated'
  | 'garment_uploaded'
  | 'garment_scan_applied'
  | 'outfit_generated'
  | 'outfit_saved'
  | 'ecommerce_click';

/**
 * Registra un evento en `analytics_events`. No bloquea la interfaz: si falla,
 * solo se avisa en consola. El `user_id` lo pone la base de datos.
 */
export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  supabase
    .from('analytics_events')
    .insert({ event_name: event, properties })
    .then(({ error }) => {
      if (error) console.warn(`[analytics] ${event}:`, error.message);
    });
}
