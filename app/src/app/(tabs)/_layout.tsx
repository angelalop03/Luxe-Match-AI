import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/ui';
import { FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TabIcons: Record<string, IconName> = {
  index: 'home',
  wardrobe: 'wardrobe',
  outfits: 'sparkles',
  profile: 'person',
};

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontFamily: FontFamily.bodyMedium, fontSize: 12 },
        tabBarIcon: ({ color }) => <Icon name={TabIcons[route.name]} size={22} tintColor={color} />,
      })}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Armario' }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfits' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
