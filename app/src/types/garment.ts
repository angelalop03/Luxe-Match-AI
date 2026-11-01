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
  restyle: Restyle | null;
  restyled_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Ideas de Restyle (RF14) guardadas en la prenda. */
export type Restyle = {
  source: 'ai' | 'rules';
  generated_at: string;
  worth_transforming: boolean;
  summary: string;
  transformations: {
    title: string;
    description: string;
    type: 'modificacion' | 'estilismo' | 'tendencia';
    difficulty: 'facil' | 'media';
  }[];
  trend_adaptations: string[];
  accessories: {
    name: string;
    category: 'shoes' | 'bag' | 'accessory' | 'outerwear';
    color_name: string;
  }[];
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
