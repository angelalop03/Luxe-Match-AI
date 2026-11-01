import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  Header,
  IconButton,
  Pill,
  Screen,
} from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { OutfitCard } from '@/features/outfits/outfit-card';
import { useOutfits } from '@/features/outfits/use-outfits';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/confirm';
import { setFavorite } from '@/services/outfit-service';
import type { Outfit } from '@/types/outfit';

/** Outfits guardados (RF10) y acceso a la generación con IA (RF8). */
export default function OutfitsScreen() {
  const theme = useTheme();
  const { outfits, setOutfits, loading, error, reload } = useOutfits();
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const visible = useMemo(
    () => (outfits ?? []).filter((o) => !onlyFavorites || o.is_favorite),
    [outfits, onlyFavorites],
  );
  const imageUrls = useSignedUrls(
    'garments',
    (outfits ?? []).flatMap((o) => o.garments.slice(0, 4).map((g) => g.image_path)),
  );
  const total = outfits?.length ?? 0;

  async function toggleFavorite(outfit: Outfit) {
    const next = !outfit.is_favorite;
    // Actualización optimista: se revierte si falla.
    setOutfits((list) => list?.map((o) => (o.id === outfit.id ? { ...o, is_favorite: next } : o)) ?? null);
    try {
      await setFavorite(outfit.id, next);
    } catch {
      setOutfits((list) => list?.map((o) => (o.id === outfit.id ? { ...o, is_favorite: !next } : o)) ?? null);
      notify('No se ha podido actualizar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  const goGenerate = () => router.push('/outfits/generate');

  return (
    <Screen edges={['top']} maxWidth={MaxWideContentWidth}>
      <Header
        overline={total === 1 ? '1 outfit guardado' : `${total} outfits guardados`}
        title="Tus outfits"
        right={total > 0 ? <IconButton icon="sparkles" label="Crear looks" variant="filled" onPress={goGenerate} /> : undefined}
      />

      {loading && <ActivityIndicator color={theme.accent} style={styles.loader} />}

      {error && (
        <View style={styles.errorBox}>
          <AppText color="danger" center>
            {error}
          </AppText>
          <Button title="Reintentar" variant="secondary" onPress={reload} />
        </View>
      )}

      {outfits && total === 0 && (
        <EmptyState
          icon="sparkles"
          title="Aún no tienes outfits"
          description="Elige una ocasión y crearemos varios looks con las prendas de tu armario."
          action={<Button title="Crear mis primeros looks" onPress={goGenerate} />}
        />
      )}

      {outfits && total > 0 && (
        <>
          <Card
            onPress={goGenerate}
            accessibilityLabel="Crear nuevos looks con IA"
            style={[styles.cta, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <AppText variant="overline" style={{ color: theme.accent }}>
              Estilismo IA
            </AppText>
            <AppText variant="heading" style={{ color: theme.onPrimary }}>
              ¿Qué te pones hoy?
            </AppText>
            <AppText variant="caption" style={{ color: theme.onPrimary }}>
              Elige la ocasión y te proponemos looks con tu armario.
            </AppText>
          </Card>

          <View style={styles.filters}>
            <Pill role="radio" label="Todos" selected={!onlyFavorites} onPress={() => setOnlyFavorites(false)} />
            <Pill role="radio" label="Favoritos" selected={onlyFavorites} onPress={() => setOnlyFavorites(true)} />
          </View>

          {visible.length === 0 ? (
            <AppText color="textSecondary" center style={styles.noResults}>
              Todavía no has marcado ningún favorito.
            </AppText>
          ) : (
            <View style={styles.grid}>
              {visible.map((outfit) => (
                <View key={outfit.id} style={styles.cell}>
                  <OutfitCard
                    outfit={outfit}
                    imageUrls={imageUrls}
                    onPress={() => router.push({ pathname: '/outfits/[id]', params: { id: outfit.id } })}
                    onToggleFavorite={() => toggleFavorite(outfit)}
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.xl },
  errorBox: { gap: Spacing.md },
  cta: { gap: Spacing.xxs },
  filters: { flexDirection: 'row', gap: Spacing.xs },
  noResults: { paddingVertical: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  cell: { width: '50%', minWidth: 150, maxWidth: 240, flexGrow: 1, padding: Spacing.xs },
});
