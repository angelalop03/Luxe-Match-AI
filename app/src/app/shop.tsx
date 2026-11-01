import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Header, Pill, Screen } from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { ProductCard } from '@/features/shop/product-card';
import { recommendProducts } from '@/features/shop/recommend';
import { useRecommendationData } from '@/features/shop/use-recommendations';
import { Categories } from '@/features/wardrobe/garment-options';
import { useTheme } from '@/hooks/use-theme';
import { openProduct } from '@/services/product-service';
import type { GarmentCategory } from '@/types/garment';

/**
 * Recomendaciones de compra personalizadas (RF9): piezas que completan el
 * armario según estilo, paleta y presupuesto, sin duplicar lo que ya hay (RB6).
 */
export default function ShopScreen() {
  const theme = useTheme();
  const { products, context, error, ready } = useRecommendationData();
  const [category, setCategory] = useState<GarmentCategory | null>(null);

  const recommendations = useMemo(() => {
    if (!products || !context) return [];
    return recommendProducts(products, context, {
      categories: category ? [category] : undefined,
      limit: 12,
    });
  }, [products, context, category]);

  return (
    <Screen maxWidth={MaxWideContentWidth}>
      <Header back overline="Recomendaciones" title="Para ti" />
      <AppText color="textSecondary">
        Piezas que completan tu armario según tu estilo, tu paleta y tu presupuesto. Nunca te
        recomendamos algo que ya tienes.
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        <Pill role="radio" label="Todo" selected={category === null} onPress={() => setCategory(null)} />
        {Categories.map((c) => (
          <Pill
            key={c.value}
            role="radio"
            label={c.plural}
            selected={category === c.value}
            onPress={() => setCategory(c.value)}
          />
        ))}
      </ScrollView>

      {error && <AppText color="danger">{error}</AppText>}
      {!ready && !error && <ActivityIndicator color={theme.accent} style={styles.loader} />}

      {ready && recommendations.length === 0 && (
        <AppText color="textSecondary" center style={styles.empty}>
          No hay recomendaciones en esta categoría que no dupliquen tu armario.
        </AppText>
      )}

      <View style={styles.grid}>
        {recommendations.map((recommendation) => (
          <View key={recommendation.product.id} style={styles.cell}>
            <ProductCard
              recommendation={recommendation}
              onOpen={() => openProduct(recommendation.product, { source: 'para-ti' })}
            />
          </View>
        ))}
      </View>

      <AppText variant="caption" color="textSecondary">
        Catálogo de demostración: marcas, precios y enlaces son de ejemplo.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { gap: Spacing.xs, paddingVertical: 2 },
  loader: { marginTop: Spacing.xl },
  empty: { paddingVertical: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  cell: { width: '50%', minWidth: 150, maxWidth: 220, flexGrow: 1, padding: Spacing.xs },
});
