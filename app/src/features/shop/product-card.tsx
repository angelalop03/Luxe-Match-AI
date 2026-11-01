import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { categoryLabel } from '@/features/wardrobe/garment-options';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/services/product-service';
import type { Recommendation } from '@/types/product';

type ProductCardProps = {
  recommendation: Recommendation;
  onOpen: () => void;
};

/** Producto recomendado con enlace externo a la tienda (RF9). */
export function ProductCard({ recommendation, onOpen }: ProductCardProps) {
  const theme = useTheme();
  const { product, reasons } = recommendation;
  const price = formatPrice(product);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${product.name}${product.brand ? ` de ${product.brand}` : ''}${price ? `, ${price}` : ''}. Abrir en la tienda`}
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View
        style={[
          styles.image,
          { backgroundColor: product.color_hex ?? theme.surfaceMuted, borderColor: theme.border },
        ]}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[styles.categoryBadge, { backgroundColor: theme.surface }]}>
            <AppText variant="caption">{categoryLabel(product.category)}</AppText>
          </View>
        )}
      </View>
      <View style={styles.info}>
        {product.brand && (
          <AppText variant="overline" color="accentText" numberOfLines={1}>
            {product.brand}
          </AppText>
        )}
        <AppText variant="label" numberOfLines={2}>
          {product.name}
        </AppText>
        <View style={styles.row}>
          {price && <AppText variant="bodyMedium">{price}</AppText>}
          <Icon name="bag" size={16} color="textSecondary" />
        </View>
        {reasons[0] && (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {reasons[0]}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xs },
  image: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  info: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pressed: { opacity: 0.85 },
});
