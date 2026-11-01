import { router, type Href } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon, Screen, type IconName } from '@/components/ui';
import { MaxWideContentWidth, Radius, Spacing } from '@/constants/theme';
import { useColorProfile } from '@/features/colorimetry/use-color-profile';
import { optionLabel } from '@/features/onboarding/questions';
import { OutfitCard } from '@/features/outfits/outfit-card';
import { useOutfits } from '@/features/outfits/use-outfits';
import { useGarmentUsage } from '@/features/restyle/use-garment-usage';
import { ProductStrip } from '@/features/shop/product-strip';
import { recommendProducts } from '@/features/shop/recommend';
import { useRecommendationData } from '@/features/shop/use-recommendations';
import { GarmentCard } from '@/features/wardrobe/garment-card';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/confirm';
import { useAuth } from '@/providers/auth-provider';
import { setFavorite } from '@/services/outfit-service';
import { openProduct } from '@/services/product-service';
import type { Outfit } from '@/types/outfit';

/** Prendas mínimas para empezar a generar outfits con variedad. */
const GarmentsForFirstOutfits = 5;

/**
 * Dashboard del usuario (RF11): armario, outfits guardados, recomendaciones y
 * perfil de color de un vistazo, con el siguiente paso recomendado.
 */
export default function DashboardScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { garments } = useGarments();
  const { outfits, setOutfits } = useOutfits();
  const { profile: colorProfile } = useColorProfile();
  const usedIds = useGarmentUsage();
  const { products, context } = useRecommendationData();

  const total = garments?.length ?? 0;
  const remaining = Math.max(GarmentsForFirstOutfits - total, 0);
  const favorites = (outfits ?? []).filter((o) => o.is_favorite);
  const featuredOutfits = (favorites.length > 0 ? favorites : (outfits ?? [])).slice(0, 6);
  const recentGarments = (garments ?? []).slice(0, 6);
  const forgottenCount = usedIds ? (garments ?? []).filter((g) => !usedIds.has(g.id)).length : 0;

  const recommendations = useMemo(
    () => (products && context ? recommendProducts(products, context, { limit: 6 }) : []),
    [products, context],
  );

  const imageUrls = useSignedUrls('garments', [
    ...recentGarments.map((g) => g.image_path),
    ...featuredOutfits.flatMap((o) => o.garments.slice(0, 4).map((g) => g.image_path)),
  ]);

  const firstName = profile?.full_name?.split(' ')[0];
  const userStyles = profile?.style_preferences.styles ?? [];

  async function toggleFavorite(outfit: Outfit) {
    const next = !outfit.is_favorite;
    setOutfits((list) => list?.map((o) => (o.id === outfit.id ? { ...o, is_favorite: next } : o)) ?? null);
    try {
      await setFavorite(outfit.id, next);
    } catch {
      setOutfits((list) => list?.map((o) => (o.id === outfit.id ? { ...o, is_favorite: !next } : o)) ?? null);
      notify('No se ha podido actualizar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

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
            <HeroButton label="Añadir prenda" icon="plus" onPress={() => router.push('/wardrobe/new')} color={theme.onPrimary} />
          ) : (
            <HeroButton label="Crear looks" icon="sparkles" onPress={() => router.push('/outfits/generate')} color={theme.onPrimary} />
          )}
        </View>
      </Card>

      <View style={styles.stats}>
        <Stat icon="wardrobe" value={total} label={total === 1 ? 'prenda' : 'prendas'} href="/wardrobe" />
        <Stat
          icon="sparkles"
          value={outfits?.length ?? 0}
          label={(outfits?.length ?? 0) === 1 ? 'outfit' : 'outfits'}
          href="/outfits"
        />
        <Stat icon="heart" value={favorites.length} label="favoritos" href="/outfits" />
      </View>

      <ColorProfileCard
        season={colorProfile?.analyzed_at ? colorProfile.season : null}
        swatches={colorProfile?.palette.slice(0, 8) ?? []}
      />

      {featuredOutfits.length > 0 && (
        <Section
          title={favorites.length > 0 ? 'Tus favoritos' : 'Outfits guardados'}
          onSeeAll={() => router.navigate('/outfits')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {featuredOutfits.map((outfit) => (
              <View key={outfit.id} style={styles.outfitItem}>
                <OutfitCard
                  outfit={outfit}
                  imageUrls={imageUrls}
                  onPress={() => router.push({ pathname: '/outfits/[id]', params: { id: outfit.id } })}
                  onToggleFavorite={() => toggleFavorite(outfit)}
                />
              </View>
            ))}
          </ScrollView>
        </Section>
      )}

      {recentGarments.length > 0 && (
        <Section title="Añadidas recientemente" onSeeAll={() => router.navigate('/wardrobe')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {recentGarments.map((garment) => (
              <View key={garment.id} style={styles.garmentItem}>
                <GarmentCard
                  garment={garment}
                  imageUrl={garment.image_path ? imageUrls[garment.image_path] : undefined}
                  onPress={() => router.push({ pathname: '/wardrobe/[id]', params: { id: garment.id } })}
                />
              </View>
            ))}
          </ScrollView>
        </Section>
      )}

      {forgottenCount > 0 && (
        <Card
          onPress={() => router.push('/wardrobe/restyle')}
          accessibilityLabel={`Restyle: ${forgottenCount} prendas sin usar en ningún outfit`}>
          <View style={styles.restyleRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
              <Icon name="restyle" color="accentText" />
            </View>
            <View style={styles.restyleText}>
              <AppText variant="heading">Dale una segunda vida</AppText>
              <AppText variant="caption" color="textSecondary">
                {forgottenCount === 1
                  ? '1 prenda no aparece en ningún outfit. Descubre cómo reutilizarla.'
                  : `${forgottenCount} prendas no aparecen en ningún outfit. Descubre cómo reutilizarlas.`}
              </AppText>
            </View>
            <Icon name="chevronRight" size={16} color="textSecondary" />
          </View>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Section title="Para ti" onSeeAll={() => router.push('/shop')}>
          <AppText variant="caption" color="textSecondary">
            Piezas que completan tu armario sin duplicar lo que ya tienes.
          </AppText>
          <ProductStrip
            recommendations={recommendations}
            onOpen={(r) => openProduct(r.product, { source: 'dashboard' })}
          />
        </Section>
      )}
    </Screen>
  );
}

function Section({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="heading">{title}</AppText>
        <Button title="Ver todo" variant="ghost" onPress={onSeeAll} />
      </View>
      {children}
    </View>
  );
}

function Stat({ icon, value, label, href }: { icon: IconName; value: number; label: string; href: Href }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
      onPress={() => router.navigate(href)}
      style={({ pressed }) => [
        styles.stat,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={18} color="accentText" />
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </Pressable>
  );
}

function ColorProfileCard({ season, swatches }: { season: string | null; swatches: { hex: string; name: string }[] }) {
  const theme = useTheme();
  return (
    <Card
      onPress={() => router.push(season ? '/profile/palette' : '/profile/selfie')}
      accessibilityLabel={season ? `Tu perfil de color: ${season}. Ver paleta` : 'Descubre tu paleta con un selfie'}>
      <View style={styles.colorHeader}>
        <View style={styles.colorText}>
          <AppText variant="overline" color="accentText">
            Perfil de color
          </AppText>
          <AppText variant="heading">{season ?? 'Descubre tu paleta'}</AppText>
          {!season && (
            <AppText variant="caption" color="textSecondary">
              Con un selfie analizamos tu subtono y tus colores ideales.
            </AppText>
          )}
        </View>
        <Icon name="chevronRight" size={16} color="textSecondary" />
      </View>
      {swatches.length > 0 && (
        <View style={styles.swatches}>
          {swatches.map((s) => (
            <View
              key={`${s.hex}-${s.name}`}
              style={[styles.swatch, { backgroundColor: s.hex, borderColor: theme.border }]}
            />
          ))}
        </View>
      )}
    </Card>
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
  heroButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.pill },
  heroButtonContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  heroButtonLabel: { letterSpacing: 1.5, textTransform: 'uppercase' },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 2,
  },
  pressed: { opacity: 0.8 },
  colorHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  colorText: { flex: 1, gap: 2 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  swatch: { width: 28, height: 28, borderRadius: Radius.pill, borderWidth: 1 },
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strip: { gap: Spacing.md },
  outfitItem: { width: 160 },
  garmentItem: { width: 140 },
  restyleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  restyleText: { flex: 1, gap: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
