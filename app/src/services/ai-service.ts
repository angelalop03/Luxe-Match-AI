import { FunctionsHttpError } from '@supabase/supabase-js';

import type { PreparedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { ColorProfile } from '@/types/color-profile';
import type { GarmentCategory, Season } from '@/types/garment';
import type { OutfitProposal, OutfitRequest, OutfitSource } from '@/types/outfit';

/** Respuesta de la Edge Function `scan-garment` (RF6). */
export type GarmentScan = {
  name: string;
  category: GarmentCategory;
  subcategory: string;
  primary_color_hex: string | null;
  color_name: string;
  styles: string[];
  occasions: string[];
  seasons: Season[];
  material_guess: string;
  styling_note: string;
};

/** Error de las funciones de IA con un mensaje listo para mostrar. */
export class AiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const MessagesByCode: Record<string, string> = {
  ai_not_configured: 'La IA aún no está configurada en el servidor.',
  ai_busy: 'La IA está muy solicitada ahora mismo. Inténtalo en unos segundos.',
  rate_limited: 'Has hecho muchos análisis seguidos. Espera un poco y vuelve a intentarlo.',
  ai_refused: 'La IA no ha podido analizar esta imagen. Prueba con otra foto.',
  invalid_image: 'No hemos podido reconocer la imagen. Prueba con otra foto.',
  not_found: 'Primero sube un selfie.',
  unauthorized: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
};

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (!error) return data as T;

  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
    const code: string = payload?.error ?? 'ai_failed';
    // En estos casos el servidor da un motivo concreto para mostrar.
    const message =
      (code === 'invalid_image' || code === 'not_enough_garments') && payload?.message
        ? payload.message
        : (MessagesByCode[code] ?? 'No hemos podido completar el análisis.');
    throw new AiError(code, message);
  }
  throw new AiError('network', 'No hay conexión con el servidor. Inténtalo de nuevo.');
}

export function scanGarment(image: PreparedImage) {
  return invoke<GarmentScan>('scan-garment', { image_base64: image.base64 });
}

/** Analiza el selfie guardado y devuelve el perfil de color actualizado (RF7). */
export function analyzeColors() {
  return invoke<ColorProfile>('analyze-colors', {});
}

/**
 * Genera propuestas de outfit con prendas del armario (RF8). `source` indica
 * si las ha creado la IA o el generador por reglas de respaldo.
 */
export function generateOutfits(request: OutfitRequest) {
  return invoke<{ source: OutfitSource; outfits: OutfitProposal[] }>('generate-outfits', request);
}
