import { AuthError } from '@supabase/supabase-js';

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
const MessagesByCode: Record<string, string> = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
  user_already_exists: 'Ya existe una cuenta con este email.',
  email_exists: 'Ya existe una cuenta con este email.',
  weak_password: 'La contraseña es demasiado débil. Usa al menos 8 caracteres.',
  same_password: 'La nueva contraseña debe ser distinta de la anterior.',
  over_email_send_rate_limit: 'Has pedido demasiados emails. Espera unos minutos.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  validation_failed: 'Revisa los datos introducidos.',
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError && error.code && MessagesByCode[error.code]) {
    return MessagesByCode[error.code];
  }
  if (error instanceof Error && /fetch|network/i.test(error.message)) {
    return 'No hay conexión con el servidor. Inténtalo de nuevo.';
  }
  return 'Algo ha ido mal. Inténtalo de nuevo.';
}

const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Introduce tu email.';
  if (!EmailPattern.test(email.trim())) return 'El email no es válido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Incluye al menos una letra y un número.';
  }
  return null;
}
