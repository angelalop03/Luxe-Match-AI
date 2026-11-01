import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Card, Header, Screen } from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { useGarmentUsage } from '@/features/restyle/use-garment-usage';
import { GarmentCard } from '@/features/wardrobe/garment-card';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import type { Garment } from '@/types/garment';

/**
 * Restyle (RF14, RB11): detecta las prendas que no aparecen en ningún outfit
 * para proponer cómo reutilizarlas antes de comprar nada nuevo.
 */
export default function RestyleListScreen() {
  const theme = useTheme();
  const { garments } = useGarments();
  const usedIds = useGarmentUsage();
  const imageUrls = useSignedUrls('garments', (garments ?? []).map((g) => g.image_path));

  const loading = !garments || !usedIds;
  const forgotten = (garments ?? []).filter((g) => !usedIds?.has(g.id));
  const rest = (garments ?? []).filter((g) => usedIds?.has(g.id));

  const open = (garment: Garment) =>
    router.push({ pathname: '/wardrobe/restyle/[id]', params: { id: garment.id } });

  return (
    <Screen maxWidth={MaxWideContentWidth}>
      <Header back overline="Restyle" title="Dale una segunda vida" />
      <AppText color="textSecondary">
        Antes de comprar, reutiliza. Te proponemos cómo transformar o llevar de otra forma las
        prendas que ya tienes.
      </AppText>

      {loading && <ActivityIndicator color={theme.accent} style={styles.loader} />}

      {!loading && (
        <>
          <Section
            title="Prendas olvidadas"
            subtitle={
              forgotten.length > 0
                ? `${forgotten.length} ${forgotten.length === 1 ? 'prenda no aparece' : 'prendas no aparecen'} en ningún outfit guardado.`
                : 'Todas tus prendas aparecen en algún outfit. ¡Bien hecho!'
            }>
            <Grid garments={forgotten} imageUrls={imageUrls} onOpen={open} />
          </Section>

          {rest.length > 0 && (
            <Section title="Resto del armario" subtitle="También puedes buscar ideas nuevas para estas.">
              <Grid garments={rest} imageUrls={imageUrls} onOpen={open} />
            </Section>
          )}

          {garments?.length === 0 && (
            <Card>
              <AppText color="textSecondary">Añade prendas a tu armario para ver ideas de Restyle.</AppText>
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {subtitle}
        </AppText>
      </View>
      {children}
    </View>
  );
}

function Grid({
  garments,
  imageUrls,
  onOpen,
}: {
  garments: Garment[];
  imageUrls: Record<string, string>;
  onOpen: (garment: Garment) => void;
}) {
  return (
    <View style={styles.grid}>
      {garments.map((garment) => (
        <View key={garment.id} style={styles.cell}>
          <GarmentCard
            garment={garment}
            imageUrl={garment.image_path ? imageUrls[garment.image_path] : undefined}
            onPress={() => onOpen(garment)}
          />
          {garment.restyle && (
            <AppText variant="caption" color="accentText">
              Con ideas guardadas
            </AppText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.xl },
  section: { gap: Spacing.md },
  sectionHeader: { gap: Spacing.xxs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  cell: { width: '50%', minWidth: 150, maxWidth: 220, flexGrow: 1, padding: Spacing.xs, gap: 2 },
});
