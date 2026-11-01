/** Utilidades de color compartidas por recomendaciones y outfits. */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Distancia euclídea en RGB: < 70 se percibe como "el mismo color". */
export function colorDistance(a: string, b: string) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function isNearColor(hex: string | null | undefined, swatches: { hex: string }[], threshold = 70) {
  return !!hex && swatches.some((s) => colorDistance(hex, s.hex) < threshold);
}
