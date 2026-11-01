/**
 * Punto único de acceso a la IA para todas las Edge Functions.
 *
 * Elige proveedor según los secretos configurados (o `AI_PROVIDER`):
 *  - `anthropic`: Claude, con structured outputs garantizados (de pago).
 *  - `groq`: modelo abierto de visión en Groq, con plan gratuito.
 * Si no hay ninguno, lanza `ai_not_configured` y cada función usa su
 * respaldo por reglas cuando lo tiene.
 */
import { generateWithClaude, type Effort, type Generated } from './claude.ts';
import type { z } from './deps.ts';
import { generateWithGroq } from './groq.ts';
import { HttpError } from './http.ts';

type Provider = 'anthropic' | 'groq';

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg'; data: string } };

function pickProvider(): { provider: Provider; apiKey: string } {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
  const groqKey = Deno.env.get('GROQ_API_KEY') ?? '';
  const preferred = Deno.env.get('AI_PROVIDER') as Provider | undefined;

  if (preferred === 'groq' && groqKey) return { provider: 'groq', apiKey: groqKey };
  if (preferred === 'anthropic' && anthropicKey) return { provider: 'anthropic', apiKey: anthropicKey };
  if (anthropicKey) return { provider: 'anthropic', apiKey: anthropicKey };
  if (groqKey) return { provider: 'groq', apiKey: groqKey };
  throw new HttpError('ai_not_configured', 'No hay ninguna clave de IA configurada en el servidor.');
}

/** Pide una respuesta estructurada al proveedor configurado. */
export function generateStructured<T extends z.ZodType>(options: {
  schema: T;
  system: string;
  content: ContentBlock[];
  effort: Effort;
}): Promise<Generated<T>> {
  const { provider, apiKey } = pickProvider();
  return provider === 'groq'
    ? generateWithGroq(apiKey, options)
    : generateWithClaude(options);
}

/** Atajo para analizar una imagen JPEG con una instrucción. */
export function analyzeImage<T extends z.ZodType>(options: {
  schema: T;
  system: string;
  instruction: string;
  imageBase64: string;
  effort: Effort;
}): Promise<Generated<T>> {
  return generateStructured({
    schema: options.schema,
    system: options.system,
    effort: options.effort,
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: options.imageBase64 } },
      { type: 'text', text: options.instruction },
    ],
  });
}

/** Devuelve el color hex en mayúsculas si es válido, o `null`. */
export function normalizeHex(hex: string | null | undefined): string | null {
  if (!hex) return null;
  const value = hex.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(value) ? value : null;
}
