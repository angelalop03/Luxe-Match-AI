import { complementCategoriesFor, recommendProducts, type RecommendationContext } from '@/features/shop/recommend';
import { makeGarment, makeProduct } from '@/test/factories';

const baseContext: RecommendationContext = {
  garments: [],
  styles: [],
  budget: null,
  recommendedColors: [],
  palette: [],
  avoidColors: [],
};

describe('recommendProducts', () => {
  it('no recomienda productos que duplican una prenda del armario (RB6)', () => {
    const blackBag = makeGarment({ category: 'bag', primary_color_hex: '#1A1714', color_name: 'Negro' });
    const similarBag = makeProduct({ category: 'bag', color_hex: '#111111', color_name: 'Negro' });
    const camelBag = makeProduct({ category: 'bag', color_hex: '#B98A5A', color_name: 'Camel' });

    const result = recommendProducts([similarBag, camelBag], { ...baseContext, garments: [blackBag] });

    expect(result.map((r) => r.product.id)).toEqual([camelBag.id]);
  });

  it('sí recomienda el mismo color en otra categoría', () => {
    const blackBag = makeGarment({ category: 'bag', primary_color_hex: '#1A1714', color_name: 'Negro' });
    const blackShoes = makeProduct({ category: 'shoes', color_hex: '#1A1714', color_name: 'Negro' });

    const result = recommendProducts([blackShoes], { ...baseContext, garments: [blackBag] });

    expect(result).toHaveLength(1);
  });

  it('respeta el filtro de categorías', () => {
    const shoes = makeProduct({ category: 'shoes' });
    const bag = makeProduct({ category: 'bag' });

    const result = recommendProducts([shoes, bag], baseContext, { categories: ['bag'] });

    expect(result.map((r) => r.product.category)).toEqual(['bag']);
  });

  it('prioriza la paleta personal y penaliza los colores a evitar (RB2)', () => {
    const terracotta = makeProduct({ color_hex: '#C46A4A', color_name: 'Terracota' });
    const fuchsia = makeProduct({ color_hex: '#FF2D8A', color_name: 'Fucsia' });
    const context = {
      ...baseContext,
      recommendedColors: [{ hex: '#C46A4A', name: 'Terracota' }],
      avoidColors: [{ hex: '#FF2D8A', name: 'Fucsia' }],
    };

    const [first, second] = recommendProducts([fuchsia, terracotta], context, { categories: ['accessory'] });

    expect(first.product.id).toBe(terracotta.id);
    expect(first.reasons).toContain('Está en tu paleta de color');
    expect(second.score).toBeLessThan(first.score);
  });

  it('penaliza lo que se sale del presupuesto', () => {
    const cheap = makeProduct({ price: 40 });
    const expensive = makeProduct({ price: 900 });

    const [first] = recommendProducts([expensive, cheap], { ...baseContext, budget: 'low' });

    expect(first.product.id).toBe(cheap.id);
    expect(first.reasons).toContain('Dentro de tu presupuesto');
  });

  it('adapta el orden a la ocasión y la temporada (RB3, RB4)', () => {
    const forWedding = makeProduct({ occasions: ['boda'], seasons: ['verano'] });
    const forOffice = makeProduct({ occasions: ['oficina'], seasons: ['invierno'] });

    const [first] = recommendProducts([forOffice, forWedding], baseContext, {
      occasion: 'boda',
      season: 'verano',
    });

    expect(first.product.id).toBe(forWedding.id);
  });

  it('respeta el límite de resultados', () => {
    const products = Array.from({ length: 10 }, () => makeProduct());
    expect(recommendProducts(products, baseContext, { limit: 3 })).toHaveLength(3);
  });
});

describe('complementCategoriesFor', () => {
  it('usa la pieza que falta si la IA la indicó', () => {
    expect(complementCategoriesFor([], 'shoes')).toEqual(['shoes']);
  });

  it('propone solo complementos que el outfit aún no lleva (RB6)', () => {
    const outfit = [
      makeGarment({ category: 'top' }),
      makeGarment({ category: 'bottom' }),
      makeGarment({ category: 'shoes' }),
    ];
    expect(complementCategoriesFor(outfit, null)).toEqual(['bag', 'accessory', 'outerwear']);
  });
});
