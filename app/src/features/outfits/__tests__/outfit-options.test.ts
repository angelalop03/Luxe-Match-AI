import { currentSeason, occasionLabel } from '@/features/outfits/outfit-options';

describe('currentSeason', () => {
  it.each([
    ['2026-03-15', 'primavera'],
    ['2026-07-01', 'verano'],
    ['2026-11-01', 'otono'],
    ['2026-01-20', 'invierno'],
    ['2026-12-31', 'invierno'],
  ])('%s → %s', (date, season) => {
    expect(currentSeason(new Date(`${date}T12:00:00`))).toBe(season);
  });
});

describe('occasionLabel', () => {
  it('traduce el valor guardado a texto', () => {
    expect(occasionLabel('boda')).toBe('Bodas y ceremonias');
  });

  it('devuelve null si no hay ocasión', () => {
    expect(occasionLabel(null)).toBeNull();
  });
});
