import type { Garment, GarmentCategory, Season } from './garment';

export type OutfitSource = 'ai' | 'rules' | 'manual';

export type OutfitRequest = {
  occasion: string;
  season: Season;
  notes?: string;
  count?: number;
};

/** Propuesta generada, aún sin guardar. */
export type OutfitProposal = {
  name: string;
  garment_ids: string[];
  explanation: string;
  color_harmony: string;
  styling_tip: string;
  missing_piece: string;
  missing_piece_category: GarmentCategory | null;
};

/** Outfit guardado con sus prendas ya resueltas, en orden. */
export type Outfit = {
  id: string;
  name: string;
  occasion: string | null;
  season: Season | null;
  explanation: string | null;
  color_harmony: string | null;
  styling_tip: string | null;
  missing_piece: string | null;
  missing_piece_category: GarmentCategory | null;
  source: OutfitSource;
  is_favorite: boolean;
  created_at: string;
  garments: Garment[];
};
