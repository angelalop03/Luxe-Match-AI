import { router } from 'expo-router';

import { GarmentForm } from '@/features/wardrobe/garment-form';
import { useAuth } from '@/providers/auth-provider';
import { createGarment } from '@/services/garment-service';

export default function NewGarmentScreen() {
  const { user } = useAuth();

  return (
    <GarmentForm
      overline="Armario"
      title="Nueva prenda"
      submitLabel="Guardar prenda"
      onSubmit={async (input, image) => {
        if (!user) return;
        await createGarment(user.id, input, image);
        router.back();
      }}
    />
  );
}
