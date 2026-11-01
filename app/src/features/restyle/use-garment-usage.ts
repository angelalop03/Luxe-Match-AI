import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { listGarmentIdsInOutfits } from '@/services/garment-service';

/** Prendas usadas en algún outfit; se recarga al volver a la pantalla. */
export function useGarmentUsage() {
  const [usedIds, setUsedIds] = useState<Set<string> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      listGarmentIdsInOutfits()
        .then((ids) => {
          if (!cancelled) setUsedIds(ids);
        })
        .catch(() => {
          if (!cancelled) setUsedIds(new Set());
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return usedIds;
}
