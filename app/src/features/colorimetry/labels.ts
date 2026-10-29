import type { ColorProfile } from '@/types/color-profile';

export const UndertoneLabels: Record<NonNullable<ColorProfile['undertone']>, string> = {
  cool: 'Frío',
  warm: 'Cálido',
  neutral: 'Neutro',
  olive: 'Oliva',
};

export const ContrastLabels: Record<NonNullable<ColorProfile['contrast']>, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};
