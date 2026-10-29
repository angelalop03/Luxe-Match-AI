import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { AppText, Button, Header, Screen } from '@/components/ui';
import { GarmentForm } from '@/features/wardrobe/garment-form';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { confirm, notify } from '@/lib/confirm';
import { deleteGarment, getGarment, updateGarment } from '@/services/garment-service';
import type { Garment } from '@/types/garment';

/** Detalle y edición de una prenda (RF5). */
export default function EditGarmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [garment, setGarment] = useState<Garment | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const imageUrls = useSignedUrls('garments', [garment?.image_path]);

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
        <AppText color="textSecondary">Puede que se haya eliminado.</AppText>
      </Screen>
    );
  }

  async function handleDelete(current: Garment) {
    const confirmed = await confirm({
      title: 'Eliminar prenda',
      message: `"${current.name}" desaparecerá de tu armario y de tus outfits guardados.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteGarment(current);
      router.back();
    } catch {
      setDeleting(false);
      notify('No se ha podido eliminar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  return (
    <GarmentForm
      overline="Editar prenda"
      title={garment.name}
      initial={garment}
      imageUrl={garment.image_path ? imageUrls[garment.image_path] : undefined}
      submitLabel="Guardar cambios"
      onSubmit={async (input, image) => {
        await updateGarment(garment, input, image);
        router.back();
      }}
      extraActions={
        <Button
          title="Eliminar prenda"
          variant="ghost"
          loading={deleting}
          onPress={() => handleDelete(garment)}
        />
      }
    />
  );
}
