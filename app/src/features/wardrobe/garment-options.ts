import { QuizSteps, type QuizOption } from '@/features/onboarding/questions';
import type { GarmentCategory, Season } from '@/types/garment';

/**
 * Valores de clasificación de prendas (RF5). Estilos y ocasiones reutilizan
 * los del quiz para que el motor de outfits pueda cruzarlos con el perfil.
 */

export const Categories: { value: GarmentCategory; label: string; plural: string }[] = [
  { value: 'top', label: 'Parte de arriba', plural: 'Partes de arriba' },
  { value: 'bottom', label: 'Parte de abajo', plural: 'Partes de abajo' },
  { value: 'dress', label: 'Vestido o mono', plural: 'Vestidos y monos' },
  { value: 'outerwear', label: 'Abrigo o chaqueta', plural: 'Abrigos y chaquetas' },
  { value: 'shoes', label: 'Calzado', plural: 'Calzado' },
  { value: 'bag', label: 'Bolso', plural: 'Bolsos' },
  { value: 'accessory', label: 'Accesorio', plural: 'Accesorios' },
];

export const Seasons: { value: Season; label: string }[] = [
  { value: 'primavera', label: 'Primavera' },
  { value: 'verano', label: 'Verano' },
  { value: 'otono', label: 'Otoño' },
  { value: 'invierno', label: 'Invierno' },
];

function quizOptions(field: 'styles' | 'events'): QuizOption[] {
  for (const step of QuizSteps) {
    const question = step.questions.find((q) => q.field === field);
    if (question) return question.options.map(({ value, label }) => ({ value, label }));
  }
  return [];
}

export const StyleOptions = quizOptions('styles');
export const OccasionOptions = quizOptions('events');

/** Colores para clasificar prendas. El escaneo IA (fase 3) afinará el hex exacto. */
export const GarmentColors: { hex: string; name: string }[] = [
  { hex: '#1A1714', name: 'Negro' },
  { hex: '#FFFFFF', name: 'Blanco' },
  { hex: '#F3EDE2', name: 'Marfil' },
  { hex: '#D8C9B0', name: 'Beige' },
  { hex: '#B98A5A', name: 'Camel' },
  { hex: '#6B4A30', name: 'Marrón' },
  { hex: '#8C8A87', name: 'Gris' },
  { hex: '#1F2A44', name: 'Azul marino' },
  { hex: '#3F6EA8', name: 'Azul' },
  { hex: '#8FB3D9', name: 'Azul cielo' },
  { hex: '#6B7340', name: 'Verde oliva' },
  { hex: '#2F5D4A', name: 'Verde botella' },
  { hex: '#B3262C', name: 'Rojo' },
  { hex: '#6B1F2E', name: 'Burdeos' },
  { hex: '#D9A9A0', name: 'Rosa empolvado' },
  { hex: '#D96C8A', name: 'Rosa' },
  { hex: '#E0B341', name: 'Mostaza' },
  { hex: '#D9752B', name: 'Naranja' },
  { hex: '#6A4C93', name: 'Morado' },
  { hex: '#C9A876', name: 'Dorado' },
  { hex: '#BFC3C7', name: 'Plateado' },
];

export function categoryLabel(value: GarmentCategory) {
  return Categories.find((c) => c.value === value)?.label ?? value;
}

export function seasonLabel(value: string) {
  return Seasons.find((s) => s.value === value)?.label ?? value;
}
