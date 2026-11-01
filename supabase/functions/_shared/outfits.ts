/**
 * Lógica común de la generación de outfits: tipos, filtros por reglas de
 * negocio, validación de la composición (RB9) y un generador por reglas que se
 * usa cuando la IA no está disponible (RNF7: disponibilidad).
 */

export type Garment = {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory' | 'bag';
  subcategory: string | null;
  primary_color_hex: string | null;
  color_name: string | null;
  styles: string[];
  occasions: string[];
  seasons: string[];
};

export type Swatch = { hex: string; name: string };

export type UserContext = {
  styles: string[];
  favoriteColors: string[];
  recommended: Swatch[];
  avoid: Swatch[];
  palette: Swatch[];
  /** Combinaciones ya guardadas (ids ordenados), para no repetirlas (RB5). */
  savedCombos: Set<string>;
};

export type OutfitProposal = {
  name: string;
  garment_ids: string[];
  explanation: string;
  color_harmony: string;
  styling_tip: string;
  missing_piece: string;
  missing_piece_category: Garment['category'] | null;
};

export const OccasionLabels: Record<string, string> = {
  oficina: 'la oficina',
  casual: 'el día a día',
  cena: 'una cena',
  boda: 'una boda o ceremonia',
  gala: 'una gala o evento de noche',
  fiesta: 'una fiesta',
  entrevista: 'una entrevista',
  viaje: 'un viaje',
};

export const SeasonLabels: Record<string, string> = {
  primavera: 'primavera',
  verano: 'verano',
  otono: 'otoño',
  invierno: 'invierno',
};

/** RB4: una prenda sin temporadas marcadas vale para todo el año. */
export function fitsSeason(garment: Garment, season: string) {
  return garment.seasons.length === 0 || garment.seasons.includes(season);
}

/** RB9: parte de arriba + parte de abajo, o un vestido. */
export function isCompleteOutfit(garments: Garment[]) {
  const has = (category: Garment['category']) => garments.some((g) => g.category === category);
  return (has('top') && has('bottom')) || has('dress');
}

/** Qué falta en el armario para poder crear al menos un outfit. */
export function missingForOutfits(garments: Garment[]): string | null {
  const count = (category: Garment['category']) =>
    garments.filter((g) => g.category === category).length;
  if (count('dress') > 0 || (count('top') > 0 && count('bottom') > 0)) return null;
  if (count('top') === 0 && count('bottom') === 0) {
    return 'Añade al menos una parte de arriba y una de abajo, o un vestido, para esta temporada.';
  }
  return count('top') === 0
    ? 'Añade al menos una parte de arriba de esta temporada (o un vestido).'
    : 'Añade al menos una parte de abajo de esta temporada (o un vestido).';
}

export function comboKey(ids: string[]) {
  return [...ids].sort().join('|');
}

// --- Generador por reglas ---------------------------------------------------------

const NeutralColors = new Set([
  'Negro', 'Blanco', 'Marfil', 'Beige', 'Camel', 'Gris', 'Azul marino', 'Marrón',
]);
const ColdSeasons = new Set(['otono', 'invierno']);

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistance(a: string, b: string) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function nearAny(hex: string | null, swatches: Swatch[]) {
  return !!hex && swatches.some((s) => colorDistance(hex, s.hex) < 70);
}

/** Puntuación de una prenda para la ocasión y el perfil (RB2, RB3, RB5). */
function scoreGarment(garment: Garment, occasion: string, user: UserContext) {
  let score = 0;
  if (garment.occasions.includes(occasion)) score += 3;
  else if (garment.occasions.length === 0) score += 1;
  else score -= 2;

  score += Math.min(garment.styles.filter((s) => user.styles.includes(s)).length, 2);

  if (nearAny(garment.primary_color_hex, [...user.recommended, ...user.palette])) score += 2;
  if (nearAny(garment.primary_color_hex, user.avoid)) score -= 2;
  if (garment.color_name && user.favoriteColors.some((c) => garment.color_name!.toLowerCase().includes(c))) {
    score += 1;
  }
  return score;
}

/**
 * Genera outfits combinando las prendas mejor puntuadas y repartiendo las
 * piezas entre propuestas para que haya variedad.
 */
