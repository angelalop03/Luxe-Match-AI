import { EmptyFilter, filterGarments } from '@/features/wardrobe/filter';
import { makeGarment } from '@/test/factories';

describe('filterGarments (RF5)', () => {
  const blazer = makeGarment({ name: 'Blazer de lana', category: 'outerwear', seasons: ['otono', 'invierno'] });
  const shirt = makeGarment({ name: 'Camisa', category: 'top', color_name: 'Marfil', seasons: ['primavera'] });
  const jeans = makeGarment({ name: 'Vaqueros', category: 'bottom', subcategory: 'Pantalón vaquero' });
  const all = [blazer, shirt, jeans];

  it('sin filtros devuelve todo', () => {
    expect(filterGarments(all, EmptyFilter)).toHaveLength(3);
  });

  it('filtra por categoría', () => {
    expect(filterGarments(all, { ...EmptyFilter, category: 'top' })).toEqual([shirt]);
  });

  it('filtra por temporada', () => {
    expect(filterGarments(all, { ...EmptyFilter, season: 'invierno' })).toEqual([blazer]);
  });

  it('busca sin distinguir mayúsculas ni tildes, también en tipo y color', () => {
    expect(filterGarments(all, { ...EmptyFilter, query: 'pantalon' })).toEqual([jeans]);
    expect(filterGarments(all, { ...EmptyFilter, query: 'MARFIL' })).toEqual([shirt]);
  });

  it('combina filtros', () => {
    expect(filterGarments(all, { category: 'outerwear', season: 'verano', query: '' })).toEqual([]);
  });
});
