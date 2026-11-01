import { recommendProducts, type RecommendationContext } from '@/features/shop/recommend';
import type { Restyle } from '@/types/garment';
import type { Product, Recommendation } from '@/types/product';

/**
 * Para cada complemento sugerido por el Restyle, busca en el catálogo el
 * producto más parecido (misma categoría, preferiblemente del mismo color)
 * que no duplique el armario (RB6). Cada producto se usa una sola vez.
 */
export function matchAccessoryProducts(
  products: Product[],
  context: RecommendationContext,
  accessories: Restyle['accessories'],
): Recommendation[] {
  const used = new Set<string>();
  const matches: Recommendation[] = [];

  for (const accessory of accessories) {
    const candidates = recommendProducts(products, context, {
      categories: [accessory.category],
      limit: 20,
    }).filter((r) => !used.has(r.product.id));
    const wanted = accessory.color_name.toLowerCase();
    const best =
      candidates.find((r) => r.product.color_name?.toLowerCase() === wanted) ?? candidates[0];
    if (!best) continue;
    used.add(best.product.id);
    matches.push({ ...best, reasons: [`Para: ${accessory.name.toLowerCase()}`, ...best.reasons] });
  }
  return matches;
}
