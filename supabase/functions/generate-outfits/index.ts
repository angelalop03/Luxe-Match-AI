/**
 * Generación de outfits (RF8) con las prendas del armario del usuario.
 *
 * 1. Filtro por reglas: solo prendas existentes (RB10) y de la temporada (RB4).
 * 2. Claude elige combinaciones para la ocasión (RB3) respetando la paleta (RB2),
 *    el estilo y el historial (RB5), solo con prendas del armario (RB1, RB11).
 * 3. Se valida cada propuesta (RB9) y se descartan las no válidas.
 * Si la IA no está disponible, se usa el generador por reglas.
 *
 * POST { occasion, season, notes?, count? }  →  { source, outfits: OutfitProposal[] }
 */
import { generateStructured } from '../_shared/ai.ts';
import { z } from '../_shared/deps.ts';
import { HttpError, json, serve } from '../_shared/http.ts';
import {
  comboKey,
  fitsSeason,
  generateByRules,
  isCompleteOutfit,
  missingForOutfits,
  OccasionLabels,
  SeasonLabels,
  type Garment,
  type OutfitProposal,
  type Swatch,
  type UserContext,
} from '../_shared/outfits.ts';
import { enforceRateLimit, getUserClient, recordUsage } from '../_shared/supabase.ts';

const Categories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag'] as const;

const OutfitsSchema = z.object({
  outfits: z.array(
    z.object({
      name: z.string().describe('Nombre evocador y corto del look, en español'),
      garment_ids: z
        .array(z.string())
        .describe('Códigos de las prendas del armario (p. ej. "p3"), de arriba abajo'),
      explanation: z.string().describe('2 o 3 frases: por qué funciona para la ocasión y la persona'),
      color_harmony: z.string().describe('Una frase sobre la armonía de color y la paleta personal'),
      styling_tip: z.string().describe('Un consejo práctico: cómo llevarlo, remangar, meter por dentro…'),
      missing_piece: z
        .string()
        .describe('Pieza que lo completaría y NO está en el armario, o cadena vacía'),
      missing_piece_category: z.enum([...Categories, 'none']),
    }),
  ),
});

const System = `Eres el estilista personal de LuxeMatch AI. Creas outfits usando EXCLUSIVAMENTE las
prendas del armario que se te dan, identificadas por su código. Nunca inventes prendas ni códigos.

Reglas obligatorias:
- Cada outfit lleva una parte de arriba (top) y una de abajo (bottom), o un vestido (dress).
- El calzado es opcional pero recomendable si hay; añade abrigo en tiempo frío si hay.
- Adapta cada look a la ocasión indicada y a la temporada.
- Respeta la paleta personal: usa los colores recomendados cerca de la cara y evita los colores
  a evitar en la parte de arriba.
- Ten en cuenta el estilo y las preferencias de la persona.
- No repitas combinaciones que ya tiene guardadas y varía las prendas entre propuestas.
- Si falta una pieza para completar el look, indícala en missing_piece; prioriza siempre
  reutilizar el armario antes que sugerir compras.
Escribe en español de España, con tono cercano y experto, y sin exagerar.`;

