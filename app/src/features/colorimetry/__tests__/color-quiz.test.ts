import {
  ColorQuizQuestions,
  computeColorProfile,
  isQuizComplete,
  type ColorQuizAnswers,
} from '@/features/colorimetry/color-quiz';

const coolLightSoft: ColorQuizAnswers = {
  veins: 'blue',
  metal: 'silver',
  white: 'optic',
  sun: 'burns',
  hair: 'light-blonde',
  eyes: 'blue-grey',
  contrast: 'low',
  intensity: 'soft',
};

const warmDeepSoft: ColorQuizAnswers = {
  veins: 'green',
  metal: 'gold',
  white: 'ivory',
  sun: 'tans',
  hair: 'brown',
  eyes: 'light-brown',
  contrast: 'medium',
  intensity: 'soft',
};

const coolDeepBright: ColorQuizAnswers = {
  veins: 'blue',
  metal: 'silver',
  white: 'optic',
  sun: 'rarely',
  hair: 'dark',
  eyes: 'dark-brown',
  contrast: 'high',
  intensity: 'bright',
};

const warmLightBright: ColorQuizAnswers = {
  veins: 'green',
  metal: 'gold',
  white: 'ivory',
  sun: 'burns-tans',
  hair: 'light-blonde',
  eyes: 'green-hazel',
  contrast: 'medium',
  intensity: 'bright',
};

describe('computeColorProfile (test sin selfie)', () => {
  it('perfil frío, claro y suave → Verano', () => {
    const result = computeColorProfile(coolLightSoft);
    expect(result.season).toMatch(/^Verano/);
    expect(result.undertone).toBe('cool');
    expect(result.contrast).toBe('low');
  });

  it('perfil cálido, profundo y suave → Otoño', () => {
    const result = computeColorProfile(warmDeepSoft);
    expect(result.season).toMatch(/^Otoño/);
    expect(result.undertone).toBe('warm');
    expect(result.best_metals).toContain('oro');
  });

  it('perfil frío, profundo y con contraste → Invierno', () => {
    const result = computeColorProfile(coolDeepBright);
    expect(result.season).toMatch(/^Invierno/);
    expect(result.contrast).toBe('high');
  });

  it('perfil cálido, claro y vivo → Primavera', () => {
    expect(computeColorProfile(warmLightBright).season).toMatch(/^Primavera/);
  });

  it('devuelve un perfil completo y con colores válidos', () => {
    for (const answers of [coolLightSoft, warmDeepSoft, coolDeepBright, warmLightBright]) {
      const result = computeColorProfile(answers);
      expect(result.palette).toHaveLength(12);
      expect(result.recommended_colors).toHaveLength(6);
      expect(result.avoid_colors.length).toBeGreaterThanOrEqual(5);
      expect(result.tips.length).toBeGreaterThan(0);
      expect(result.summary).toContain(result.season!.split(' ')[0]);
      for (const swatch of [...result.palette, ...result.recommended_colors, ...result.avoid_colors]) {
        expect(swatch.hex).toMatch(/^#[0-9A-F]{6}$/i);
      }
    }
  });

  it('ningún color recomendado está también entre los que evitar', () => {
    for (const answers of [coolLightSoft, warmDeepSoft, coolDeepBright, warmLightBright]) {
      const result = computeColorProfile(answers);
      const avoid = new Set(result.avoid_colors.map((c) => c.hex.toUpperCase()));
      expect(result.recommended_colors.some((c) => avoid.has(c.hex.toUpperCase()))).toBe(false);
    }
  });
});

describe('isQuizComplete', () => {
  it('exige responder todas las preguntas', () => {
    expect(isQuizComplete(coolLightSoft)).toBe(true);
    const { veins: _omit, ...partial } = coolLightSoft;
    expect(isQuizComplete(partial)).toBe(false);
  });

  it('hay 8 preguntas, todas con al menos dos opciones', () => {
    expect(ColorQuizQuestions).toHaveLength(8);
    expect(ColorQuizQuestions.every((q) => q.options.length >= 2)).toBe(true);
  });
});
