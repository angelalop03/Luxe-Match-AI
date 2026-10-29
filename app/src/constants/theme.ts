/**
 * Sistema de diseño de LuxeMatch AI (RNF10).
 *
 * Paleta "maison": marfil, tinta cálida y champán. Los tonos de texto cumplen
 * contraste AA (≥ 4.5:1) sobre `background` y `surface` en ambos modos (RNF8).
 * El dorado `accent` se usa para bordes, iconos y superficies; para texto
 * dorado usa `accentText`.
 */

export const Colors = {
  light: {
    background: '#F7F3EE',
    surface: '#FFFFFF',
    surfaceMuted: '#EFE8DF',
    text: '#1A1714',
    textSecondary: '#5E564E',
    border: '#E2D9CD',
    accent: '#B08D5B',
    accentText: '#7A5A2E',
    accentSoft: '#F1E7D8',
    primary: '#1A1714',
    onPrimary: '#F7F3EE',
    danger: '#A3362C',
    success: '#3E6B48',
  },
  dark: {
    background: '#12100E',
    surface: '#1C1916',
    surfaceMuted: '#26221E',
    text: '#F4EEE6',
    textSecondary: '#B3AA9F',
    border: '#3A342E',
    accent: '#C9A876',
    accentText: '#D9BC8E',
    accentSoft: '#2E271F',
    primary: '#F4EEE6',
    onPrimary: '#12100E',
    danger: '#E2796E',
    success: '#8CC198',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

/** Familias cargadas con expo-font en el layout raíz. */
export const FontFamily = {
  display: 'CormorantGaramond_500Medium',
  displaySemiBold: 'CormorantGaramond_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Ancho máximo del contenido en tablet/escritorio (RF12). */
export const MaxContentWidth = 560;
export const MaxWideContentWidth = 960;
