/**
 * Restyle (RF14): ideas para reutilizar o transformar una prenda del armario.
 * Propone modificaciones sencillas, adaptaciones a tendencias, consejos de
 * estilismo y accesorios complementarios. El resultado se guarda en la prenda.
 * Si la IA no está disponible, se usan sugerencias por reglas.
 *
 * POST { garment_id }  →  { source, restyle }
 */
import { analyzeImage, generateStructured } from '../_shared/claude.ts';
import { z } from '../_shared/deps.ts';
import { HttpError, json, serve } from '../_shared/http.ts';
import { enforceRateLimit, getUserClient, recordUsage } from '../_shared/supabase.ts';

const RestyleSchema = z.object({
  worth_transforming: z
    .boolean()
    .describe('true si la prenda tiene margen para transformarse o darle un aire nuevo'),
  summary: z.string().describe('1 o 2 frases sobre el potencial de la prenda'),
  transformations: z
    .array(
      z.object({
        title: z.string().describe('Nombre corto de la idea'),
        description: z.string().describe('Cómo hacerlo, en 1 o 2 frases'),
        type: z.enum(['modificacion', 'estilismo', 'tendencia']),
        difficulty: z.enum(['facil', 'media']),
      }),
    )
    .describe('4 ideas variadas: alguna modificación sencilla (costura, teñido, cortar…) y formas de llevarla'),
  trend_adaptations: z.array(z.string()).describe('2 formas de adaptarla a tendencias actuales'),
  accessories: z
    .array(
      z.object({
        name: z.string().describe('Accesorio concreto, en español'),
        category: z.enum(['shoes', 'bag', 'accessory', 'outerwear']),
        color_name: z.string().describe('Color sugerido, en español'),
      }),
    )
    .describe('3 complementos que la renuevan'),
});

type Restyle = z.infer<typeof RestyleSchema>;

const System = `Eres una estilista experta en moda sostenible y upcycling. Tu objetivo es que la persona
vuelva a usar prendas que ya tiene en lugar de comprar nuevas. Propón ideas realistas y
seguras de hacer en casa o con una costurera, y formas nuevas de llevar la prenda.
No propongas transformaciones que estropeen prendas delicadas o de valor sin avisarlo.
Escribe en español de España, con tono cercano y práctico.`;

type GarmentRow = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  color_name: string | null;
  styles: string[];
  seasons: string[];
  image_path: string | null;
  ai_metadata: Record<string, unknown> | null;
};

serve(async (req) => {
  const { client, user } = await getUserClient(req);
  const body = await req.json().catch(() => ({}));
  const garmentId = String(body?.garment_id ?? '');
  if (!garmentId) throw new HttpError('bad_request', 'Falta la prenda.');

  const { data: garment, error } = await client
    .from('garments')
    .select('id, name, category, subcategory, color_name, styles, seasons, image_path, ai_metadata')
    .eq('id', garmentId)
    .maybeSingle<GarmentRow>();
  if (error) throw error;
  if (!garment) throw new HttpError('not_found', 'La prenda no existe.');

  await enforceRateLimit(user.id, 'ai_restyle', 10);

  const { count: outfitUses } = await client
    .from('outfit_items')
    .select('outfit_id', { count: 'exact', head: true })
    .eq('garment_id', garment.id);

  const startedAt = Date.now();
  let source: 'ai' | 'rules' = 'ai';
  let restyle: Restyle;
  let usage: Record<string, unknown> = {};

  try {
    const generated = await restyleWithClaude(client, garment, outfitUses ?? 0);
    restyle = generated.result;
    usage = generated.usage;
  } catch (error) {
    // RNF7: sin IA, seguimos con ideas por reglas según la categoría.
    if (!(error instanceof HttpError)) throw error;
    console.warn('[restyle] usando reglas:', error.code);
    source = 'rules';
    restyle = restyleByRules(garment);
  }

  const saved = { ...restyle, source, generated_at: new Date().toISOString() };
  const { error: updateError } = await client
    .from('garments')
    .update({ restyle: saved, restyled_at: saved.generated_at })
    .eq('id', garment.id);
  if (updateError) throw updateError;

  await recordUsage(user.id, 'ai_restyle', {
    ...usage,
    source,
    category: garment.category,
    ms: Date.now() - startedAt,
  });

  return json({ source, restyle: saved });
});

