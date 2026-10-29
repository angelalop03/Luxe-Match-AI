import { createClient, type SupabaseClient, type User } from './deps.ts';
import { HttpError } from './http.ts';

/**
 * Cliente con la sesión del usuario que llama: todas las lecturas y escrituras
 * pasan por Row Level Security, igual que desde la app.
 */
export async function getUserClient(req: Request): Promise<{ client: SupabaseClient; user: User }> {
  const authorization = req.headers.get('Authorization');
  if (!authorization) throw new HttpError('unauthorized', 'Falta la sesión.');

  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const token = authorization.replace(/^Bearer\s+/i, '');
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new HttpError('unauthorized', 'Sesión no válida.');
  return { client, user: data.user };
}

/** Cliente con permisos de servicio, solo para contar el uso de la IA. */
function getServiceClient(): SupabaseClient | null {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) return null;
  return createClient(Deno.env.get('SUPABASE_URL')!, key, { auth: { persistSession: false } });
}

/**
 * Límite de uso por usuario y hora, para controlar el coste de la IA.
 * Cada llamada queda registrada en `analytics_events` (RF13).
 */
export async function enforceRateLimit(userId: string, event: string, maxPerHour: number) {
  const service = getServiceClient();
  if (!service) return;

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await service
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_name', event)
    .gte('created_at', since);

  if (error) {
    console.warn('[rate-limit]', error.message);
    return;
  }
  if ((count ?? 0) >= maxPerHour) {
    throw new HttpError('rate_limited', 'Has alcanzado el límite de análisis por hora.');
  }
}

export async function recordUsage(userId: string, event: string, properties: Record<string, unknown>) {
  const service = getServiceClient();
  if (!service) return;
  const { error } = await service
    .from('analytics_events')
    .insert({ user_id: userId, event_name: event, properties });
  if (error) console.warn('[analytics]', error.message);
}
