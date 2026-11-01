import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

import { track } from './analytics';

const CacheTtlMs = 10 * 60 * 1000;
let cache: { products: Product[]; loadedAt: number } | null = null;

/** Catálogo activo. Es pequeño y cambia poco, así que se cachea 10 minutos. */
export async function listProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.loadedAt < CacheTtlMs) return cache.products;

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, brand, category, color_hex, color_name, price, currency, image_url, external_url, styles, occasions, seasons',
    )
    .eq('is_active', true);
  if (error) throw error;

  const products = (data ?? []).map((p) => ({ ...p, price: p.price === null ? null : Number(p.price) })) as Product[];
  cache = { products, loadedAt: Date.now() };
  return products;
}

/**
 * Abre el producto en la tienda externa y registra el clic (RF9, RF13).
 * `source` indica desde qué pantalla se abrió: outfit, para-ti, restyle…
 */
export async function openProduct(
  product: Product,
  context: { source: string; outfitId?: string; garmentId?: string },
) {
  track('ecommerce_click', {
    product_id: product.id,
    category: product.category,
    price: product.price,
    source: context.source,
    outfit_id: context.outfitId,
    garment_id: context.garmentId,
  });
  await WebBrowser.openBrowserAsync(product.external_url);
}

export function formatPrice(product: Product) {
  if (product.price === null) return null;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: product.currency }).format(
    product.price,
  );
}
