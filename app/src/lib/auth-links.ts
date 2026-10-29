import * as Linking from 'expo-linking';

import { supabase } from './supabase';

/** URL a la que vuelve el usuario desde los emails de Supabase. */
export function authRedirectUrl(path: '/' | '/reset-password') {
  return Linking.createURL(path);
}

export type AuthLinkResult = { type: string | null } | null;

/**
 * Crea la sesión a partir de un enlace de confirmación o de recuperación de
 * contraseña (`luxematch://reset-password#access_token=...`).
 * Devuelve `null` si la URL no contiene datos de sesión.
 */
export async function createSessionFromUrl(url: string): Promise<AuthLinkResult> {
  const params = parseUrlParams(url);

  if (params.error_description) {
    throw new Error(params.error_description);
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return { type: params.type ?? null };
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return { type: params.type ?? null };
  }

  return null;
}

function parseUrlParams(url: string): Record<string, string> {
  const result: Record<string, string> = {};
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';

  for (const part of [query, hash]) {
    for (const [key, value] of new URLSearchParams(part)) {
      result[key] = value;
    }
  }
  return result;
}
