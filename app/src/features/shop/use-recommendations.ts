import { useEffect, useMemo, useState } from 'react';

import { useColorProfile } from '@/features/colorimetry/use-color-profile';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useAuth } from '@/providers/auth-provider';
import { listProducts } from '@/services/product-service';
import type { Product } from '@/types/product';

import type { RecommendationContext } from './recommend';

/**
 * Reúne catálogo, armario, preferencias y paleta para recomendar productos.
 * `context` es `null` hasta que todo ha cargado.
 */
export function useRecommendationData() {
  const { profile } = useAuth();
  const { garments } = useGarments();
  const { profile: colorProfile } = useColorProfile();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((result) => {
        if (!cancelled) setProducts(result);
      })
      .catch(() => {
        if (!cancelled) setError('No hemos podido cargar el catálogo.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const context = useMemo<RecommendationContext | null>(() => {
    if (!garments || colorProfile === undefined) return null;
    return {
      garments,
      styles: profile?.style_preferences.styles ?? [],
      budget: profile?.style_preferences.budget ?? null,
      recommendedColors: colorProfile?.recommended_colors ?? [],
      palette: colorProfile?.palette ?? [],
      avoidColors: colorProfile?.avoid_colors ?? [],
    };
  }, [garments, colorProfile, profile]);

  return { products, context, error, ready: !!products && !!context };
}
