import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';
import { AppText } from './text';

type ChipProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Muestra una muestra de color a la izquierda. */
  swatch?: string;
  /** `radio` para selección única, `checkbox` para múltiple. */
  role?: 'radio' | 'checkbox';
};

export function Chip({ label, description, selected, onPress, swatch, role = 'checkbox' }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={description ? `${label}. ${description}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.accent : theme.border,
          backgroundColor: selected ? theme.accentSoft : theme.surface,
        },
        pressed && styles.pressed,
      ]}>
      {swatch && (
        <View style={[styles.swatch, { backgroundColor: swatch, borderColor: theme.border }]} />
      )}
      <View style={styles.text}>
        <AppText variant="label">{label}</AppText>
        {description && (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        )}
      </View>
      {selected && <Icon name="check" size={16} color="accentText" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  text: { flex: 1 },
  pressed: { opacity: 0.8 },
});
