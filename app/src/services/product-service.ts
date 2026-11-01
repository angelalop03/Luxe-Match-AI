import * as WebBrowser from 'expo-web-browser';

import type { Store } from '@/features/shop/stores';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

import { track } from './analytics';

const CacheTtlMs = 10 * 60 * 1000;
let cache: { products: Product[]; loadedAt: number } | null = null;

/** Catálogo de ideas activo. Es pequeño y cambia poco: se cachea 10 minutos. */
export async function listProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.loadedAt < CacheTtlMs) return cache.products;

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, brand, category, color_hex, color_name, price, currency, image_url, external_url, search_term, styles, occasions, seasons',
    )
    .eq('is_active', true);
  if (error) throw error;

  const products = (data ?? []).map((p) => ({ ...p, price: p.price === null ? null : Number(p.price) })) as Product[];
  cache = { products, loadedAt: Date.now() };
  return products;
}

export type ShopContext = { source: string; outfitId?: string; garmentId?: string };

/**
 * Abre la búsqueda de la tienda elegida y registra el clic (RF9, RF13).
 * `source` indica desde qué pantalla se abrió: outfit, para-ti, restyle…
 */
export async function openStoreSearch(
  product: Product,
  store: Store,
  term: string,
  context: ShopContext,
) {
  track('ecommerce_click', {
    product_id: product.id,
    category: product.category,
    store: store.id,
    search_term: term,
    source: context.source,
    outfit_id: context.outfitId,
    garment_id: context.garmentId,
  });
  await WebBrowser.openBrowserAsync(store.searchUrl(term));
}
