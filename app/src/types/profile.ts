/** Respuestas del quiz de onboarding (RF2, RF3). Se guardan como JSONB. */
export type StylePreferences = {
  styles: string[];
  events: string[];
  budget: string | null;
  fits: string[];
  priorities: string[];
  favoriteColors: string[];
  climate: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  style_preferences: Partial<StylePreferences>;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const EmptyStylePreferences: StylePreferences = {
  styles: [],
  events: [],
  budget: null,
  fits: [],
  priorities: [],
  favoriteColors: [],
  climate: null,
};
