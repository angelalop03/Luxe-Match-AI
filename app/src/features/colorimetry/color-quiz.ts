import type { ColorProfile, ColorSwatch } from '@/types/color-profile';

/**
 * Test de colorimetría sin selfie (RF7): preguntas clásicas de asesoría de
 * imagen que puntúan tres ejes y dan una de las 12 estaciones de color.
 *  - warmth (calidez): negativo = subtono frío, positivo = cálido
 *  - depth (profundidad): negativo = claro, positivo = profundo
 *  - clarity (intensidad): negativo = suave/apagado, positivo = brillante
 */

type Effects = { warmth?: number; depth?: number; clarity?: number };

export type ColorQuizOption = {
  value: string;
  label: string;
  description?: string;
  swatch?: string;
  effects: Effects;
};

export type ColorQuizQuestion = {
  id: string;
  title: string;
  help: string;
  options: ColorQuizOption[];
};

export const ColorQuizQuestions: ColorQuizQuestion[] = [
  {
    id: 'veins',
    title: '¿De qué color ves las venas de tu muñeca?',
    help: 'Míralas con luz natural.',
    options: [
      { value: 'blue', label: 'Azuladas o moradas', effects: { warmth: -2 } },
      { value: 'green', label: 'Verdosas', effects: { warmth: 2 } },
      { value: 'mixed', label: 'De ambos tonos o no lo distingo', effects: {} },
    ],
  },
  {
    id: 'metal',
    title: '¿Qué metal te favorece más?',
    help: 'Piensa en joyas o relojes junto a tu cara o tu muñeca.',
    options: [
      { value: 'silver', label: 'Plata', swatch: '#BFC3C7', effects: { warmth: -1 } },
      { value: 'gold', label: 'Oro', swatch: '#C9A876', effects: { warmth: 1 } },
      { value: 'both', label: 'Los dos por igual', effects: {} },
    ],
  },
  {
    id: 'white',
    title: '¿Qué blanco te queda mejor cerca de la cara?',
    help: 'Una camiseta o una camisa, por ejemplo.',
    options: [
      { value: 'optic', label: 'Blanco puro', swatch: '#FFFFFF', effects: { warmth: -1, clarity: 1 } },
      { value: 'ivory', label: 'Blanco roto o crema', swatch: '#F3EDE2', effects: { warmth: 1 } },
      { value: 'both', label: 'No noto diferencia', effects: {} },
    ],
  },
  {
    id: 'sun',
    title: '¿Cómo reacciona tu piel al sol?',
    help: 'Sin protección, en los primeros días de verano.',
    options: [
      { value: 'burns', label: 'Me quemo y casi no me bronceo', effects: { depth: -2, warmth: -1 } },
      { value: 'burns-tans', label: 'Me quemo y luego me bronceo', effects: { depth: -1 } },
      { value: 'tans', label: 'Me bronceo con facilidad', effects: { depth: 1, warmth: 1 } },
      { value: 'rarely', label: 'Casi nunca me quemo, mi piel es oscura', effects: { depth: 2 } },
    ],
  },
  {
    id: 'hair',
    title: '¿Cuál es tu color de pelo natural?',
    help: 'El de tus raíces, sin tinte.',
    options: [
      { value: 'light-blonde', label: 'Rubio claro', swatch: '#E6CE95', effects: { depth: -2 } },
      { value: 'dark-blonde', label: 'Rubio oscuro o castaño claro', swatch: '#A8865B', effects: { depth: -1 } },
      { value: 'red', label: 'Pelirrojo o cobrizo', swatch: '#A4532B', effects: { warmth: 2 } },
      { value: 'brown', label: 'Castaño', swatch: '#6B4A30', effects: { depth: 1 } },
      { value: 'dark', label: 'Castaño muy oscuro o negro', swatch: '#1F1A17', effects: { depth: 2, clarity: 1 } },
      { value: 'grey', label: 'Gris o canoso', swatch: '#A9A9A9', effects: { warmth: -1, clarity: -1 } },
    ],
  },
  {
    id: 'eyes',
    title: '¿De qué color son tus ojos?',
    help: 'Elige el más parecido.',
    options: [
      { value: 'blue-grey', label: 'Azules o grises', swatch: '#7A9CC0', effects: { warmth: -1, depth: -1 } },
      { value: 'green-hazel', label: 'Verdes o avellana', swatch: '#7F8B52', effects: { warmth: 1 } },
      { value: 'light-brown', label: 'Marrón claro o miel', swatch: '#A06A35', effects: { warmth: 1, depth: 1 } },
      { value: 'dark-brown', label: 'Marrón oscuro o negros', swatch: '#3B2416', effects: { depth: 2, clarity: 1 } },
    ],
  },
  {
    id: 'contrast',
    title: '¿Cuánto contraste hay entre tu piel, tu pelo y tus ojos?',
    help: 'Alto: pelo oscuro y piel clara. Bajo: tonos parecidos entre sí.',
    options: [
      { value: 'high', label: 'Mucho contraste', effects: { clarity: 2 } },
      { value: 'medium', label: 'Contraste medio', effects: {} },
      { value: 'low', label: 'Poco contraste', effects: { clarity: -2 } },
    ],
  },
  {
    id: 'intensity',
    title: '¿Qué colores sientes que te favorecen?',
    help: 'Piensa en los cumplidos que recibes según lo que llevas.',
    options: [
      { value: 'bright', label: 'Vivos e intensos', description: 'Rojo cereza, azul eléctrico, fucsia', effects: { clarity: 2 } },
      { value: 'soft', label: 'Suaves y empolvados', description: 'Rosa palo, gris perla, verde salvia', effects: { clarity: -2 } },
      { value: 'unknown', label: 'No lo sé', effects: {} },
    ],
  },
];

