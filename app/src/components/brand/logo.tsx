import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { FontFamily, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LogoProps = { size?: 'sm' | 'lg' };

/** Logotipo tipográfico de la marca. */
export function Logo({ size = 'lg' }: LogoProps) {
  const theme = useTheme();
  const large = size === 'lg';

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="LuxeMatch AI"
      style={styles.wrapper}>
      <AppText style={[styles.word, { fontSize: large ? 40 : 24, lineHeight: large ? 46 : 28 }]}>
        LuxeMatch
      </AppText>
      <View style={styles.row}>
        <View style={[styles.rule, { backgroundColor: theme.accent }]} />
        <AppText variant="overline" color="accentText">
          AI
        </AppText>
        <View style={[styles.rule, { backgroundColor: theme.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: Spacing.xxs },
  word: { fontFamily: FontFamily.display, letterSpacing: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rule: { width: 28, height: StyleSheet.hairlineWidth * 2 },
});
