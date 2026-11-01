import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { categoryLabel } from '@/features/wardrobe/garment-options';
import { useTheme } from '@/hooks/use-theme';
import type { Recommendation } from '@/types/product';

type ProductCardProps = {
  recommendation: Recommendation;
  onOpen: () => void;
};

/**
 * Idea de compra recomendada (RF9): qué buscar y en qué color. Al pulsarla
 * se elige en qué tienda real buscarla.
 */
export function ProductCard({ recommendation, onOpen }: ProductCardProps) {
  const theme = useTheme();
  const { product, reasons } = recommendation;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}${product.color_name ? `, ${product.color_name}` : ''}. Buscar en tiendas`}
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View
        style={[
          styles.tile,
          { backgroundColor: product.color_hex ?? theme.surfaceMuted, borderColor: theme.border },
        ]}>
        <View style={[styles.badge, { backgroundColor: theme.surface }]}>
          <AppText variant="caption">{categoryLabel(product.category)}</AppText>
        </View>
      </View>
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={2}>
          {product.name}
        </AppText>
        {product.color_name && (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {product.color_name}
          </AppText>
        )}
        {reasons[0] && (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {reasons[0]}
          </AppText>
        )}
        <View style={styles.cta}>
          <Icon name="search" size={14} color="accentText" />
          <AppText variant="label" color="accentText">
            Buscar en tiendas
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xs },
  tile: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: Spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  info: { gap: 2 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, marginTop: Spacing.xxs },
  pressed: { opacity: 0.85 },
});
