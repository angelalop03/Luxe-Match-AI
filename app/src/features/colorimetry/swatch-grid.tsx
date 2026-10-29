import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ColorSwatch } from '@/types/color-profile';

type SwatchGridProps = {
  swatches: ColorSwatch[];
  /** Tachados, para los colores a evitar. */
  crossed?: boolean;
  size?: 'md' | 'lg';
};

export function SwatchGrid({ swatches, crossed, size = 'md' }: SwatchGridProps) {
  const theme = useTheme();
  const diameter = size === 'lg' ? 56 : 44;

  return (
    <View style={styles.grid}>
      {swatches.map((swatch) => (
        <View
          key={`${swatch.hex}-${swatch.name}`}
          style={[styles.item, { width: diameter + 28 }]}
          accessible
          accessibilityLabel={crossed ? `${swatch.name}, evitar` : swatch.name}>
          <View
            style={[
              styles.circle,
              {
                width: diameter,
                height: diameter,
                backgroundColor: swatch.hex,
                borderColor: theme.border,
              },
            ]}>
            {crossed && <View style={[styles.cross, { backgroundColor: theme.surface }]} />}
          </View>
          <AppText variant="caption" center numberOfLines={2} color="textSecondary">
            {swatch.name}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  item: { alignItems: 'center', gap: Spacing.xxs },
  circle: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cross: { width: '140%', height: 2, transform: [{ rotate: '-45deg' }] },
});
