import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppTextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'label'
  | 'overline';

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: ThemeColor;
  center?: boolean;
};

export function AppText({
  variant = 'body',
  color = 'text',
  center,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';

  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[styles[variant], { color: theme[color] }, center && styles.center, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: FontFamily.display, fontSize: 44, lineHeight: 50, letterSpacing: 0.5 },
  title: { fontFamily: FontFamily.display, fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: FontFamily.displaySemiBold, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: FontFamily.body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: FontFamily.bodyMedium, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: FontFamily.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: FontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
  overline: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  center: { textAlign: 'center' },
});
