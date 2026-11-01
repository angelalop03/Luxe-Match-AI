import { useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { track } from '@/services/analytics';

/**
 * Registra cada pantalla visitada como `screen_view` (RF13: interacción).
 * Usa el patrón de la ruta (`(tabs)/wardrobe/[id]`), nunca ids concretos,
 * para no guardar datos personales en las métricas.
 */
export function ScreenTracker() {
  const segments = useSegments();
  const screen = segments.join('/') || 'index';
  const lastScreen = useRef<string | null>(null);

  useEffect(() => {
    if (lastScreen.current === screen) return;
    lastScreen.current = screen;
    track('screen_view', { screen });
  }, [screen]);

  return null;
}
