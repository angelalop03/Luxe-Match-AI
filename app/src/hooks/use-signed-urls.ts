import { useEffect, useState } from 'react';

import { getSignedUrls, type ImageBucket } from '@/lib/images';

/** Devuelve las URLs firmadas de las rutas dadas (`ruta → url`). */
export function useSignedUrls(bucket: ImageBucket, paths: (string | null | undefined)[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const validPaths = paths.filter((p): p is string => !!p);
  const key = validPaths.join('|');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getSignedUrls(bucket, key.split('|'))
      .then((result) => {
        if (!cancelled) setUrls((prev) => ({ ...prev, ...result }));
      })
      .catch((error: Error) => console.warn('[signed-urls]', error.message));
    return () => {
      cancelled = true;
    };
  }, [bucket, key]);

  return urls;
}
