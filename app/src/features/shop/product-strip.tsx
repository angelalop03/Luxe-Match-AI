import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { Recommendation } from '@/types/product';

import { ProductCard } from './product-card';

type ProductStripProps = {
  recommendations: Recommendation[];
  onOpen: (recommendation: Recommendation) => void;
};

/** Fila horizontal de productos recomendados. */
export function ProductStrip({ recommendations, onOpen }: ProductStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}>
      {recommendations.map((recommendation) => (
        <View key={recommendation.product.id} style={styles.item}>
          <ProductCard recommendation={recommendation} onOpen={() => onOpen(recommendation)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { gap: Spacing.md },
  item: { width: 150 },
});