export type ColorQuizAnswers = Record<string, string>;

type Family = 'Primavera' | 'Verano' | 'Otoño' | 'Invierno';

type FamilyPalette = {
  intro: string;
  palette: ColorSwatch[];
  recommended: ColorSwatch[];
  avoid: ColorSwatch[];
  metals: string[];
  tips: string[];
};

const s = (hex: string, name: string): ColorSwatch => ({ hex, name });

const Families: Record<Family, FamilyPalette> = {
  Primavera: {
    intro: 'Tu paleta es la de Primavera: colores cálidos, luminosos y llenos de vida.',
    palette: [
      s('#FF7F50', 'Coral'), s('#FFB38A', 'Melocotón'), s('#F6D776', 'Amarillo mantequilla'),
      s('#8DB600', 'Verde manzana'), s('#30C0B0', 'Turquesa'), s('#5EC6C8', 'Aguamarina'),
      s('#C8A06A', 'Camel claro'), s('#FFF8E7', 'Marfil'), s('#FA8072', 'Salmón'),
      s('#9B7BB8', 'Violeta cálido'), s('#D4A848', 'Dorado'), s('#98D7A5', 'Verde menta'),
    ],
    recommended: [
      s('#FF7F50', 'Coral'), s('#FFB38A', 'Melocotón'), s('#30C0B0', 'Turquesa'),
      s('#FFF8E7', 'Marfil'), s('#8DB600', 'Verde manzana'), s('#F6D776', 'Amarillo mantequilla'),
    ],
    avoid: [
      s('#1A1714', 'Negro'), s('#4A4A4A', 'Gris oscuro'), s('#6B1F2E', 'Burdeos'),
      s('#FFFFFF', 'Blanco óptico'), s('#1A2238', 'Azul marino oscuro'),
    ],
    metals: ['oro', 'oro rosa'],
    tips: [
      'Cambia el negro por camel o azul marino suave en las prendas cerca de la cara.',
      'Los estampados alegres y los tejidos con brillo sutil te favorecen.',
      'Un labial coral o melocotón ilumina al instante.',
    ],
  },
  Verano: {
    intro: 'Tu paleta es la de Verano: colores fríos, suaves y delicados.',
    palette: [
      s('#D9A9B5', 'Rosa empolvado'), s('#B4A7D6', 'Lavanda'), s('#8FB3D9', 'Azul cielo'),
      s('#C9CBD0', 'Gris perla'), s('#A7869B', 'Malva'), s('#6E7F99', 'Azul pizarra'),
      s('#9DB5A8', 'Verde salvia'), s('#B05A7A', 'Frambuesa suave'), s('#F4F4F2', 'Blanco suave'),
      s('#3F4E6B', 'Marino suave'), s('#8E6C8A', 'Ciruela claro'), s('#C76B8F', 'Rosa frambuesa'),
    ],
    recommended: [
      s('#D9A9B5', 'Rosa empolvado'), s('#B4A7D6', 'Lavanda'), s('#8FB3D9', 'Azul cielo'),
      s('#C9CBD0', 'Gris perla'), s('#A7869B', 'Malva'), s('#6E7F99', 'Azul pizarra'),
    ],
    avoid: [
      s('#E07B39', 'Naranja'), s('#E0B341', 'Mostaza'), s('#B98A5A', 'Camel'),
      s('#000000', 'Negro puro'), s('#FFD300', 'Amarillo intenso'),
    ],
    metals: ['plata', 'oro rosa'],
    tips: [
      'Combina tonos de la misma familia (tono sobre tono) para looks elegantes.',
      'Prefiere el gris marengo o el marino suave al negro puro.',
      'Los tejidos fluidos y mates suavizan y favorecen tu paleta.',
    ],
  },
  Otoño: {
    intro: 'Tu paleta es la de Otoño: colores cálidos, profundos y terrosos.',
    palette: [
      s('#B98A5A', 'Camel'), s('#C46A4A', 'Terracota'), s('#6B7340', 'Verde oliva'),
      s('#C9A227', 'Mostaza'), s('#5C3A21', 'Chocolate'), s('#A0522D', 'Óxido'),
      s('#2F5D62', 'Verde petróleo'), s('#F3E5C8', 'Crema'), s('#7B2D26', 'Burdeos cálido'),
      s('#8A8455', 'Caqui'), s('#D2691E', 'Calabaza'), s('#A97142', 'Bronce'),
    ],
    recommended: [
      s('#C46A4A', 'Terracota'), s('#6B7340', 'Verde oliva'), s('#B98A5A', 'Camel'),
      s('#C9A227', 'Mostaza'), s('#2F5D62', 'Verde petróleo'), s('#F3E5C8', 'Crema'),
    ],
    avoid: [
      s('#FFFFFF', 'Blanco óptico'), s('#FF69B4', 'Rosa chicle'), s('#1F51FF', 'Azul eléctrico'),
      s('#A8AEB5', 'Gris frío'), s('#000000', 'Negro puro'),
    ],
    metals: ['oro', 'bronce'],
    tips: [
      'Usa chocolate o verde petróleo en lugar de negro cerca de la cara.',
      'Las texturas naturales (ante, lana, lino) potencian tu paleta.',
      'El oro mate y el bronce realzan tu piel más que la plata.',
    ],
  },
  Invierno: {
    intro: 'Tu paleta es la de Invierno: colores fríos, intensos y con mucho contraste.',
    palette: [
      s('#1A1714', 'Negro'), s('#FFFFFF', 'Blanco óptico'), s('#C8102E', 'Rojo cereza'),
      s('#234EA5', 'Azul real'), s('#009B77', 'Esmeralda'), s('#C2185B', 'Fucsia'),
      s('#1F2A44', 'Azul marino'), s('#3B3F45', 'Gris marengo'), s('#5B2C83', 'Violeta intenso'),
      s('#F4C2D7', 'Rosa helado'), s('#CFE6F5', 'Azul hielo'), s('#6A1B3A', 'Burdeos frío'),
    ],
    recommended: [
      s('#1A1714', 'Negro'), s('#FFFFFF', 'Blanco óptico'), s('#C8102E', 'Rojo cereza'),
      s('#234EA5', 'Azul real'), s('#009B77', 'Esmeralda'), s('#C2185B', 'Fucsia'),
    ],
    avoid: [
      s('#E07B39', 'Naranja'), s('#B98A5A', 'Camel'), s('#C9A227', 'Mostaza'),
      s('#D8C9B0', 'Beige'), s('#8B5A2B', 'Marrón cálido'),
    ],
    metals: ['plata'],
    tips: [
      'Apuesta por el contraste: blanco y negro, o un color intenso con negro.',
      'Los colores helados (rosa o azul hielo) son tu alternativa a los pasteles.',
      'Un labial rojo frío o fucsia es tu mejor aliado.',
    ],
  },
};

