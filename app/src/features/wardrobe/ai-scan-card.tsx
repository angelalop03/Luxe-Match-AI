import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GarmentScan } from '@/services/ai-service';

export type ScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'done'; result: GarmentScan }
  | { status: 'error'; message: string };

type AiScanCardProps = {
  state: ScanState;
  onRetry?: () => void;
};

/** Estado del escaneo IA de la prenda, bajo la foto. */
export function AiScanCard({ state, onRetry }: AiScanCardProps) {
  const theme = useTheme();
  if (state.status === 'idle') return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.card, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
      <View style={styles.header}>
        {state.status === 'scanning' ? (
          <ActivityIndicator color={theme.accentText} />
        ) : (
          <Icon name="sparkles" size={20} color="accentText" />
        )}
        <AppText variant="label" color="accentText" style={styles.title}>
          {state.status === 'scanning' && 'Analizando la prenda con IA…'}
          {state.status === 'done' && 'Detectado con IA · revisa y corrige si hace falta'}
          {state.status === 'error' && 'No hemos podido analizar la foto'}
        </AppText>
      </View>

      {state.status === 'done' && (
        <>
          {state.result.material_guess ? (
            <AppText variant="caption" color="textSecondary">
              Tejido probable: {state.result.material_guess}
            </AppText>
          ) : null}
          <AppText variant="caption">{state.result.styling_note}</AppText>
        </>
      )}

      {state.status === 'error' && (
        <>
          <AppText variant="caption" color="textSecondary">
            {state.message} Puedes rellenar los datos a mano.
          </AppText>
          {onRetry && <Button title="Reintentar análisis" variant="ghost" onPress={onRetry} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1 },
});