export function generateByRules(
  garments: Garment[],
  occasion: string,
  season: string,
  user: UserContext,
  count: number,
): OutfitProposal[] {
  const scored = garments
    .map((g) => ({ g, score: scoreGarment(g, occasion, user) }))
    .sort((a, b) => b.score - a.score);
  const byCategory = (category: Garment['category']) => scored.filter((s) => s.g.category === category);

  const bases: { ids: Garment[]; score: number }[] = [];
  for (const top of byCategory('top').slice(0, 4)) {
    for (const bottom of byCategory('bottom').slice(0, 4)) {
      const harmony =
        NeutralColors.has(top.g.color_name ?? '') || NeutralColors.has(bottom.g.color_name ?? '') ? 1 : 0;
      bases.push({ ids: [top.g, bottom.g], score: top.score + bottom.score + harmony });
    }
  }
  for (const dress of byCategory('dress').slice(0, 4)) {
    bases.push({ ids: [dress.g], score: dress.score * 2 });
  }
  bases.sort((a, b) => b.score - a.score);

  const usage = new Map<string, number>();
  const pickExtra = (category: Garment['category']) => {
    const options = byCategory(category);
    if (options.length === 0) return null;
    // La opción mejor puntuada que menos se haya usado ya.
    return [...options].sort(
      (a, b) => (usage.get(a.g.id) ?? 0) - (usage.get(b.g.id) ?? 0) || b.score - a.score,
    )[0].g;
  };

  const proposals: OutfitProposal[] = [];
  const seen = new Set<string>();
  const remaining = [...bases];

  while (proposals.length < count && remaining.length > 0) {
    // Penalizamos bases que repiten prendas ya usadas en otras propuestas.
    remaining.sort(
      (a, b) =>
        b.score - b.ids.reduce((n, g) => n + (usage.get(g.id) ?? 0) * 3, 0) -
        (a.score - a.ids.reduce((n, g) => n + (usage.get(g.id) ?? 0) * 3, 0)),
    );
    const base = remaining.shift()!;
    const pieces = [...base.ids];
    const shoes = pickExtra('shoes');
    if (shoes) pieces.push(shoes);
    if (ColdSeasons.has(season)) {
      const coat = pickExtra('outerwear');
      if (coat) pieces.push(coat);
    }
    const bag = pickExtra('bag');
    if (bag) pieces.push(bag);

    const key = comboKey(pieces.map((p) => p.id));
    if (seen.has(key) || user.savedCombos.has(key)) continue;
    seen.add(key);
    pieces.forEach((p) => usage.set(p.id, (usage.get(p.id) ?? 0) + 1));
    proposals.push(describeByRules(pieces, occasion, season));
  }
  return proposals;
}

/** "a, b y c" */
function joinSpanish(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items.at(-1)}` : (items[0] ?? '');
}

function describeByRules(pieces: Garment[], occasion: string, season: string): OutfitProposal {
  const main = pieces.find((p) => p.category === 'dress') ?? pieces.find((p) => p.category === 'top')!;
  const list = joinSpanish(pieces.map((p) => p.name.toLowerCase()));
  const colors = [...new Set(pieces.map((p) => p.color_name).filter(Boolean))] as string[];
  const neutrals = colors.filter((c) => NeutralColors.has(c));

  const missing: Garment['category'] | null = !pieces.some((p) => p.category === 'shoes')
    ? 'shoes'
    : !pieces.some((p) => p.category === 'bag')
      ? 'bag'
      : null;

  const baseColors = [...new Set(
    pieces
      .filter((p) => p.category === 'top' || p.category === 'bottom' || p.category === 'dress')
      .map((p) => p.color_name?.toLowerCase())
      .filter(Boolean),
  )];
  const colorTitle = baseColors.length > 0 ? baseColors.join(' y ') : main.name.toLowerCase();

  return {
    name: `${colorTitle.charAt(0).toUpperCase()}${colorTitle.slice(1)} para ${OccasionLabels[occasion] ?? occasion}`,
    garment_ids: pieces.map((p) => p.id),
    explanation: `Para ${OccasionLabels[occasion] ?? occasion} en ${SeasonLabels[season] ?? season} combinamos ${list}. Son prendas de tu armario que encajan con la ocasión y con tu estilo.`,
    color_harmony:
      neutrals.length > 0
        ? `Los tonos ${joinSpanish(neutrals.map((c) => c.toLowerCase()))} equilibran el conjunto y dejan protagonismo al resto.`
        : `La combinación de ${joinSpanish(colors.map((c) => c.toLowerCase())) || 'colores'} crea un look con personalidad.`,
    styling_tip: 'Añade un accesorio en un color de tu paleta para darle el toque final.',
    missing_piece: missing === 'shoes' ? 'Un calzado a juego' : missing === 'bag' ? 'Un bolso que complete el look' : '',
    missing_piece_category: missing,
  };
}
