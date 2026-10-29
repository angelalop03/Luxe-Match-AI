export type GarmentCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory'
  | 'bag';

export type Season = 'primavera' | 'verano' | 'otono' | 'invierno';

export type Garment = {
  id: string;
  user_id: string;
  name: string;
  category: GarmentCategory;
  subcategory: string | null;
  primary_color_hex: string | null;
  color_name: string | null;
  styles: string[];
  occasions: string[];
  seasons: Season[];
  image_path: string | null;
  ai_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

/** Campos que el usuario rellena al añadir o editar una prenda. */
export type GarmentInput = Pick<
  Garment,
  | 'name'
  | 'category'
  | 'subcategory'
  | 'primary_color_hex'
  | 'color_name'
  | 'styles'
  | 'occasions'
  | 'seasons'
  | 'ai_metadata'
>;
