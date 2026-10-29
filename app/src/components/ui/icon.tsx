import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Iconos de la app con su equivalente en cada plataforma:
 * SF Symbols en iOS y Material Symbols en Android/web.
 */
const IconMap = {
  home: { ios: 'house', android: 'home', web: 'home' },
  wardrobe: { ios: 'hanger', android: 'checkroom', web: 'checkroom' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  person: { ios: 'person', android: 'person', web: 'person' },
  palette: { ios: 'paintpalette', android: 'palette', web: 'palette' },
  bag: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  heart: { ios: 'heart', android: 'favorite', web: 'favorite' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeOff: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  logout: {
    ios: 'rectangle.portrait.and.arrow.right',
    android: 'logout',
    web: 'logout',
  },
  restyle: { ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  gallery: { ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' },
  image: { ios: 'photo', android: 'image', web: 'image' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'tune', web: 'tune' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof IconMap;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  tintColor?: ColorValue;
};

export function Icon({ name, size = 22, color = 'text', tintColor }: IconProps) {
  const theme = useTheme();
  return (
    <SymbolView
      name={IconMap[name]}
      size={size}
      tintColor={tintColor ?? theme[color]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
