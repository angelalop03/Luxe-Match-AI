import { removeImage, uploadImage, type PreparedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { ColorProfile } from '@/types/color-profile';

const Bucket = 'selfies';

export async function fetchColorProfile(userId: string): Promise<ColorProfile | null> {
  const { data, error } = await supabase
    .from('color_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as ColorProfile | null;
}

/**
 * Guarda un selfie nuevo para el análisis de colorimetría y borra el anterior.
 * El resultado del análisis anterior deja de ser válido, así que se limpia.
 */
export async function saveSelfie(
  userId: string,
  image: PreparedImage,
  previous: ColorProfile | null,
): Promise<ColorProfile> {
  const path = await uploadImage(Bucket, userId, image);

  const { data, error } = await supabase
    .from('color_profiles')
    .upsert({
      user_id: userId,
      selfie_path: path,
      season: null,
      undertone: null,
      contrast: null,
      palette: [],
      recommended_colors: [],
      avoid_colors: [],
      analyzed_at: null,
    })
    .select('*')
    .single();

  if (error) {
    await removeImage(Bucket, path);
    throw error;
  }
  await removeImage(Bucket, previous?.selfie_path ?? null);
  return data as ColorProfile;
}

/** Borra el selfie (derecho a eliminar datos personales). */
export async function deleteSelfie(profile: ColorProfile): Promise<void> {
  const { error } = await supabase
    .from('color_profiles')
    .update({ selfie_path: null })
    .eq('user_id', profile.user_id);
  if (error) throw error;
  await removeImage(Bucket, profile.selfie_path);
}
