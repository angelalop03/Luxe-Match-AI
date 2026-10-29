/**
 * Variables públicas de entorno. Expo solo expone al cliente las que empiezan
 * por `EXPO_PUBLIC_`; nunca pongas aquí claves secretas (la API de IA vive en
 * las Edge Functions de Supabase).
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey);
