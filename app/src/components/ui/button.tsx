import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const containerStyle = {
    primary: { backgroundColor: theme.primary, borderColor: theme.primary },
    secondary: { backgroundColor: 'transparent', borderColor: theme.text },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  }[variant];
  const textColor = variant === 'primary' ? theme.onPrimary : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <AppText
            style={[styles.label, variant === 'ghost' && styles.ghostLabel, { color: textColor }]}>
            {title}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ghostLabel: {
    textTransform: 'none',
    letterSpacing: 0,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
});
