import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { openProduct } from '@/services/product-service';
import type { Outfit } from '@/types/outfit';

import { ProductStrip } from './product-strip';
import { complementCategoriesFor, recommendProducts } from './recommend';
import { useRecommendationData } from './use-recommendations';

/**
 * "Completa el look": productos del catálogo que complementan el outfit sin
 * duplicar lo que ya hay en el armario (RF9, RB6, RB11). Si no hace falta
 * nada, no se muestra.
 */
export function CompleteTheLook({ outfit }: { outfit: Outfit }) {
  const { products, context } = useRecommendationData();

  const recommendations = useMemo(() => {
    if (!products || !context) return [];
    const categories = complementCategoriesFor(outfit.garments, outfit.missing_piece_category);
    if (categories.length === 0) return [];
    return recommendProducts(products, context, {
      categories,
      occasion: outfit.occasion,
      season: outfit.season,
      limit: 4,
    });
  }, [products, context, outfit]);

  if (recommendations.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="heading">Completa el look</AppText>
        <AppText variant="caption" color="textSecondary">
          Primero usamos tu armario; esto es solo lo que le falta.
        </AppText>
      </View>
      <ProductStrip
        recommendations={recommendations}
        onOpen={(r) => openProduct(r.product, { source: 'outfit', outfitId: outfit.id })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.sm },
  header: { gap: Spacing.xxs },
});
