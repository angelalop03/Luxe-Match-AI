import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  /** Valor entre 0 y 1. */
  progress: number;
  label: string;
};

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const theme = useTheme();
  const value = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[styles.track, { backgroundColor: theme.border }]}>
      <View style={[styles.fill, { width: `${value * 100}%`, backgroundColor: theme.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
