import type { GarmentCategory } from './garment';

/** Producto del catálogo ecommerce (RF9). */
export type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: GarmentCategory;
  color_hex: string | null;
  color_name: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  external_url: string;
  styles: string[];
  occasions: string[];
  seasons: string[];
};

/** Producto recomendado con los motivos que se muestran al usuario. */
export type Recommendation = {
  product: Product;
  score: number;
  reasons: string[];
};
