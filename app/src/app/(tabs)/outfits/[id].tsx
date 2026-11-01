import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Header, Icon, IconButton, Pill, Screen, TextField } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { OutfitCollage } from '@/features/outfits/outfit-collage';
import { occasionLabel } from '@/features/outfits/outfit-options';
import { OutfitPieces } from '@/features/outfits/outfit-pieces';
import { CompleteTheLook } from '@/features/shop/complete-the-look';
import { seasonLabel } from '@/features/wardrobe/garment-options';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { confirm, notify } from '@/lib/confirm';
import { deleteOutfit, getOutfit, OutfitError, setFavorite, updateOutfit } from '@/services/outfit-service';
import type { Garment } from '@/types/garment';
import type { Outfit } from '@/types/outfit';

/** Detalle y edición de un outfit guardado (RF10). */
export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { garments: wardrobe } = useGarments();
  const [outfit, setOutfit] = useState<Outfit | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [pieces, setPieces] = useState<Garment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOutfit(id)
      .then((result) => {
        if (!cancelled) setOutfit(result);
      })
      .catch(() => {
        if (!cancelled) setOutfit(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const shown = editing ? pieces : (outfit?.garments ?? []);
  const imageUrls = useSignedUrls(
    'garments',
    [...shown, ...(editing ? (wardrobe ?? []) : [])].map((g) => g.image_path),
  );
  const available = useMemo(
    () => (wardrobe ?? []).filter((g) => !pieces.some((p) => p.id === g.id)),
    [wardrobe, pieces],
  );

  if (outfit === undefined) {
    return (
      <Screen centered>
        <ActivityIndicator color={theme.accent} />
      </Screen>
    );
  }
  if (outfit === null) {
    return (
      <Screen>
        <Header back title="Outfit no encontrado" />
        <AppText color="textSecondary">Puede que se haya eliminado.</AppText>
      </Screen>
    );
  }

  const current = outfit;
  const meta = [occasionLabel(current.occasion), current.season && seasonLabel(current.season)]
    .filter(Boolean)
    .join(' · ');
  // Si se borró alguna prenda del armario, el outfit puede haber quedado incompleto (RB10).
  const isIncomplete =
    !current.garments.some((g) => g.category === 'dress') &&
    !(current.garments.some((g) => g.category === 'top') && current.garments.some((g) => g.category === 'bottom'));

  function startEditing() {
    setName(current.name);
    setPieces(current.garments);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateOutfit(current, {
        name,
        isFavorite: current.is_favorite,
        garmentIds: pieces.map((p) => p.id),
      });
      // Recargamos: si cambiaron las prendas, el servidor limpia la explicación generada.
      setOutfit((await getOutfit(current.id)) ?? null);
      setEditing(false);
    } catch (e) {
      setError(e instanceof OutfitError ? e.message : 'No hemos podido guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFavorite() {
    const next = !current.is_favorite;
    setOutfit({ ...current, is_favorite: next });
    try {
      await setFavorite(current.id, next);
    } catch {
      setOutfit({ ...current, is_favorite: !next });
      notify('No se ha podido actualizar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Eliminar outfit',
      message: `"${current.name}" se eliminará de tus outfits. Las prendas siguen en tu armario.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteOutfit(current.id);
      router.back();
    } catch {
      notify('No se ha podido eliminar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  if (editing) {
    return (
      <Screen
        footer={
          <View style={styles.footer}>
            {error && (
              <AppText color="danger" center accessibilityLiveRegion="polite">
                {error}
              </AppText>
            )}
            <Button title="Guardar cambios" onPress={handleSave} loading={saving} />
            <Button title="Cancelar" variant="ghost" onPress={() => setEditing(false)} />
          </View>
        }>
        <Header overline="Editar outfit" title={current.name} />
        <TextField label="Nombre" value={name} onChangeText={setName} />

        <View style={styles.section}>
          <AppText variant="heading">Prendas</AppText>
          <OutfitPieces
            garments={pieces}
            imageUrls={imageUrls}
            onRemove={(g) => setPieces((list) => list.filter((p) => p.id !== g.id))}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="heading">Añadir de tu armario</AppText>
          {available.length === 0 ? (
            <AppText color="textSecondary">Ya están todas tus prendas en este outfit.</AppText>
          ) : (
            <View style={styles.pills}>
              {available.map((g) => (
                <Pill
                  key={g.id}
                  label={g.name}
                  swatch={g.primary_color_hex ?? undefined}
                  selected={false}
                  onPress={() => setPieces((list) => [...list, g])}
                />
              ))}
            </View>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        back
        overline={meta || 'Outfit'}
        title={current.name}
        right={
          <IconButton
            icon="heart"
            label={current.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            color={current.is_favorite ? 'danger' : 'text'}
            selected={current.is_favorite}
            onPress={handleToggleFavorite}
          />
        }
      />

      <View style={styles.collage}>
        <OutfitCollage garments={current.garments} imageUrls={imageUrls} />
      </View>

      {isIncomplete && (
        <Card>
          <AppText color="danger">
            Este outfit ha quedado incompleto porque eliminaste alguna prenda. Edítalo para añadir otra.
          </AppText>
        </Card>
      )}

      {current.explanation ? (
        <AppText color="textSecondary">{current.explanation}</AppText>
      ) : current.source === 'manual' ? (
        <AppText variant="caption" color="textSecondary">
          Look ajustado por ti a partir de una propuesta.
        </AppText>
      ) : null}

      <View style={styles.section}>
        <AppText variant="heading">Prendas</AppText>
        <OutfitPieces garments={current.garments} imageUrls={imageUrls} />
      </View>

      {(current.color_harmony || current.styling_tip) && (
        <Card>
          {current.color_harmony && <Detail icon="palette" text={current.color_harmony} />}
          {current.styling_tip && <Detail icon="sparkles" text={current.styling_tip} />}
        </Card>
      )}

      {current.missing_piece && (
        <View style={[styles.missing, { backgroundColor: theme.accentSoft }]}>
          <Icon name="bag" size={16} color="accentText" />
          <AppText variant="caption" style={styles.detailText}>
            Le vendría bien: {current.missing_piece}
          </AppText>
        </View>
      )}

      <CompleteTheLook outfit={current} />

      <Button title="Editar outfit" variant="secondary" onPress={startEditing} />
      <Button title="Eliminar outfit" variant="ghost" onPress={handleDelete} />
    </Screen>
  );
}

function Detail({ icon, text }: { icon: 'palette' | 'sparkles'; text: string }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={16} color="accentText" />
      <AppText variant="caption" style={styles.detailText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  collage: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  section: { gap: Spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  detailText: { flex: 1 },
  missing: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  footer: { gap: Spacing.xs },
});
