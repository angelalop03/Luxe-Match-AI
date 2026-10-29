/**
 * Escaneo IA de prendas (RF6): a partir de una foto detecta tipo de prenda,
 * color principal, estilo, ocasión y temporada. La app usa la respuesta para
 * rellenar el formulario; el usuario puede corregirla antes de guardar.
 *
 * POST { image_base64: string }  →  GarmentScan
 */
import { analyzeImage, normalizeHex } from '../_shared/claude.ts';
import { z } from '../_shared/deps.ts';
import { HttpError, json, serve } from '../_shared/http.ts';
import { enforceRateLimit, getUserClient, recordUsage } from '../_shared/supabase.ts';

// Deben coincidir con app/src/features/wardrobe/garment-options.ts
const Categories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag'] as const;
const Seasons = ['primavera', 'verano', 'otono', 'invierno'] as const;
const Occasions = ['oficina', 'casual', 'cena', 'boda', 'gala', 'fiesta', 'entrevista', 'viaje'] as const;
const Styles = [
  'minimalista', 'clasico', 'romantico', 'urbano', 'bohemio', 'glam', 'deportivo', 'vanguardista',
] as const;
const ColorNames = [
  'Negro', 'Blanco', 'Marfil', 'Beige', 'Camel', 'Marrón', 'Gris', 'Azul marino', 'Azul',
  'Azul cielo', 'Verde oliva', 'Verde botella', 'Rojo', 'Burdeos', 'Rosa empolvado', 'Rosa',
  'Mostaza', 'Naranja', 'Morado', 'Dorado', 'Plateado',
] as const;

const GarmentScanSchema = z.object({
  is_garment: z
    .boolean()
    .describe('false si la foto no muestra claramente una prenda, calzado, bolso o accesorio'),
  name: z.string().describe('Nombre corto y descriptivo en español, p. ej. "Blazer de lana negro"'),
  category: z.enum(Categories),
  subcategory: z.string().describe('Tipo concreto en español: camisa, vaqueros, botines…'),
  primary_color_hex: z.string().describe('Color dominante de la prenda en formato #RRGGBB'),
  color_name: z.enum(ColorNames).describe('El color de la lista más parecido al dominante'),
  styles: z.array(z.enum(Styles)).describe('1 a 3 estilos a los que encaja'),
  occasions: z.array(z.enum(Occasions)).describe('Ocasiones en las que se puede llevar'),
  seasons: z.array(z.enum(Seasons)).describe('Temporadas adecuadas según tejido y grosor'),
  material_guess: z.string().describe('Tejido probable en español, o cadena vacía si no se aprecia'),
  styling_note: z.string().describe('Una frase en español con un consejo para combinarla'),
});

const System = `Eres un estilista experto que cataloga prendas para un armario digital.
Analiza solo la prenda principal de la foto e ignora el fondo, la persona o la percha.
Elige siempre valores de las listas permitidas. Si dudas entre temporadas u ocasiones,
incluye todas las razonables. Escribe en español de España.`;

const Instruction = 'Cataloga esta prenda.';

serve(async (req) => {
  const { user } = await getUserClient(req);

  const body = await req.json().catch(() => null);
  const imageBase64 = typeof body?.image_base64 === 'string' ? body.image_base64 : '';
  if (!imageBase64) throw new HttpError('bad_request', 'Falta la imagen.');
  // ~8 MB en base64: las imágenes de la app ya llegan comprimidas (≈200 KB).
  if (imageBase64.length > 8_000_000) throw new HttpError('bad_request', 'La imagen es demasiado grande.');

  await enforceRateLimit(user.id, 'ai_garment_scan', 30);

  const startedAt = Date.now();
  const { result, usage } = await analyzeImage({
    schema: GarmentScanSchema,
    system: System,
    instruction: Instruction,
    imageBase64,
    effort: 'low',
  });

  await recordUsage(user.id, 'ai_garment_scan', {
    ...usage,
    ms: Date.now() - startedAt,
    is_garment: result.is_garment,
    category: result.category,
  });

  if (!result.is_garment) {
    throw new HttpError('invalid_image', 'No encontramos ninguna prenda en la foto.');
  }

  return json({
    ...result,
    primary_color_hex: normalizeHex(result.primary_color_hex),
    styles: [...new Set(result.styles)].slice(0, 3),
    occasions: [...new Set(result.occasions)],
    seasons: [...new Set(result.seasons)],
  });
});
