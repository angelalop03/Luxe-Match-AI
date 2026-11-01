export type ColorSwatch = { hex: string; name: string };

/** Resultado del análisis de colorimetría (RF7). */
export type ColorProfile = {
  user_id: string;
  season: string | null;
  undertone: 'cool' | 'warm' | 'neutral' | 'olive' | null;
  contrast: 'low' | 'medium' | 'high' | null;
  palette: ColorSwatch[];
  recommended_colors: ColorSwatch[];
  avoid_colors: ColorSwatch[];
  summary: string | null;
  tips: string[];
  best_metals: string[];
  selfie_path: string | null;
  /** `ai`: análisis del selfie; `quiz`: test de preguntas sin foto. */
  analysis_method: 'ai' | 'quiz' | null;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
};
