import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { categoryLabel } from '@/features/wardrobe/garment-options';
import { useTheme } from '@/hooks/use-theme';
import type { Garment } from '@/types/garment';

type OutfitPiecesProps = {
  garments: Garment[];
  imageUrls: Record<string, string>;
  /** Si se pasa, cada prenda muestra un botón para quitarla. */
  onRemove?: (garment: Garment) => void;
};

/** Lista de prendas de un outfit con miniatura, nombre y categoría. */
export function OutfitPieces({ garments, imageUrls, onRemove }: OutfitPiecesProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {garments.map((garment) => {
        const url = garment.image_path ? imageUrls[garment.image_path] : undefined;
        return (
          <View key={garment.id} style={[styles.row, { borderColor: theme.border }]}>
            <View style={[styles.thumb, { backgroundColor: garment.primary_color_hex ?? theme.surfaceMuted }]}>
              {url && <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />}
            </View>
            <View style={styles.text}>
              <AppText variant="label" numberOfLines={1}>
                {garment.name}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {categoryLabel(garment.category)}
                {garment.color_name ? ` · ${garment.color_name}` : ''}
              </AppText>
            </View>
            {onRemove && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${garment.name}`}
                onPress={() => onRemove(garment)}
                hitSlop={8}
                style={styles.remove}>
                <Icon name="close" size={18} color="textSecondary" />
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 48, height: 60, borderRadius: Radius.sm, overflow: 'hidden' },
  text: { flex: 1, gap: 2 },
  remove: { padding: Spacing.xs },
});
