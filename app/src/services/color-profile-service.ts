import { removeImage, uploadImage, type PreparedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { ColorQuizResult } from '@/features/colorimetry/color-quiz';
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

const EmptyAnalysis = {
  season: null,
  undertone: null,
  contrast: null,
  palette: [],
  recommended_colors: [],
  avoid_colors: [],
  summary: null,
  tips: [],
  best_metals: [],
  analysis_method: null,
  analyzed_at: null,
};

/**
 * Guarda un selfie nuevo para el análisis de colorimetría y borra el anterior.
 * Si la paleta venía del selfie anterior deja de ser válida y se limpia; si
 * venía del test de preguntas, se conserva hasta que se analice el nuevo.
 */
export async function saveSelfie(
  userId: string,
  image: PreparedImage,
  previous: ColorProfile | null,
): Promise<ColorProfile> {
  const path = await uploadImage(Bucket, userId, image);
  const keepAnalysis = previous?.analysis_method === 'quiz';

  const { data, error } = await supabase
    .from('color_profiles')
    .upsert({ user_id: userId, selfie_path: path, ...(keepAnalysis ? {} : EmptyAnalysis) })
    .select('*')
    .single();

  if (error) {
    await removeImage(Bucket, path);
    throw error;
  }
  await removeImage(Bucket, previous?.selfie_path ?? null);
  return data as ColorProfile;
}

/**
 * Guarda el resultado del test de colorimetría sin selfie. No toca el
 * selfie si lo hubiera.
 */
export async function saveQuizProfile(
  userId: string,
  result: ColorQuizResult,
): Promise<ColorProfile> {
  const { data, error } = await supabase
    .from('color_profiles')
    .upsert({
      user_id: userId,
      ...result,
      analysis_method: 'quiz',
      analyzed_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
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
