import { searchTermFor, Stores } from '@/features/shop/stores';

describe('Stores', () => {
  const byId = (id: string) => Stores.find((s) => s.id === id)!;

  it('construye la búsqueda directa de cada tienda con el término codificado', () => {
    expect(byId('zara').searchUrl('blazer azul marino')).toBe(
      'https://www.zara.com/es/es/search?searchTerm=blazer%20azul%20marino',
    );
    expect(byId('bershka').searchUrl('blazer azul')).toBe('https://www.bershka.com/es/q/blazer%20azul');
    expect(byId('hm').searchUrl('blazer')).toBe('https://www2.hm.com/es_es/search-results.html?q=blazer');
    expect(byId('zalando').searchUrl('blazer azul marino')).toBe(
      'https://www.zalando.es/catalogo/?q=blazer+azul+marino',
    );
  });

  it('usa Google limitado a la web de la tienda cuando no hay enlace directo', () => {
    const url = byId('mango').searchUrl('bufanda verde');
    expect(url).toBe('https://www.google.com/search?q=bufanda%20verde%20site%3Ashop.mango.com');
  });

  it('codifica caracteres especiales sin romper la URL', () => {
    const url = byId('zara').searchUrl('pantalón & camisa');
    expect(url).toContain('pantal%C3%B3n%20%26%20camisa');
  });

  it('todas las tiendas generan URLs https válidas', () => {
    for (const store of Stores) {
      expect(() => new URL(store.searchUrl('vestido midi'))).not.toThrow();
      expect(store.searchUrl('vestido midi').startsWith('https://')).toBe(true);
    }
  });
});

describe('searchTermFor', () => {
  it('usa el término de búsqueda del catálogo', () => {
    expect(searchTermFor({ search_term: 'blazer azul marino', name: 'Blazer de lana', color_name: 'Azul' })).toBe(
      'blazer azul marino',
    );
  });

  it('si no hay término, usa nombre y color en minúsculas', () => {
    expect(searchTermFor({ search_term: null, name: 'Bufanda gruesa', color_name: 'Verde' })).toBe(
      'bufanda gruesa verde',
    );
  });
});