const SubtypeNotes: Record<string, string> = {
  'Primavera clara': 'Lo que más destaca en ti es la luminosidad: elige las versiones claras de tu paleta.',
  'Primavera cálida': 'Lo que más destaca en ti es la calidez: los tonos dorados y melocotón son tu fuerte.',
  'Primavera brillante': 'Lo que más destaca en ti es la viveza: te favorecen los colores limpios e intensos.',
  'Verano claro': 'Lo que más destaca en ti es la luminosidad: los pasteles fríos te sientan de maravilla.',
  'Verano frío': 'Lo que más destaca en ti es el subtono frío: azules y rosas fríos son tu base.',
  'Verano suave': 'Lo que más destaca en ti es la suavidad: busca tonos apagados y empolvados.',
  'Otoño suave': 'Lo que más destaca en ti es la suavidad: los tonos tierra apagados te favorecen más que los intensos.',
  'Otoño cálido': 'Lo que más destaca en ti es la calidez: terracota, mostaza y camel son tu firma.',
  'Otoño profundo': 'Lo que más destaca en ti es la profundidad: chocolate, burdeos y verde petróleo te sientan genial.',
  'Invierno profundo': 'Lo que más destaca en ti es la profundidad: los tonos oscuros e intensos son tu terreno.',
  'Invierno frío': 'Lo que más destaca en ti es el subtono frío: azules, fucsias y blanco puro son tu base.',
  'Invierno brillante': 'Lo que más destaca en ti es el contraste: combina colores intensos con blanco y negro.',
};

