import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Header, Icon, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { matchAccessoryProducts } from '@/features/restyle/accessory-products';
import { ProductStrip } from '@/features/shop/product-strip';
import { useRecommendationData } from '@/features/shop/use-recommendations';
import { categoryLabel } from '@/features/wardrobe/garment-options';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { AiError, restyleGarment } from '@/services/ai-service';
import { getGarment } from '@/services/garment-service';
import { openProduct } from '@/services/product-service';
import type { Garment, Restyle } from '@/types/garment';

const TypeLabels: Record<Restyle['transformations'][number]['type'], string> = {
  modificacion: 'Modificación',
  estilismo: 'Estilismo',
  tendencia: 'Tendencia',
};
const DifficultyLabels: Record<Restyle['transformations'][number]['difficulty'], string> = {
  facil: 'Fácil',
  media: 'Dificultad media',
};

/** Ideas de Restyle de una prenda (RF14). */
export default function RestyleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [garment, setGarment] = useState<Garment | null | undefined>(undefined);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urls = useSignedUrls('garments', [garment?.image_path]);
  const { products, context } = useRecommendationData();

  useEffect(() => {
    let cancelled = false;
    getGarment(id)
      .then((result) => {
        if (!cancelled) setGarment(result);
      })
      .catch(() => {
        if (!cancelled) setGarment(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const restyle = garment?.restyle ?? null;
  const accessoryProducts = useMemo(
    () => (restyle && products && context ? matchAccessoryProducts(products, context, restyle.accessories) : []),
    [restyle, products, context],
  );

  if (garment === undefined) {
    return (
      <Screen centered>
        <ActivityIndicator color={theme.accent} />
      </Screen>
    );
  }
  if (garment === null) {
    return (
      <Screen>
        <Header back title="Prenda no encontrada" />
      </Screen>
    );
  }

  const current = garment;
  const imageUrl = current.image_path ? urls[current.image_path] : undefined;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await restyleGarment(current.id);
      setGarment({ ...current, restyle: result.restyle, restyled_at: result.restyle.generated_at });
    } catch (e) {
      setError(e instanceof AiError ? e.message : 'No hemos podido generar las ideas.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Screen>
      <Header back overline="Restyle" title={current.name} />

      <View style={styles.top}>
        <View style={[styles.image, { backgroundColor: current.primary_color_hex ?? theme.surfaceMuted, borderColor: theme.border }]}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />}
        </View>
        <View style={styles.topText}>
          <AppText variant="caption" color="textSecondary">
            {categoryLabel(current.category)}
            {current.color_name ? ` · ${current.color_name}` : ''}
          </AppText>
          <AppText color="textSecondary">
            {restyle?.summary ?? 'Descubre cómo transformarla, llevarla de otra forma o adaptarla a las tendencias.'}
          </AppText>
        </View>
      </View>

      {!restyle && (
        <Button title="Generar ideas de Restyle" onPress={handleGenerate} loading={generating} />
      )}
      {generating && (
        <AppText variant="caption" color="textSecondary" center accessibilityLiveRegion="polite">
          Buscando ideas para tu prenda…
        </AppText>
      )}
      {error && (
        <AppText color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}

      {restyle && (
        <>
          <View style={styles.section}>
            <AppText variant="heading">Ideas para transformarla</AppText>
            {restyle.transformations.map((idea) => (
              <Card key={idea.title} style={styles.idea}>
                <View style={styles.badges}>
                  <Badge label={TypeLabels[idea.type]} />
                  <Badge label={DifficultyLabels[idea.difficulty]} muted />
                </View>
                <AppText variant="bodyMedium">{idea.title}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {idea.description}
                </AppText>
              </Card>
            ))}
          </View>

          {restyle.trend_adaptations.length > 0 && (
            <Card>
              <AppText variant="heading">Adáptala a la tendencia</AppText>
              {restyle.trend_adaptations.map((tip) => (
                <View key={tip} style={styles.tip}>
                  <Icon name="sparkles" size={16} color="accentText" />
                  <AppText style={styles.tipText}>{tip}</AppText>
                </View>
              ))}
            </Card>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading">Complementos que la renuevan</AppText>
              <AppText variant="caption" color="textSecondary">
                {restyle.accessories.map((a) => `${a.name} (${a.color_name.toLowerCase()})`).join(' · ')}
              </AppText>
            </View>
            {accessoryProducts.length > 0 && (
              <ProductStrip
                recommendations={accessoryProducts}
                onOpen={(r) => openProduct(r.product, { source: 'restyle', garmentId: current.id })}
              />
            )}
          </View>

          {restyle.source === 'rules' && (
            <AppText variant="caption" color="textSecondary">
              Ideas generales: la IA no estaba disponible al generarlas.
            </AppText>
          )}
          <Button title="Pedir nuevas ideas" variant="secondary" onPress={handleGenerate} loading={generating} />
        </>
      )}
    </Screen>
  );
}

function Badge({ label, muted }: { label: string; muted?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: muted ? theme.surfaceMuted : theme.accentSoft }]}>
      <AppText variant="caption" color={muted ? 'textSecondary' : 'accentText'}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  image: { width: 110, aspectRatio: 3 / 4, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  topText: { flex: 1, gap: Spacing.xs },
  section: { gap: Spacing.sm },
  sectionHeader: { gap: Spacing.xxs },
  idea: { gap: Spacing.xs, padding: Spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  tipText: { flex: 1 },
});
