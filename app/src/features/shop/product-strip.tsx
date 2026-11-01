import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ShopContext } from '@/services/product-service';
import type { Recommendation } from '@/types/product';

import { ProductCard } from './product-card';
import { StorePicker } from './store-picker';

type ProductStripProps = {
  recommendations: Recommendation[];
  /** Pantalla y elementos de origen, para analytics. */
  context: ShopContext;
};

/** Fila horizontal de ideas de compra, con selector de tienda. */
export function ProductStrip({ recommendations, context }: ProductStripProps) {
  const [selected, setSelected] = useState<Recommendation | null>(null);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}>
        {recommendations.map((recommendation) => (
          <View key={recommendation.product.id} style={styles.item}>
            <ProductCard recommendation={recommendation} onOpen={() => setSelected(recommendation)} />
          </View>
        ))}
      </ScrollView>
      <StorePicker recommendation={selected} context={context} onClose={() => setSelected(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  strip: { gap: Spacing.md },
  item: { width: 150 },
});
