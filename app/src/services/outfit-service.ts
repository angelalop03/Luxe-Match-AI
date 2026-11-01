import { supabase } from '@/lib/supabase';
import type { Garment } from '@/types/garment';
import type { Outfit, OutfitProposal, OutfitSource } from '@/types/outfit';

import { track } from './analytics';

const OutfitColumns =
  'id, name, occasion, season, explanation, color_harmony, styling_tip, missing_piece, missing_piece_category, source, is_favorite, created_at, outfit_items(position, garments(*))';

type OutfitRow = Omit<Outfit, 'garments'> & {
  outfit_items: { position: number; garments: Garment | null }[];
};

function toOutfit(row: OutfitRow): Outfit {
  const { outfit_items, ...outfit } = row;
  return {
    ...outfit,
    garments: [...outfit_items]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.garments)
      .filter((g): g is Garment => g !== null),
  };
}

/** Error al guardar con un mensaje listo para mostrar. */
export class OutfitError extends Error {}

function saveErrorMessage(message: string) {
  if (message.includes('invalid_outfit')) {
    // El mensaje de la base de datos ya viene en español tras el prefijo.
    const reason = message.split('invalid_outfit:')[1]?.trim();
    return reason ? reason.charAt(0).toUpperCase() + reason.slice(1) + '.' : 'El outfit no es válido.';
  }
  return 'No hemos podido guardar el outfit. Inténtalo de nuevo.';
}

export async function listOutfits(): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select(OutfitColumns)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as OutfitRow[]).map(toOutfit);
}

export async function getOutfit(id: string): Promise<Outfit | null> {
  const { data, error } = await supabase
    .from('outfits')
    .select(OutfitColumns)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toOutfit(data as unknown as OutfitRow) : null;
}

/** Guarda una propuesta generada (RF10). Solo usuarios con sesión (RB8). */
export async function saveProposal(
  proposal: OutfitProposal,
  context: { occasion: string; season: string; source: OutfitSource },
): Promise<string> {
  const { data, error } = await supabase.rpc('save_outfit', {
    p_garment_ids: proposal.garment_ids,
    p_name: proposal.name,
    p_occasion: context.occasion,
    p_season: context.season,
    p_explanation: proposal.explanation,
    p_source: context.source,
    p_color_harmony: proposal.color_harmony,
    p_styling_tip: proposal.styling_tip,
    p_missing_piece: proposal.missing_piece,
    p_missing_piece_category: proposal.missing_piece_category,
  });
  if (error) throw new OutfitError(saveErrorMessage(error.message));
  track('outfit_saved', { source: context.source, occasion: context.occasion });
  return data as string;
}

/** Edita nombre, favorito y prendas de un outfit guardado (RF10). */
export async function updateOutfit(
  outfit: Outfit,
  changes: { name: string; isFavorite: boolean; garmentIds: string[] },
): Promise<void> {
  const { error } = await supabase.rpc('save_outfit', {
    p_outfit_id: outfit.id,
    p_garment_ids: changes.garmentIds,
    p_name: changes.name,
    p_occasion: outfit.occasion,
    p_season: outfit.season,
    p_is_favorite: changes.isFavorite,
  });
  if (error) throw new OutfitError(saveErrorMessage(error.message));
}

export async function setFavorite(outfitId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('outfits')
    .update({ is_favorite: isFavorite })
    .eq('id', outfitId);
  if (error) throw error;
}

export async function deleteOutfit(outfitId: string): Promise<void> {
  const { error } = await supabase.from('outfits').delete().eq('id', outfitId);
  if (error) throw error;
}
