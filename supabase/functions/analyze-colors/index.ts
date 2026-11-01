/**
 * Análisis de colorimetría (RF7): a partir del selfie guardado del usuario
 * genera su estación de color, paleta personal, colores recomendados y
 * colores a evitar, y lo guarda en `color_profiles`.
 *
 * POST {}  →  ColorProfile actualizado
 */
import { analyzeImage, normalizeHex } from '../_shared/ai.ts';
import { z } from '../_shared/deps.ts';
import { HttpError, json, serve } from '../_shared/http.ts';
import { enforceRateLimit, getUserClient, recordUsage } from '../_shared/supabase.ts';

const Seasons = [
  'Primavera clara', 'Primavera cálida', 'Primavera brillante',
  'Verano claro', 'Verano frío', 'Verano suave',
  'Otoño suave', 'Otoño cálido', 'Otoño profundo',
  'Invierno profundo', 'Invierno frío', 'Invierno brillante',
] as const;

const Swatch = z.object({
  hex: z.string().describe('Color en formato #RRGGBB'),
  name: z.string().describe('Nombre del color en español, p. ej. "Azul petróleo"'),
});

const ColorAnalysisSchema = z.object({
  is_face_visible: z
    .boolean()
    .describe('false si no se ve con claridad una cara con la piel, los ojos y el pelo'),
  season: z.enum(Seasons).describe('Estación del sistema de 12 estaciones'),
  undertone: z.enum(['cool', 'warm', 'neutral', 'olive']),
  contrast: z.enum(['low', 'medium', 'high']).describe('Contraste entre piel, pelo y ojos'),
  summary: z
    .string()
    .describe('2 o 3 frases en español que expliquen el resultado de forma cercana'),
  palette: z.array(Swatch).describe('12 colores que forman la paleta personal'),
  recommended_colors: z.array(Swatch).describe('6 colores estrella para las prendas cerca de la cara'),
  avoid_colors: z.array(Swatch).describe('5 colores que conviene evitar cerca de la cara'),
  best_metals: z.array(z.enum(['oro', 'plata', 'oro rosa', 'bronce'])),
  tips: z.array(z.string()).describe('3 consejos prácticos de estilismo en español'),
});

const System = `Eres un asesor de imagen experto en colorimetría estacional (sistema de 12 estaciones).
Analiza únicamente el color: subtono y luminosidad de la piel, color de ojos y de pelo, y el
contraste entre ellos. Ten en cuenta que la luz y la cámara alteran los tonos; compénsalo.
La paleta, los colores estrella y los colores a evitar deben ser coherentes con la estación
elegida (por ejemplo, los Otoños evitan el negro puro y el blanco óptico; los Inviernos sí los
llevan) y ningún color puede aparecer a la vez como recomendado y como color a evitar.
No describas ni infieras edad, etnia, rasgos físicos u otros datos personales: habla solo de
colores. Escribe en español de España, con un tono cálido y profesional.`;

const Instruction = 'Haz mi análisis de colorimetría a partir de este selfie.';

/** Hex válidos, nombres en minúscula salvo la inicial y sin colores repetidos. */
function cleanSwatches(swatches: { hex: string; name: string }[], exclude: Set<string> = new Set()) {
  const seen = new Set<string>();
  return swatches
    .map((s) => {
      const name = s.name.trim().toLowerCase();
      return { hex: normalizeHex(s.hex), name: name.charAt(0).toUpperCase() + name.slice(1) };
    })
    .filter((s): s is { hex: string; name: string } => {
      if (!s.hex || !s.name || seen.has(s.hex) || exclude.has(s.hex)) return false;
      seen.add(s.hex);
      return true;
    });
}

serve(async (req) => {
  const { client, user } = await getUserClient(req);

  const { data: profile, error: profileError } = await client
    .from('color_profiles')
    .select('selfie_path')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile?.selfie_path) throw new HttpError('not_found', 'Primero sube un selfie.');

  await enforceRateLimit(user.id, 'ai_color_analysis', 5);

  // La descarga pasa por las políticas de Storage: solo su propia carpeta (RB7).
  const { data: file, error: downloadError } = await client.storage
    .from('selfies')
    .download(profile.selfie_path);
  if (downloadError || !file) throw new HttpError('not_found', 'No encontramos tu selfie.');

  const imageBase64 = encodeBase64(new Uint8Array(await file.arrayBuffer()));

  const startedAt = Date.now();
  const { result, usage } = await analyzeImage({
    schema: ColorAnalysisSchema,
    system: System,
    instruction: Instruction,
    imageBase64,
    effort: 'medium',
  });

  await recordUsage(user.id, 'ai_color_analysis', {
    ...usage,
    ms: Date.now() - startedAt,
    is_face_visible: result.is_face_visible,
  });

  if (!result.is_face_visible) {
    throw new HttpError(
      'invalid_image',
      'No vemos bien tu cara en el selfie. Prueba con otra foto con luz natural.',
    );
  }

  // Un color no puede estar a la vez en la paleta y entre los que evitar:
  // si el modelo se contradice, gana "evitar" (lo prudente para la persona).
  const avoid = cleanSwatches(result.avoid_colors);
  const avoidHex = new Set(avoid.map((s) => s.hex));

  const { data: updated, error: updateError } = await client
    .from('color_profiles')
    .update({
      season: result.season,
      undertone: result.undertone,
      contrast: result.contrast,
      summary: result.summary,
      palette: cleanSwatches(result.palette, avoidHex),
      recommended_colors: cleanSwatches(result.recommended_colors, avoidHex),
      avoid_colors: avoid,
      best_metals: [...new Set(result.best_metals)],
      tips: result.tips,
      analysis_method: 'ai',
      analyzed_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('*')
    .single();
  if (updateError) throw updateError;

  return json(updated);
});

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
