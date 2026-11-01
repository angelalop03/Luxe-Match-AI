import { supabase } from '@/lib/supabase';

/**
 * Elimina la cuenta y todos sus datos de forma permanente (RGPD) y cierra
 * la sesión en este dispositivo.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw new Error('No hemos podido eliminar la cuenta. Inténtalo de nuevo.');
  // El usuario ya no existe en el servidor: basta con limpiar la sesión local.
  await supabase.auth.signOut({ scope: 'local' });
}
