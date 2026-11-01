import { validateEmail, validatePassword } from '@/lib/auth-errors';

describe('validateEmail', () => {
  it('acepta emails válidos', () => {
    expect(validateEmail('ana@example.com')).toBeNull();
    expect(validateEmail('  ana@example.com  ')).toBeNull();
  });

  it('rechaza emails vacíos o mal formados', () => {
    expect(validateEmail('')).toBe('Introduce tu email.');
    expect(validateEmail('ana@')).toBe('El email no es válido.');
    expect(validateEmail('ana example.com')).toBe('El email no es válido.');
  });
});

describe('validatePassword (RNF5)', () => {
  it('exige al menos 8 caracteres', () => {
    expect(validatePassword('abc123')).toMatch(/8 caracteres/);
  });

  it('exige letras y números', () => {
    expect(validatePassword('abcdefgh')).toMatch(/letra y un número/);
    expect(validatePassword('12345678')).toMatch(/letra y un número/);
  });

  it('acepta contraseñas válidas', () => {
    expect(validatePassword('LuxeMatch2026')).toBeNull();
  });
});
