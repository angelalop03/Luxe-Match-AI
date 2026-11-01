import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Garment } from '@/types/garment';

type OutfitCollageProps = {
  garments: Garment[];
  imageUrls: Record<string, string>;
};

/**
 * Mosaico con las fotos de las prendas principales del outfit:
 * 1 foto a pantalla completa, 2 en columnas y 3 o más en cuadrícula de 2x2.
 */
export function OutfitCollage({ garments, imageUrls }: OutfitCollageProps) {
  const theme = useTheme();
  const shown = garments.slice(0, 4);
  const layout = shown.length <= 1 ? styles.one : shown.length === 2 ? styles.two : styles.four;

  return (
    <View
      style={[styles.frame, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
      accessible
      accessibilityLabel={`Outfit con ${garments.map((g) => g.name).join(', ')}`}>
      <View style={styles.grid}>
        {shown.map((garment) => {
          const url = garment.image_path ? imageUrls[garment.image_path] : undefined;
          return (
            <View key={garment.id} style={[layout, { borderColor: theme.surface }]}>
              {url ? (
                <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              ) : (
                <View
                  style={[
                    styles.placeholder,
                    { backgroundColor: garment.primary_color_hex ?? theme.surfaceMuted },
                  ]}>
                  <Icon name="wardrobe" size={20} color="textSecondary" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  one: { width: '100%', height: '100%' },
  two: { width: '50%', height: '100%', borderWidth: 1 },
  four: { width: '50%', height: '50%', borderWidth: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.85 },
});