async function restyleWithClaude(
  client: Awaited<ReturnType<typeof getUserClient>>['client'],
  garment: GarmentRow,
  outfitUses: number,
) {
  const description = [
    `Prenda: ${garment.name} (${garment.category}${garment.subcategory ? `, ${garment.subcategory}` : ''})`,
    garment.color_name && `Color: ${garment.color_name}`,
    garment.styles.length && `Estilos: ${garment.styles.join(', ')}`,
    garment.seasons.length && `Temporadas: ${garment.seasons.join(', ')}`,
    typeof garment.ai_metadata?.material_guess === 'string' &&
      garment.ai_metadata.material_guess &&
      `Tejido probable: ${garment.ai_metadata.material_guess}`,
    `Aparece en ${outfitUses} outfit(s) guardado(s).`,
  ]
    .filter(Boolean)
    .join('\n');
  const instruction = `Dame ideas de Restyle para esta prenda de mi armario.\n\n${description}`;

  if (garment.image_path) {
    const { data: file } = await client.storage.from('garments').download(garment.image_path);
    if (file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      return analyzeImage({
        schema: RestyleSchema,
        system: System,
        instruction,
        imageBase64: encodeBase64(bytes),
        effort: 'low',
      });
    }
  }
  return generateStructured({
    schema: RestyleSchema,
    system: System,
    content: [{ type: 'text', text: instruction }],
    effort: 'low',
  });
}

/** Ideas genéricas por categoría para cuando la IA no está disponible. */
function restyleByRules(garment: GarmentRow): Restyle {
  // Textos sin el nombre de la prenda para no depender de su género gramatical.
  const byCategory: Record<string, Restyle['transformations']> = {
    top: [
      { title: 'Por dentro y con cinturón', description: 'Métela por dentro de un pantalón de tiro alto y marca la cintura con un cinturón fino.', type: 'estilismo', difficulty: 'facil' },
      { title: 'En capas', description: 'Combínala con otra prenda por encima o por debajo (una camisa, un chaleco) para crear volumen y contraste.', type: 'estilismo', difficulty: 'facil' },
      { title: 'Detalles nuevos', description: 'Cambia botones, añade un parche o borda un detalle pequeño para darle un aire nuevo.', type: 'modificacion', difficulty: 'facil' },
      { title: 'Versión recortada', description: 'Acorta el largo o las mangas y remata el bajo para una versión más actual y de entretiempo.', type: 'modificacion', difficulty: 'media' },
    ],
    bottom: [
      { title: 'Bajo nuevo', description: 'Acorta el bajo a la altura del tobillo; en tejidos vaqueros puedes dejarlo ligeramente deshilachado.', type: 'modificacion', difficulty: 'facil' },
      { title: 'Con mocasines y calcetín', description: 'Combínalo con mocasines y calcetín fino a la vista para un look actual.', type: 'tendencia', difficulty: 'facil' },
      { title: 'Pinzas y cinturón', description: 'Marca la cintura con un cinturón fino y mete por dentro la parte de arriba.', type: 'estilismo', difficulty: 'facil' },
      { title: 'Ajuste a medida', description: 'Llévalo a una costurera para estrechar o ensanchar la pernera según la silueta que buscas.', type: 'modificacion', difficulty: 'media' },
    ],
    dress: [
      { title: 'Vestido como falda', description: 'Ponte un jersey fino encima para convertirlo en falda.', type: 'estilismo', difficulty: 'facil' },
      { title: 'Sobre pantalón', description: 'Llévalo sobre un pantalón recto o vaquero, una tendencia muy actual.', type: 'tendencia', difficulty: 'facil' },
      { title: 'Acortar el largo', description: 'Acórtalo a la altura de la rodilla para darle un uso más diario.', type: 'modificacion', difficulty: 'media' },
      { title: 'Teñido', description: 'Si es de algodón o lino, tíñelo en un tono de tu paleta para renovarlo.', type: 'modificacion', difficulty: 'media' },
    ],
  };
  const generic: Restyle['transformations'] = [
    { title: 'Nueva combinación', description: 'Combínala con una prenda con la que nunca la hayas llevado.', type: 'estilismo', difficulty: 'facil' },
    { title: 'Color de tu paleta', description: 'Acompáñala de una pieza en un color de tu paleta para actualizarla.', type: 'estilismo', difficulty: 'facil' },
    { title: 'Arreglo a tiempo', description: 'Revisa cierres, suelas o costuras: un pequeño arreglo alarga mucho su vida.', type: 'modificacion', difficulty: 'facil' },
  ];

  return {
    worth_transforming: true,
    summary: `${garment.name} puede tener una segunda vida con pequeños cambios y nuevas combinaciones.`,
    transformations: byCategory[garment.category] ?? generic,
    trend_adaptations: [
      'Juega con las proporciones: combina una pieza amplia con otra ajustada.',
      'Añade un toque metálico o de textura para darle un aire actual.',
    ],
    accessories: [
      { name: 'Cinturón fino de piel', category: 'accessory', color_name: 'Camel' },
      { name: 'Bolso de mano estructurado', category: 'bag', color_name: 'Negro' },
      { name: 'Pendientes dorados', category: 'accessory', color_name: 'Dorado' },
    ],
  };
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
