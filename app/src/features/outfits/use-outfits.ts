import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { listOutfits } from '@/services/outfit-service';
import type { Outfit } from '@/types/outfit';

/** Outfits guardados, recargados cada vez que la pantalla gana el foco. */
export function useOutfits() {
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setOutfits(await listOutfits());
      setError(null);
    } catch {
      setError('No hemos podido cargar tus outfits.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { outfits, setOutfits, loading: outfits === null && !error, error, reload };
}
