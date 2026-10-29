import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  /** Contenido fijo bajo el scroll (p. ej. botones de acción). */
  footer?: ReactNode;
  maxWidth?: number;
  edges?: Edge[];
  centered?: boolean;
};

/**
 * Contenedor base de pantalla: safe area, scroll, teclado y ancho máximo
 * para que el contenido no se estire en tablet y escritorio (RF12).
 */
export function Screen({
  children,
  footer,
  maxWidth = MaxContentWidth,
  edges = ['top', 'bottom'],
  centered,
}: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, centered && styles.centered]}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.content, { maxWidth }]}>{children}</View>
        </ScrollView>
        {footer && (
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <View style={[styles.content, { maxWidth }]}>{footer}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  centered: { justifyContent: 'center' },
  content: { width: '100%', gap: Spacing.lg },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
