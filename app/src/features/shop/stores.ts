import type { Product } from '@/types/product';

/**
 * Tiendas reales donde buscar cada recomendación (RF9). La app propone qué
 * buscar (tipo de prenda y color según tu paleta) y abre la búsqueda de la
 * tienda; los productos, fotos y precios son los de su web.
 *
 * Zara, Bershka, H&M y Zalando usan su propio buscador (URLs comprobadas).
 * Para Mango, Pull&Bear y Stradivarius se usa Google limitado a su web,
 * porque sus buscadores no admiten un enlace directo estable.
 */
export type Store = {
  id: string;
  name: string;
  searchUrl: (term: string) => string;
};

const enc = encodeURIComponent;
const googleSite = (domain: string) => (term: string) =>
  `https://www.google.com/search?q=${enc(`${term} site:${domain}`)}`;

export const Stores: Store[] = [
  { id: 'zara', name: 'Zara', searchUrl: (t) => `https://www.zara.com/es/es/search?searchTerm=${enc(t)}` },
  { id: 'bershka', name: 'Bershka', searchUrl: (t) => `https://www.bershka.com/es/q/${enc(t)}` },
  { id: 'hm', name: 'H&M', searchUrl: (t) => `https://www2.hm.com/es_es/search-results.html?q=${enc(t)}` },
  { id: 'zalando', name: 'Zalando', searchUrl: (t) => `https://www.zalando.es/catalogo/?q=${enc(t).replace(/%20/g, '+')}` },
  { id: 'mango', name: 'Mango', searchUrl: googleSite('shop.mango.com') },
  { id: 'pullandbear', name: 'Pull&Bear', searchUrl: googleSite('pullandbear.com') },
  { id: 'stradivarius', name: 'Stradivarius', searchUrl: googleSite('stradivarius.com') },
];

/** Término corto de búsqueda de una idea, p. ej. "blazer azul marino". */
export function searchTermFor(product: Pick<Product, 'search_term' | 'name' | 'color_name'>) {
  const term = product.search_term?.trim();
  if (term) return term;
  return `${product.name} ${product.color_name ?? ''}`.trim().toLowerCase();
}
