import { isNearColor } from '@/lib/colors';
import type { ColorSwatch } from '@/types/color-profile';
import type { Garment, GarmentCategory } from '@/types/garment';
import type { Product, Recommendation } from '@/types/product';

/** Datos del usuario que influyen en las recomendaciones (RB2, RB5). */
export type RecommendationContext = {
  garments: Garment[];
  styles: string[];
  budget: string | null;
  recommendedColors: ColorSwatch[];
  palette: ColorSwatch[];
  avoidColors: ColorSwatch[];
};

type RecommendOptions = {
  /** Solo estas categorías (p. ej. la pieza que le falta a un outfit). */
  categories?: GarmentCategory[];
  occasion?: string | null;
  season?: string | null;
  limit?: number;
};

/** Precio máximo cómodo por prenda según el presupuesto del quiz. */
const BudgetMax: Record<string, number> = {
  low: 60,
  medium: 160,
  high: 420,
  luxury: Number.POSITIVE_INFINITY,
};

/** Categorías que completan un look sin ser la base (top/bottom/dress). */
export const ComplementCategories: GarmentCategory[] = ['shoes', 'bag', 'accessory', 'outerwear'];

/**
 * RB6: un producto duplica una prenda si el usuario ya tiene algo de la misma
 * categoría en un color muy parecido.
 */
function duplicatesWardrobe(product: Product, garments: Garment[]) {
  return garments.some(
    (g) =>
      g.category === product.category &&
      ((g.primary_color_hex && product.color_hex && isNearColor(product.color_hex, [{ hex: g.primary_color_hex }], 60)) ||
        (!!g.color_name && g.color_name === product.color_name)),
  );
}

/**
 * Ordena el catálogo para el usuario y devuelve los mejores productos con
 * los motivos de cada recomendación.
 */
export function recommendProducts(
  products: Product[],
  context: RecommendationContext,
  options: RecommendOptions = {},
): Recommendation[] {
  const ownedCategories = new Set(context.garments.map((g) => g.category));
  const maxPrice = context.budget ? BudgetMax[context.budget] : undefined;

  const results: Recommendation[] = [];
  for (const product of products) {
    if (options.categories && !options.categories.includes(product.category)) continue;
    if (duplicatesWardrobe(product, context.garments)) continue;

    let score = 0;
    const reasons: string[] = [];

    if (options.occasion) {
      if (product.occasions.includes(options.occasion)) {
        score += 3;
        reasons.push('Perfecto para la ocasión');
      } else {
        score -= 1;
      }
    }
    if (options.season) {
      if (product.seasons.includes(options.season)) score += 2;
      else score -= 2;
    }

    const sharedStyles = product.styles.filter((s) => context.styles.includes(s)).length;
    if (sharedStyles > 0) {
      score += Math.min(sharedStyles, 2);
      reasons.push('Encaja con tu estilo');
    }

    if (isNearColor(product.color_hex, [...context.recommendedColors, ...context.palette])) {
      score += 2;
      reasons.push('Está en tu paleta de color');
    } else if (isNearColor(product.color_hex, context.avoidColors)) {
      score -= 3;
    }

    if (maxPrice !== undefined && product.price !== null) {
      if (product.price <= maxPrice) {
        score += 1;
        reasons.push('Dentro de tu presupuesto');
      } else {
        score -= 2;
      }
    }

    // Sin filtro de categoría, priorizamos lo que aún no hay en el armario.
    if (!options.categories && !ownedCategories.has(product.category)) {
      score += 2;
      reasons.unshift('Aún no tienes nada así');
    }

    results.push({ product, score, reasons });
  }

  return results
    .sort((a, b) => b.score - a.score || (a.product.price ?? 0) - (b.product.price ?? 0))
    .slice(0, options.limit ?? 12);
}

/**
 * Categorías que completarían un outfit: la pieza que la IA marcó como
 * pendiente o, si no hay, los complementos que todavía no lleva (RB6).
 */
export function complementCategoriesFor(
  outfitGarments: Garment[],
  missingCategory: GarmentCategory | null,
): GarmentCategory[] {
  if (missingCategory) return [missingCategory];
  const present = new Set(outfitGarments.map((g) => g.category));
  return ComplementCategories.filter((c) => !present.has(c));
}
