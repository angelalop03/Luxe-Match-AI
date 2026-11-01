import { OccasionOptions, Seasons } from '@/features/wardrobe/garment-options';
import type { Season } from '@/types/garment';

export { OccasionOptions, Seasons };

export function occasionLabel(value: string | null) {
  if (!value) return null;
  return OccasionOptions.find((o) => o.value === value)?.label ?? value;
}

/** Temporada actual según el mes (hemisferio norte), para preseleccionarla. */
export function currentSeason(date = new Date()): Season {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'primavera';
  if (month >= 6 && month <= 8) return 'verano';
  if (month >= 9 && month <= 11) return 'otono';
  return 'invierno';
}
