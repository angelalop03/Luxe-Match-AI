-- Cómo se obtuvo el perfil de color (RF7): análisis del selfie con IA o test
-- de preguntas sin foto, para quien prefiere no subir un selfie.
alter table public.color_profiles
  add column analysis_method text check (analysis_method in ('ai', 'quiz'));

update public.color_profiles set analysis_method = 'ai' where analyzed_at is not null;
