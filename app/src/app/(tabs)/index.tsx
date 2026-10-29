import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, Screen, type IconName } from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { optionLabel } from '@/features/onboarding/questions';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth-provider';

type DashboardSection = {
  title: string;
  description: string;
  icon: IconName;
  href: Href;
};

/** Dashboard del usuario (RF11). Las secciones se irán llenando en cada fase. */
const Sections: DashboardSection[] = [
  {
    title: 'Mi armario',
    description: 'Digitaliza tus prendas y deja que la IA las clasifique.',
    icon: 'wardrobe',
    href: '/wardrobe',
  },
  {
    title: 'Outfits guardados',
    description: 'Tus looks favoritos para cada ocasión.',
    icon: 'heart',
    href: '/outfits',
  },
  {
    title: 'Recomendaciones',
    description: 'Piezas que completan tu armario sin duplicarlo.',
    icon: 'bag',
    href: '/outfits',
  },
  {
    title: 'Perfil de color',
    description: 'Descubre tu paleta con un selfie.',
    icon: 'palette',
    href: '/profile',
  },
];

export default function DashboardScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const firstName = profile?.full_name?.split(' ')[0];
  const styles_ = profile?.style_preferences.styles ?? [];

  return (
    <Screen edges={['top']} maxWidth={MaxWideContentWidth}>
      <View style={styles.header}>
        <AppText variant="overline" color="accentText">
          Tu estilista personal
        </AppText>
        <AppText variant="display">{firstName ? `Hola, ${firstName}` : 'Hola'}</AppText>
        {styles_.length > 0 && (
          <AppText color="textSecondary">
            Estilo {styles_.map((s) => optionLabel('styles', s).toLowerCase()).join(' · ')}
          </AppText>
        )}
      </View>

      <Card style={[styles.hero, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
        <AppText variant="overline" style={{ color: theme.accent }}>
          Siguiente paso
        </AppText>
        <AppText variant="title" style={{ color: theme.onPrimary }}>
          Digitaliza tu armario
        </AppText>
        <AppText style={{ color: theme.onPrimary }}>
          Con unas pocas prendas ya podremos proponerte tus primeros looks.
        </AppText>
      </Card>

      <View style={styles.grid}>
        {Sections.map((section) => (
          <View key={section.title} style={styles.cell}>
            <Card
              onPress={() => router.navigate(section.href)}
              accessibilityLabel={`${section.title}. ${section.description}`}
              style={styles.sectionCard}>
              <View style={styles.sectionTop}>
                <Icon name={section.icon} color="accentText" />
                <Icon name="chevronRight" size={16} color="textSecondary" />
              </View>
              <AppText variant="heading">{section.title}</AppText>
              <AppText variant="caption" color="textSecondary">
                {section.description}
              </AppText>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.xs },
  hero: { gap: Spacing.xs, paddingVertical: Spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  cell: {
    flexBasis: '50%',
    flexGrow: 1,
    minWidth: 260,
    padding: Spacing.xs,
  },
  sectionCard: { flex: 1 },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
});