export type ColorQuizResult = Pick<
  ColorProfile,
  | 'season'
  | 'undertone'
  | 'contrast'
  | 'summary'
  | 'palette'
  | 'recommended_colors'
  | 'avoid_colors'
  | 'best_metals'
  | 'tips'
>;

export function scoreAnswers(answers: ColorQuizAnswers) {
  const totals = { warmth: 0, depth: 0, clarity: 0 };
  for (const question of ColorQuizQuestions) {
    const option = question.options.find((o) => o.value === answers[question.id]);
    if (!option) continue;
    totals.warmth += option.effects.warmth ?? 0;
    totals.depth += option.effects.depth ?? 0;
    totals.clarity += option.effects.clarity ?? 0;
  }
  return totals;
}

/** Familia de color según los tres ejes. */
function familyFor({ warmth, depth, clarity }: ReturnType<typeof scoreAnswers>): Family {
  if (warmth > 0) return clarity - depth >= 0 ? 'Primavera' : 'Otoño';
  if (warmth < 0) return clarity + depth >= 0 ? 'Invierno' : 'Verano';
  // Subtono neutro: deciden la profundidad y la intensidad.
  if (depth > 0) return clarity >= 0 ? 'Invierno' : 'Otoño';
  return clarity >= 0 ? 'Primavera' : 'Verano';
}

/** Dentro de cada familia, el rasgo que más destaca da la estación concreta. */
function seasonFor(family: Family, { warmth, depth, clarity }: ReturnType<typeof scoreAnswers>) {
  const options: Record<Family, [string, number][]> = {
    Primavera: [['Primavera clara', -depth], ['Primavera cálida', warmth], ['Primavera brillante', clarity]],
    Verano: [['Verano claro', -depth], ['Verano frío', -warmth], ['Verano suave', -clarity]],
    Otoño: [['Otoño suave', -clarity], ['Otoño cálido', warmth], ['Otoño profundo', depth]],
    Invierno: [['Invierno profundo', depth], ['Invierno frío', -warmth], ['Invierno brillante', clarity]],
  };
  return options[family].reduce((best, current) => (current[1] > best[1] ? current : best))[0];
}

export function isQuizComplete(answers: ColorQuizAnswers) {
  return ColorQuizQuestions.every((q) => !!answers[q.id]);
}

/** Calcula el perfil de color completo a partir de las respuestas. */
export function computeColorProfile(answers: ColorQuizAnswers): ColorQuizResult {
  const scores = scoreAnswers(answers);
  const family = familyFor(scores);
  const season = seasonFor(family, scores);
  const data = Families[family];

  const contrastAnswer = answers.contrast;
  const contrast: ColorQuizResult['contrast'] =
    contrastAnswer === 'high' ? 'high' : contrastAnswer === 'low' ? 'low' : 'medium';
  const undertone: ColorQuizResult['undertone'] =
    scores.warmth >= 2 ? 'warm' : scores.warmth <= -2 ? 'cool' : 'neutral';

  return {
    season,
    undertone,
    contrast,
    summary: `${data.intro} ${SubtypeNotes[season]}`,
    palette: data.palette,
    recommended_colors: data.recommended,
    avoid_colors: data.avoid,
    best_metals: data.metals,
    tips: data.tips,
  };
}
