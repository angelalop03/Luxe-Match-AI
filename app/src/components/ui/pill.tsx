import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './text';

type PillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  swatch?: string;
  role?: 'radio' | 'checkbox';
};

/** Opción compacta para filtros y etiquetas de prendas. */
export function Pill({ label, selected, onPress, swatch, role = 'checkbox' }: PillProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      {swatch && (
        <View
          style={[
            styles.swatch,
            { backgroundColor: swatch, borderColor: selected ? theme.onPrimary : theme.border },
          ]}
        />
      )}
      <AppText variant="label" style={{ color: selected ? theme.onPrimary : theme.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  swatch: { width: 16, height: 16, borderRadius: Radius.pill, borderWidth: 1 },
  pressed: { opacity: 0.8 },
});
