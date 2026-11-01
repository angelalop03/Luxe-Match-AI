/**
 * Eliminación de cuenta (RGPD; obligatoria para publicar en App Store).
 *
 * Borra las fotos del usuario y su usuario de Auth. El borrado en cascada
 * elimina perfil, prendas, outfits y perfil de color; los eventos de
 * analytics quedan anonimizados (user_id = null).
 *
 * POST {}  →  { deleted: true }
 */
import { createClient } from '../_shared/deps.ts';
import { HttpError, json, serve } from '../_shared/http.ts';
import { getUserClient } from '../_shared/supabase.ts';

const Buckets = ['garments', 'selfies'] as const;

serve(async (req) => {
  const { user } = await getUserClient(req);

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) throw new HttpError('ai_failed', 'El servidor no puede eliminar cuentas ahora.');
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Fotos: todo lo que haya en la carpeta del usuario de cada bucket.
  for (const bucket of Buckets) {
    while (true) {
      const { data: files, error } = await admin.storage.from(bucket).list(user.id, { limit: 1000 });
      if (error) throw error;
      if (!files || files.length === 0) break;
      const { error: removeError } = await admin.storage
        .from(bucket)
        .remove(files.map((file) => `${user.id}/${file.name}`));
      if (removeError) throw removeError;
      if (files.length < 1000) break;
    }
  }

  // 2. Usuario: el resto de datos se borra en cascada desde auth.users.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) throw deleteError;

  return json({ deleted: true });
});
