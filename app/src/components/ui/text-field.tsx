import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';
import { AppText } from './text';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  /** Muestra un botón para ver/ocultar la contraseña. */
  secureToggle?: boolean;
};

export function TextField({ label, error, hint, secureToggle, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? theme.danger : focused ? theme.accent : theme.border;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <View style={[styles.inputRow, { borderColor, backgroundColor: theme.surface }]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureToggle ? hidden : rest.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, { color: theme.text }, style]}
          {...rest}
        />
        {secureToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            style={styles.toggle}>
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color="textSecondary" />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textSecondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  toggle: { paddingHorizontal: Spacing.md },
});
