import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { listGarments } from '@/services/garment-service';
import type { Garment } from '@/types/garment';

/** Lista de prendas que se recarga cada vez que la pantalla gana el foco. */
export function useGarments() {
  const [garments, setGarments] = useState<Garment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setGarments(await listGarments());
      setError(null);
    } catch {
      setError('No hemos podido cargar tu armario.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { garments, loading: garments === null && !error, error, reload };
}
