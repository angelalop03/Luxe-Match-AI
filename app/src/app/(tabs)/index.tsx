import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon, Screen, type IconName } from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { useColorProfile } from '@/features/colorimetry/use-color-profile';
import { optionLabel } from '@/features/onboarding/questions';
import { useOutfits } from '@/features/outfits/use-outfits';
import { GarmentCard } from '@/features/wardrobe/garment-card';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth-provider';

type DashboardSection = {
  title: string;
  description: string;
  icon: IconName;
  href: Href;
};

/** Prendas mínimas para empezar a generar outfits con variedad. */
const GarmentsForFirstOutfits = 5;

/** Dashboard del usuario (RF11). */
export default function DashboardScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { garments } = useGarments();
  const { profile: colorProfile } = useColorProfile();
  const { outfits } = useOutfits();
  const outfitCount = outfits?.length ?? 0;
  const favoriteCount = outfits?.filter((o) => o.is_favorite).length ?? 0;
  const recent = (garments ?? []).slice(0, 6);
  const imageUrls = useSignedUrls('garments', recent.map((g) => g.image_path));

  const firstName = profile?.full_name?.split(' ')[0];
  const userStyles = profile?.style_preferences.styles ?? [];
  const total = garments?.length ?? 0;
  const remaining = Math.max(GarmentsForFirstOutfits - total, 0);

  const sections: DashboardSection[] = [
    {
      title: 'Mi armario',
      description:
        total === 0
          ? 'Digitaliza tus prendas con una foto.'
          : `${total} ${total === 1 ? 'prenda' : 'prendas'} en tu armario.`,
      icon: 'wardrobe',
      href: '/wardrobe',
    },
    {
      title: 'Outfits guardados',
      description:
        outfitCount === 0
          ? 'Tus looks favoritos para cada ocasión.'
          : `${outfitCount} ${outfitCount === 1 ? 'outfit' : 'outfits'}${favoriteCount ? `, ${favoriteCount} ${favoriteCount === 1 ? 'favorito' : 'favoritos'}` : ''}.`,
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
      description: colorProfile?.analyzed_at
        ? `${colorProfile.season} · ver tu paleta personal.`
        : 'Descubre tu paleta con un selfie.',
      icon: 'palette',
      href: '/profile/palette',
    },
  ];

  return (
    <Screen edges={['top']} maxWidth={MaxWideContentWidth}>
      <View style={styles.header}>
        <AppText variant="overline" color="accentText">
          Tu estilista personal
        </AppText>
        <AppText variant="display">{firstName ? `Hola, ${firstName}` : 'Hola'}</AppText>
        {userStyles.length > 0 && (
          <AppText color="textSecondary">
            Estilo {userStyles.map((s) => optionLabel('styles', s).toLowerCase()).join(' · ')}
          </AppText>
        )}
      </View>

      <Card style={[styles.hero, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
        <AppText variant="overline" style={{ color: theme.accent }}>
          Siguiente paso
        </AppText>
        <AppText variant="title" style={{ color: theme.onPrimary }}>
          {remaining > 0 ? 'Digitaliza tu armario' : 'Tu armario está listo'}
        </AppText>
        <AppText style={{ color: theme.onPrimary }}>
          {remaining > 0
            ? `Añade ${remaining} ${remaining === 1 ? 'prenda más' : 'prendas más'} y podremos proponerte tus primeros looks.`
            : 'Crea looks para cualquier ocasión con las prendas que ya tienes.'}
        </AppText>
        <View style={styles.heroAction}>
          {remaining > 0 ? (
            <HeroButton
              label="Añadir prenda"
              icon="plus"
              onPress={() => router.push('/wardrobe/new')}
              color={theme.onPrimary}
            />
          ) : (
            <HeroButton
              label="Crear looks"
              icon="sparkles"
              onPress={() => router.push('/outfits/generate')}
              color={theme.onPrimary}
            />
          )}
        </View>
      </Card>

      {recent.length > 0 && (
        <View style={styles.recent}>
          <View style={styles.recentHeader}>
            <AppText variant="heading">Añadidas recientemente</AppText>
            <Button title="Ver todo" variant="ghost" onPress={() => router.navigate('/wardrobe')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {recent.map((garment) => (
              <View key={garment.id} style={styles.stripItem}>
                <GarmentCard
                  garment={garment}
                  imageUrl={garment.image_path ? imageUrls[garment.image_path] : undefined}
                  onPress={() =>
                    router.push({ pathname: '/wardrobe/[id]', params: { id: garment.id } })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.grid}>
        {sections.map((section) => (
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

/** Botón con borde claro para usar sobre la tarjeta oscura. */
function HeroButton({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  color: string;
}) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.heroButton, { borderColor: color, backgroundColor: 'transparent' }]}>
      <View style={styles.heroButtonContent}>
        <Icon name={icon} size={18} tintColor={color} />
        <AppText variant="label" style={[styles.heroButtonLabel, { color }]}>
          {label}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.xs },
  hero: { gap: Spacing.xs, paddingVertical: Spacing.xl },
  heroAction: { flexDirection: 'row', marginTop: Spacing.sm },
  heroButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: 999 },
  heroButtonContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  heroButtonLabel: { letterSpacing: 1.5, textTransform: 'uppercase' },
  recent: { gap: Spacing.sm },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strip: { gap: Spacing.md },
  stripItem: { width: 140 },
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
