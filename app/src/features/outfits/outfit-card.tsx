import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { seasonLabel } from '@/features/wardrobe/garment-options';
import { useTheme } from '@/hooks/use-theme';
import type { Outfit } from '@/types/outfit';

import { OutfitCollage } from './outfit-collage';
import { occasionLabel } from './outfit-options';

type OutfitCardProps = {
  outfit: Outfit;
  imageUrls: Record<string, string>;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function OutfitCard({ outfit, imageUrls, onPress, onToggleFavorite }: OutfitCardProps) {
  const theme = useTheme();
  const meta = [occasionLabel(outfit.occasion), outfit.season && seasonLabel(outfit.season)]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${outfit.name}${meta ? `, ${meta}` : ''}`}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}>
        <OutfitCollage garments={outfit.garments} imageUrls={imageUrls} />
      </Pressable>
      <View style={styles.info}>
        <View style={styles.text}>
          <AppText variant="label" numberOfLines={1}>
            {outfit.name}
          </AppText>
          {meta ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {meta}
            </AppText>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={outfit.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          accessibilityState={{ selected: outfit.is_favorite }}
          onPress={onToggleFavorite}
          hitSlop={10}>
          <Icon
            name="heart"
            size={20}
            tintColor={outfit.is_favorite ? theme.danger : theme.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xs },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  text: { flex: 1, gap: 2 },
  pressed: { opacity: 0.85 },
});
