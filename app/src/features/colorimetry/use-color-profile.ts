import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { fetchColorProfile } from '@/services/color-profile-service';
import type { ColorProfile } from '@/types/color-profile';

/**
 * Perfil de color del usuario, recargado al volver a la pantalla.
 * `undefined` mientras carga; `null` si aún no ha subido selfie.
 */
export function useColorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ColorProfile | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      fetchColorProfile(user.id)
        .then((result) => {
          if (!cancelled) setProfile(result);
        })
        .catch(() => {
          if (!cancelled) setProfile(null);
        });
      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  return { profile, setProfile };
}
