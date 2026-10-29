import type { StylePreferences } from '@/types/profile';

/**
 * Contenido del quiz de onboarding (RF3). Los `value` se guardan en la base de
 * datos y los usa el motor de outfits; los `label` son solo de presentación.
 */
export type QuizOption = {
  value: string;
  label: string;
  description?: string;
  swatch?: string;
};

export type QuizQuestion = {
  field: keyof StylePreferences;
  title: string;
  label: string;
  mode: 'single' | 'multiple';
  options: QuizOption[];
  /** Máximo de opciones seleccionables en preguntas múltiples. */
  max?: number;
};

export type QuizStep = {
  id: string;
  overline: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
};

export const QuizSteps: QuizStep[] = [
  {
    id: 'style',
    overline: 'Tu estilo',
    title: '¿Con qué estilos te identificas?',
    subtitle: 'Elige hasta tres. Los usaremos como punto de partida para tus looks.',
    questions: [
      {
        field: 'styles',
        title: 'Estilos',
        label: 'Estilos con los que te identificas',
        mode: 'multiple',
        max: 3,
        options: [
          { value: 'minimalista', label: 'Minimalista', description: 'Líneas limpias, tonos neutros' },
          { value: 'clasico', label: 'Clásico', description: 'Atemporal y elegante' },
          { value: 'romantico', label: 'Romántico', description: 'Tejidos fluidos, detalles delicados' },
          { value: 'urbano', label: 'Urbano', description: 'Streetwear y siluetas relajadas' },
          { value: 'bohemio', label: 'Bohemio', description: 'Estampados, texturas naturales' },
          { value: 'glam', label: 'Glam', description: 'Brillos, satén, impacto' },
          { value: 'deportivo', label: 'Athleisure', description: 'Cómodo y funcional' },
          { value: 'vanguardista', label: 'Vanguardista', description: 'Volúmenes y piezas statement' },
        ],
      },
    ],
  },
  {
    id: 'events',
    overline: 'Tus ocasiones',
    title: '¿Para qué eventos te vistes más a menudo?',
    subtitle: 'Así priorizaremos los looks que más vas a usar.',
    questions: [
      {
        field: 'events',
        title: 'Eventos',
        label: 'Eventos habituales',
        mode: 'multiple',
        options: [
          { value: 'oficina', label: 'Oficina' },
          { value: 'casual', label: 'Día a día' },
          { value: 'cena', label: 'Cenas' },
          { value: 'boda', label: 'Bodas y ceremonias' },
          { value: 'gala', label: 'Galas y eventos de noche' },
          { value: 'fiesta', label: 'Fiestas' },
          { value: 'entrevista', label: 'Entrevistas' },
          { value: 'viaje', label: 'Viajes' },
        ],
      },
    ],
  },
  {
    id: 'budget',
    overline: 'Tu presupuesto',
    title: '¿Cuánto sueles invertir por prenda?',
    subtitle: 'Solo lo usamos para ajustar las recomendaciones de compra.',
    questions: [
      {
        field: 'budget',
        title: 'Presupuesto',
        label: 'Presupuesto por prenda',
        mode: 'single',
        options: [
          { value: 'low', label: 'Hasta 50 €' },
          { value: 'medium', label: 'Entre 50 € y 150 €' },
          { value: 'high', label: 'Entre 150 € y 400 €' },
          { value: 'luxury', label: 'Más de 400 €' },
        ],
      },
    ],
  },
  {
    id: 'preferences',
    overline: 'Tus preferencias',
    title: '¿Qué es importante para ti?',
    subtitle: 'Cuéntanos cómo te gusta llevar la ropa y qué valoras al comprar.',
    questions: [
      {
        field: 'fits',
        title: 'Siluetas',
        label: 'Siluetas preferidas',
        mode: 'multiple',
        options: [
          { value: 'entallado', label: 'Entallado' },
          { value: 'ajustado', label: 'Ajustado' },
          { value: 'fluido', label: 'Fluido' },
          { value: 'oversize', label: 'Oversize' },
        ],
      },
      {
        field: 'priorities',
        title: 'Prioridades',
        label: 'Prioridades al comprar',
        mode: 'multiple',
        options: [
          { value: 'sostenibilidad', label: 'Sostenibilidad' },
          { value: 'comodidad', label: 'Comodidad' },
          { value: 'tendencia', label: 'Estar a la última' },
          { value: 'atemporal', label: 'Piezas atemporales' },
          { value: 'segunda_mano', label: 'Segunda mano' },
          { value: 'calidad', label: 'Calidad de los tejidos' },
        ],
      },
    ],
  },
  {
    id: 'colors',
    overline: 'Tus colores',
    title: '¿Qué colores te gusta llevar?',
    subtitle: 'Más adelante los contrastaremos con tu análisis de colorimetría.',
    questions: [
      {
        field: 'favoriteColors',
        title: 'Colores',
        label: 'Colores favoritos',
        mode: 'multiple',
        options: [
          { value: 'negro', label: 'Negro', swatch: '#1A1714' },
          { value: 'blanco', label: 'Blanco roto', swatch: '#F3EDE2' },
          { value: 'camel', label: 'Camel', swatch: '#B98A5A' },
          { value: 'gris', label: 'Gris', swatch: '#8C8A87' },
          { value: 'marino', label: 'Azul marino', swatch: '#1F2A44' },
          { value: 'burdeos', label: 'Burdeos', swatch: '#6B1F2E' },
          { value: 'verde', label: 'Verde oliva', swatch: '#6B7340' },
          { value: 'rosa', label: 'Rosa empolvado', swatch: '#D9A9A0' },
          { value: 'rojo', label: 'Rojo', swatch: '#B3262C' },
          { value: 'azul', label: 'Azul cielo', swatch: '#8FB3D9' },
        ],
      },
    ],
  },
  {
    id: 'climate',
    overline: 'Tu clima',
    title: '¿Qué clima tienes la mayor parte del año?',
    subtitle: 'Nos ayuda a sugerirte prendas de la temporada adecuada.',
    questions: [
      {
        field: 'climate',
        title: 'Clima',
        label: 'Clima habitual',
        mode: 'single',
        options: [
          { value: 'calido', label: 'Cálido', description: 'Veranos largos, inviernos suaves' },
          { value: 'templado', label: 'Templado', description: 'Cuatro estaciones marcadas' },
          { value: 'frio', label: 'Frío', description: 'Inviernos largos' },
          { value: 'variable', label: 'Variable', description: 'Viajo o cambia mucho' },
        ],
      },
    ],
  },
];

/** Una pregunta está respondida si tiene al menos un valor. */
export function isQuestionAnswered(question: QuizQuestion, answers: StylePreferences) {
  const value = answers[question.field];
  return Array.isArray(value) ? value.length > 0 : value !== null;
}

/** Busca la etiqueta legible de un valor guardado. */
export function optionLabel(field: keyof StylePreferences, value: string) {
  for (const step of QuizSteps) {
    for (const question of step.questions) {
      if (question.field !== field) continue;
      const option = question.options.find((o) => o.value === value);
      if (option) return option.label;
    }
  }
  return value;
}