serve(async (req) => {
  const { client, user } = await getUserClient(req);

  const body = await req.json().catch(() => ({}));
  const occasion = String(body?.occasion ?? '');
  const season = String(body?.season ?? '');
  const notes = String(body?.notes ?? '').trim().slice(0, 200);
  const count = Math.min(Math.max(Number(body?.count) || 3, 1), 4);
  if (!OccasionLabels[occasion] || !SeasonLabels[season]) {
    throw new HttpError('bad_request', 'Ocasión o temporada no válidas.');
  }

  await enforceRateLimit(user.id, 'outfit_generated', 20);

  const [garmentsResult, profileResult, colorResult, outfitsResult] = await Promise.all([
    client
      .from('garments')
      .select('id, name, category, subcategory, primary_color_hex, color_name, styles, occasions, seasons'),
    client.from('profiles').select('style_preferences').eq('id', user.id).maybeSingle(),
    client
      .from('color_profiles')
      .select('season, palette, recommended_colors, avoid_colors')
      .eq('user_id', user.id)
      .maybeSingle(),
    client
      .from('outfits')
      .select('name, is_favorite, outfit_items(garment_id)')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  if (garmentsResult.error) throw garmentsResult.error;

  // RB4 + RB10: solo prendas que existen y sirven para la temporada.
  const wardrobe = (garmentsResult.data as Garment[]).filter((g) => fitsSeason(g, season));
  const missing = missingForOutfits(wardrobe);
  if (missing) throw new HttpError('not_enough_garments', missing);

  const prefs = (profileResult.data?.style_preferences ?? {}) as Record<string, unknown>;
  const color = colorResult.data;
  const saved = (outfitsResult.data ?? []) as {
    name: string;
    is_favorite: boolean;
    outfit_items: { garment_id: string }[];
  }[];

  const userContext: UserContext = {
    styles: (prefs.styles as string[]) ?? [],
    favoriteColors: ((prefs.favoriteColors as string[]) ?? []).map((c) => c.toLowerCase()),
    recommended: (color?.recommended_colors as Swatch[]) ?? [],
    avoid: (color?.avoid_colors as Swatch[]) ?? [],
    palette: (color?.palette as Swatch[]) ?? [],
    savedCombos: new Set(saved.map((o) => comboKey(o.outfit_items.map((i) => i.garment_id)))),
  };

  const startedAt = Date.now();
  let source: 'ai' | 'rules' = 'ai';
  let outfits: OutfitProposal[] = [];
  let usage: Record<string, unknown> = {};

  try {
    const generated = await generateWithClaude({
      wardrobe,
      occasion,
      season,
      notes,
      count,
      prefs,
      color,
      saved,
    });
    usage = generated.usage;
    outfits = validateProposals(generated.proposals, wardrobe, userContext.savedCombos);
    if (outfits.length === 0) throw new HttpError('ai_failed', 'Ninguna propuesta válida.');
  } catch (error) {
    // RNF7: si la IA falla o no está configurada, seguimos con el generador por reglas.
    if (!(error instanceof HttpError)) throw error;
    console.warn('[generate-outfits] usando reglas:', error.code);
    source = 'rules';
    outfits = generateByRules(wardrobe, occasion, season, userContext, count);
  }

  await recordUsage(user.id, 'outfit_generated', {
    ...usage,
    source,
    occasion,
    season,
    proposals: outfits.length,
    wardrobe_size: wardrobe.length,
    ms: Date.now() - startedAt,
  });

  if (outfits.length === 0) {
    throw new HttpError(
      'not_enough_garments',
      'Ya tienes guardadas todas las combinaciones posibles. Añade más prendas para nuevos looks.',
    );
  }
  return json({ source, outfits });
});

async function generateWithClaude(input: {
  wardrobe: Garment[];
  occasion: string;
  season: string;
  notes: string;
  count: number;
  prefs: Record<string, unknown>;
  color: { season: string | null; palette: unknown; recommended_colors: unknown; avoid_colors: unknown } | null;
  saved: { name: string; is_favorite: boolean; outfit_items: { garment_id: string }[] }[];
}) {
  // Códigos cortos en lugar de UUID: menos tokens y sin riesgo de ids inventados.
  const codeById = new Map(input.wardrobe.map((g, i) => [g.id, `p${i + 1}`]));
  const idByCode = new Map([...codeById].map(([id, code]) => [code, id]));

  const wardrobeText = input.wardrobe
    .map((g) =>
      [
        codeById.get(g.id),
        g.category,
        g.name,
        g.subcategory && `tipo: ${g.subcategory}`,
        g.color_name && `color: ${g.color_name}${g.primary_color_hex ? ` ${g.primary_color_hex}` : ''}`,
        g.styles.length && `estilos: ${g.styles.join(', ')}`,
        g.occasions.length && `ocasiones: ${g.occasions.join(', ')}`,
      ]
        .filter(Boolean)
        .join(' | '),
    )
    .join('\n');

  const swatches = (value: unknown) =>
    ((value as Swatch[]) ?? []).map((s) => `${s.name} ${s.hex}`).join(', ') || 'sin datos';
  const list = (value: unknown) => ((value as string[]) ?? []).join(', ') || 'sin datos';

  const history = input.saved
    .map((o) => {
      const codes = o.outfit_items.map((i) => codeById.get(i.garment_id)).filter(Boolean);
      return codes.length ? `${o.is_favorite ? '★ ' : ''}${o.name}: ${codes.join(', ')}` : null;
    })
    .filter(Boolean)
    .join('\n');

  const prompt = `Crea ${input.count} outfits distintos para ${OccasionLabels[input.occasion]} en ${SeasonLabels[input.season]}.
${input.notes ? `Petición de la persona: "${input.notes}"\n` : ''}
<armario>
${wardrobeText}
</armario>

<perfil>
Estilos: ${list(input.prefs.styles)}
Siluetas preferidas: ${list(input.prefs.fits)}
Prioridades: ${list(input.prefs.priorities)}
Colores que le gustan: ${list(input.prefs.favoriteColors)}
Presupuesto: ${String(input.prefs.budget ?? 'sin datos')}
</perfil>

<colorimetria>
Estación: ${input.color?.season ?? 'sin analizar'}
Colores recomendados: ${swatches(input.color?.recommended_colors)}
Colores a evitar: ${swatches(input.color?.avoid_colors)}
</colorimetria>

<outfits_guardados>
${history || 'Ninguno todavía.'}
</outfits_guardados>
Los marcados con ★ son favoritos: inspírate en lo que le gusta, pero sin repetirlos.`;

  const { result, usage } = await generateStructured({
    schema: OutfitsSchema,
    system: System,
    content: [{ type: 'text', text: prompt }],
    effort: 'low',
  });

  const proposals: OutfitProposal[] = result.outfits.map((o) => ({
    name: o.name,
    garment_ids: o.garment_ids.map((code) => idByCode.get(code.trim()) ?? `invalid:${code}`),
    explanation: o.explanation,
    color_harmony: o.color_harmony,
    styling_tip: o.styling_tip,
    missing_piece: o.missing_piece,
    missing_piece_category: o.missing_piece_category === 'none' ? null : o.missing_piece_category,
  }));
  return { proposals, usage };
}

/** Descarta propuestas con prendas inexistentes, incompletas (RB9) o repetidas. */
function validateProposals(proposals: OutfitProposal[], wardrobe: Garment[], savedCombos: Set<string>) {
  const byId = new Map(wardrobe.map((g) => [g.id, g]));
  const seen = new Set<string>();
  const valid: OutfitProposal[] = [];

  for (const proposal of proposals) {
    const ids = [...new Set(proposal.garment_ids)];
    if (ids.some((id) => !byId.has(id))) continue;
    if (!isCompleteOutfit(ids.map((id) => byId.get(id)!))) continue;
    const key = comboKey(ids);
    if (seen.has(key) || savedCombos.has(key)) continue;
    seen.add(key);
    valid.push({ ...proposal, garment_ids: ids });
  }
  return valid;
}
