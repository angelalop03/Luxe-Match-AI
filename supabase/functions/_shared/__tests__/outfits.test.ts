/**
 * Tests del generador por reglas y de la validación de outfits. Se ejecutan
 * con Jest desde la app (`cd app && npm test`): este módulo no usa APIs de Deno.
 */
import {
  comboKey,
  fitsSeason,
  generateByRules,
  isCompleteOutfit,
  missingForOutfits,
  type Garment,
  type UserContext,
} from '../outfits';

let sequence = 0;
function garment(overrides: Partial<Garment>): Garment {
  sequence += 1;
  return {
    id: `g${sequence}`,
    name: `Prenda ${sequence}`,
    category: 'top',
    subcategory: null,
    primary_color_hex: null,
    color_name: null,
    styles: [],
    occasions: [],
    seasons: [],
    ...overrides,
  };
}

const user: UserContext = {
  styles: ['clasico'],
  favoriteColors: [],
  recommended: [],
  avoid: [],
  palette: [],
  savedCombos: new Set(),
};

describe('isCompleteOutfit (RB9)', () => {
  it('acepta parte de arriba + parte de abajo', () => {
    expect(isCompleteOutfit([garment({ category: 'top' }), garment({ category: 'bottom' })])).toBe(true);
  });

  it('acepta un vestido solo', () => {
    expect(isCompleteOutfit([garment({ category: 'dress' })])).toBe(true);
  });

  it('rechaza una parte de arriba sin parte de abajo', () => {
    expect(isCompleteOutfit([garment({ category: 'top' }), garment({ category: 'shoes' })])).toBe(false);
  });
});

describe('fitsSeason (RB4)', () => {
  it('una prenda sin temporadas vale para todo el año', () => {
    expect(fitsSeason(garment({ seasons: [] }), 'verano')).toBe(true);
  });

  it('respeta las temporadas marcadas', () => {
    const coat = garment({ seasons: ['otono', 'invierno'] });
    expect(fitsSeason(coat, 'invierno')).toBe(true);
    expect(fitsSeason(coat, 'verano')).toBe(false);
  });
});

describe('missingForOutfits', () => {
  it('no pide nada si hay base suficiente', () => {
    expect(missingForOutfits([garment({ category: 'dress' })])).toBeNull();
  });

  it('indica qué falta', () => {
    expect(missingForOutfits([garment({ category: 'top' })])).toMatch(/parte de abajo/);
    expect(missingForOutfits([garment({ category: 'bottom' })])).toMatch(/parte de arriba/);
    expect(missingForOutfits([])).toMatch(/arriba y una de abajo/);
  });
});

describe('generateByRules (RF8)', () => {
  const wardrobe = [
    garment({ category: 'top', name: 'Camisa', occasions: ['oficina'], color_name: 'Marfil' }),
    garment({ category: 'top', name: 'Jersey', occasions: ['casual'], color_name: 'Verde oliva' }),
    garment({ category: 'bottom', name: 'Pantalón', occasions: ['oficina'], color_name: 'Gris' }),
    garment({ category: 'bottom', name: 'Vaqueros', occasions: ['casual'], color_name: 'Azul' }),
    garment({ category: 'dress', name: 'Vestido', occasions: ['cena'], color_name: 'Burdeos' }),
    garment({ category: 'shoes', name: 'Botines', color_name: 'Negro' }),
    garment({ category: 'outerwear', name: 'Abrigo', color_name: 'Camel' }),
  ];
  const ids = new Set(wardrobe.map((g) => g.id));
  const byId = new Map(wardrobe.map((g) => [g.id, g]));

  it('solo usa prendas del armario (RB1) y todas las propuestas están completas (RB9)', () => {
    const proposals = generateByRules(wardrobe, 'oficina', 'otono', user, 3);

    expect(proposals.length).toBeGreaterThan(0);
    for (const proposal of proposals) {
      expect(proposal.garment_ids.every((id) => ids.has(id))).toBe(true);
      expect(isCompleteOutfit(proposal.garment_ids.map((id) => byId.get(id)!))).toBe(true);
      expect(proposal.explanation.length).toBeGreaterThan(0);
    }
  });

  it('no repite combinaciones entre propuestas', () => {
    const proposals = generateByRules(wardrobe, 'casual', 'otono', user, 4);
    const keys = proposals.map((p) => comboKey(p.garment_ids));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('prioriza prendas de la ocasión (RB3)', () => {
    const [first] = generateByRules(wardrobe, 'oficina', 'otono', user, 1);
    const names = first.garment_ids.map((id) => byId.get(id)!.name);
    expect(names).toEqual(expect.arrayContaining(['Camisa', 'Pantalón']));
  });

  it('añade abrigo en temporadas frías y no en verano', () => {
    const [winter] = generateByRules(wardrobe, 'oficina', 'invierno', user, 1);
    const [summer] = generateByRules(wardrobe, 'oficina', 'verano', user, 1);
    const hasCoat = (ids: string[]) => ids.some((id) => byId.get(id)!.category === 'outerwear');

    expect(hasCoat(winter.garment_ids)).toBe(true);
    expect(hasCoat(summer.garment_ids)).toBe(false);
  });

  it('no propone combinaciones ya guardadas (RB5)', () => {
    const first = generateByRules(wardrobe, 'oficina', 'otono', user, 1)[0];
    const withHistory = { ...user, savedCombos: new Set([comboKey(first.garment_ids)]) };

    const next = generateByRules(wardrobe, 'oficina', 'otono', withHistory, 3);

    expect(next.map((p) => comboKey(p.garment_ids))).not.toContain(comboKey(first.garment_ids));
  });
});
