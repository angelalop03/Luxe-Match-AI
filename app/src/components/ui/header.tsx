import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { AppText } from './text';

type HeaderProps = {
  title: string;
  overline?: string;
  /** Muestra la flecha de volver. */
  back?: boolean;
  /** Acción a la derecha del título (p. ej. un botón de icono). */
  right?: ReactNode;
};

/** Cabecera de pantalla con título serif y botón de volver opcional. */
export function Header({ title, overline, back, right }: HeaderProps) {
  return (
    <View style={styles.wrapper}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}>
          <Icon name="back" />
        </Pressable>
      )}
      <View style={styles.row}>
        <View style={styles.titles}>
          {overline && (
            <AppText variant="overline" color="accentText">
              {overline}
            </AppText>
          )}
          <AppText variant="title">{title}</AppText>
        </View>
        {right}
      </View>
    </View>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'plain';
};

export function IconButton({ icon, label, onPress, variant = 'plain' }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      {variant === 'filled' ? <FilledIcon icon={icon} /> : <Icon name={icon} />}
    </Pressable>
  );
}

function FilledIcon({ icon }: { icon: IconName }) {
  const theme = useTheme();
  return (
    <View style={[styles.filled, { backgroundColor: theme.primary }]}>
      <Icon name={icon} size={20} tintColor={theme.onPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.md },
  back: { alignSelf: 'flex-start', padding: Spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md },
  titles: { flex: 1, gap: Spacing.xxs },
  iconButton: { padding: Spacing.xxs },
  filled: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
