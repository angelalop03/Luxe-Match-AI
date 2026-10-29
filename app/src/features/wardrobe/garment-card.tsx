import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Garment } from '@/types/garment';

import { categoryLabel } from './garment-options';

type GarmentCardProps = {
  garment: Garment;
  imageUrl?: string;
  onPress: () => void;
};

export function GarmentCard({ garment, imageUrl, onPress }: GarmentCardProps) {
  const theme = useTheme();
  const category = categoryLabel(garment.category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${garment.name}, ${category}${garment.color_name ? `, ${garment.color_name}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.imageBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="wardrobe" size={28} color="textSecondary" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {garment.name}
        </AppText>
        <View style={styles.meta}>
          {garment.primary_color_hex && (
            <View
              style={[styles.dot, { backgroundColor: garment.primary_color_hex, borderColor: theme.border }]}
            />
          )}
          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.metaText}>
            {category}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xs },
  imageBox: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs },
  metaText: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  pressed: { opacity: 0.8 },
});
