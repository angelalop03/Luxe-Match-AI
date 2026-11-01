import type { Garment } from '@/types/garment';
import type { Product } from '@/types/product';

/** Datos de prueba con valores por defecto razonables. */
let sequence = 0;

export function makeGarment(overrides: Partial<Garment> = {}): Garment {
  sequence += 1;
  return {
    id: `garment-${sequence}`,
    user_id: 'user-1',
    name: `Prenda ${sequence}`,
    category: 'top',
    subcategory: null,
    primary_color_hex: null,
    color_name: null,
    styles: [],
    occasions: [],
    seasons: [],
    image_path: null,
    ai_metadata: null,
    restyle: null,
    restyled_at: null,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
    ...overrides,
  };
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  sequence += 1;
  return {
    id: `product-${sequence}`,
    name: `Producto ${sequence}`,
    brand: 'Demo',
    category: 'accessory',
    color_hex: '#000000',
    color_name: 'Negro',
    price: 50,
    currency: 'EUR',
    image_url: null,
    external_url: 'https://example.com',
    search_term: null,
    styles: [],
    occasions: [],
    seasons: [],
    ...overrides,
  };
}
