import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Header, IconButton, Pill, Screen, TextField } from '@/components/ui';
import { MaxWideContentWidth, Spacing } from '@/constants/theme';
import { EmptyFilter, filterGarments, type GarmentFilter } from '@/features/wardrobe/filter';
import { GarmentCard } from '@/features/wardrobe/garment-card';
import { Categories, Seasons } from '@/features/wardrobe/garment-options';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';

/** Armario digital (RF5): cuadrícula de prendas con filtros. */
export default function WardrobeScreen() {
  const theme = useTheme();
  const { garments, loading, error, reload } = useGarments();
  const [filter, setFilter] = useState<GarmentFilter>(EmptyFilter);

  const visible = useMemo(() => filterGarments(garments ?? [], filter), [garments, filter]);
  const imageUrls = useSignedUrls('garments', (garments ?? []).map((g) => g.image_path));

  // Solo mostramos las categorías que el usuario tiene.
  const usedCategories = Categories.filter((c) => garments?.some((g) => g.category === c.value));
  const total = garments?.length ?? 0;
  const isFiltered = filter.category !== null || filter.season !== null || filter.query !== '';

  const addButton = (
    <IconButton
      icon="plus"
      label="Añadir prenda"
      variant="filled"
      onPress={() => router.push('/wardrobe/new')}
    />
  );

  return (
    <Screen edges={['top']} maxWidth={MaxWideContentWidth}>
      <Header
        overline={total === 1 ? '1 prenda' : `${total} prendas`}
        title="Tu armario"
        right={total > 0 ? addButton : undefined}
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

      {garments && total === 0 && (
        <EmptyState
          icon="wardrobe"
          title="Tu armario está vacío"
          description="Añade tus prendas con una foto. Cuantas más tengas, mejores serán tus outfits."
          action={<Button title="Añadir mi primera prenda" onPress={() => router.push('/wardrobe/new')} />}
        />
      )}

      {garments && total > 0 && (
        <>
          <View style={styles.filters}>
            <TextField
              label="Buscar"
              value={filter.query}
              onChangeText={(query) => setFilter((f) => ({ ...f, query }))}
              placeholder="Nombre, tipo o color"
              autoCorrect={false}
              returnKeyType="search"
            />
            <FilterRow label="Categoría">
              <Pill
                role="radio"
                label="Todas"
                selected={filter.category === null}
                onPress={() => setFilter((f) => ({ ...f, category: null }))}
              />
              {usedCategories.map((c) => (
                <Pill
                  key={c.value}
                  role="radio"
                  label={c.plural}
                  selected={filter.category === c.value}
                  onPress={() => setFilter((f) => ({ ...f, category: c.value }))}
                />
              ))}
            </FilterRow>
            <FilterRow label="Temporada">
              {Seasons.map((s) => (
                <Pill
                  key={s.value}
                  role="radio"
                  label={s.label}
                  selected={filter.season === s.value}
                  onPress={() =>
                    setFilter((f) => ({ ...f, season: f.season === s.value ? null : s.value }))
                  }
                />
              ))}
            </FilterRow>
          </View>

          {visible.length === 0 ? (
            <View style={styles.noResults}>
              <AppText color="textSecondary" center>
                Ninguna prenda coincide con los filtros.
              </AppText>
              {isFiltered && (
                <Button title="Quitar filtros" variant="ghost" onPress={() => setFilter(EmptyFilter)} />
              )}
            </View>
          ) : (
            <View style={styles.grid} accessibilityLabel={`${visible.length} prendas`}>
              {visible.map((garment) => (
                <View key={garment.id} style={styles.cell}>
                  <GarmentCard
                    garment={garment}
                    imageUrl={garment.image_path ? imageUrls[garment.image_path] : undefined}
                    onPress={() =>
                      router.push({ pathname: '/wardrobe/[id]', params: { id: garment.id } })
                    }
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

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={`Filtrar por ${label.toLowerCase()}`}
      contentContainerStyle={styles.filterRow}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.xl },
  errorBox: { gap: Spacing.md },
  filters: { gap: Spacing.sm },
  filterRow: { gap: Spacing.xs, paddingVertical: 2 },
  noResults: { gap: Spacing.sm, paddingVertical: Spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  cell: {
    width: '50%',
    padding: Spacing.xs,
    minWidth: 150,
    maxWidth: 220,
    flexGrow: 1,
  },
});
