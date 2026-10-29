import type { Garment, GarmentCategory, Season } from '@/types/garment';

export type GarmentFilter = {
  category: GarmentCategory | null;
  season: Season | null;
  query: string;
};

export const EmptyFilter: GarmentFilter = { category: null, season: null, query: '' };

/** Filtra el armario por categoría, temporada y texto (RF5). */
export function filterGarments(garments: Garment[], filter: GarmentFilter): Garment[] {
  const query = normalize(filter.query.trim());
  return garments.filter((garment) => {
    if (filter.category && garment.category !== filter.category) return false;
    if (filter.season && !garment.seasons.includes(filter.season)) return false;
    if (query) {
      const haystack = normalize(
        [garment.name, garment.subcategory, garment.color_name].filter(Boolean).join(' '),
      );
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

/** Minúsculas y sin tildes, para que "abrigo" encuentre "Abrigo". */
function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
