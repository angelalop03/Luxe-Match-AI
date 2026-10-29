import { removeImage, uploadImage, type PreparedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { Garment, GarmentInput } from '@/types/garment';

import { track } from './analytics';

const Bucket = 'garments';

/** Prendas del usuario actual; RLS filtra por propietario (RB7). */
export async function listGarments(): Promise<Garment[]> {
  const { data, error } = await supabase
    .from('garments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Garment[];
}

export async function getGarment(id: string): Promise<Garment | null> {
  const { data, error } = await supabase.from('garments').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Garment | null;
}

export async function createGarment(
  userId: string,
  input: GarmentInput,
  image: PreparedImage | null,
): Promise<Garment> {
  const imagePath = image ? await uploadImage(Bucket, userId, image) : null;

  const { data, error } = await supabase
    .from('garments')
    .insert({ ...input, user_id: userId, image_path: imagePath })
    .select('*')
    .single();

  if (error) {
    // No dejamos imágenes huérfanas si falla el guardado.
    await removeImage(Bucket, imagePath);
    throw error;
  }
  track('garment_uploaded', { category: input.category, has_image: !!imagePath });
  return data as Garment;
}

export async function updateGarment(
  garment: Garment,
  input: GarmentInput,
  newImage: PreparedImage | null,
): Promise<Garment> {
  const newPath = newImage ? await uploadImage(Bucket, garment.user_id, newImage) : null;

  const { data, error } = await supabase
    .from('garments')
    .update({ ...input, ...(newPath && { image_path: newPath }) })
    .eq('id', garment.id)
    .select('*')
    .single();

  if (error) {
    await removeImage(Bucket, newPath);
    throw error;
  }
  if (newPath) await removeImage(Bucket, garment.image_path);
  return data as Garment;
}

/**
 * Borra la prenda y su imagen. Al ser un borrado real, también desaparece de
 * los outfits guardados y no podrá usarse en recomendaciones futuras (RB10).
 */
export async function deleteGarment(garment: Garment): Promise<void> {
  const { error } = await supabase.from('garments').delete().eq('id', garment.id);
  if (error) throw error;
  await removeImage(Bucket, garment.image_path);
}
