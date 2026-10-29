import { Anthropic, betaZodOutputFormat, type z } from './deps.ts';
import { HttpError } from './http.ts';

/** Modelo de visión usado para todos los análisis. */
export const ClaudeModel = 'claude-opus-5-5';

type AnalyzeImageOptions<T extends z.ZodType> = {
  schema: T;
  system: string;
  instruction: string;
  imageBase64: string;
  /** `low` para clasificar rápido; `medium` cuando hace falta más criterio. */
  effort: 'low' | 'medium' | 'high';
};

let client: InstanceType<typeof Anthropic> | null = null;

function getClient() {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new HttpError('ai_not_configured', 'Falta ANTHROPIC_API_KEY en el servidor.');
  client ??= new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 });
  return client;
}

/**
 * Envía una imagen a Claude y devuelve la respuesta ya validada con el
 * esquema Zod (structured outputs). Si un clasificador de seguridad rechaza la
 * petición, `fallbacks: "default"` la reintenta en el modelo recomendado.
 */
export async function analyzeImage<T extends z.ZodType>({
  schema,
  system,
  instruction,
  imageBase64,
  effort,
}: AnalyzeImageOptions<T>): Promise<{ result: z.infer<T>; usage: Record<string, unknown> }> {
  const anthropic = getClient();

  let response;
  try {
    response = await anthropic.beta.messages.parse({
      model: ClaudeModel,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort, format: betaZodOutputFormat(schema) },
      system,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: instruction },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      throw new HttpError('ai_busy', 'El servicio de IA está ocupado.');
    }
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new HttpError('ai_not_configured', 'La clave de la API de Anthropic no es válida.');
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error('[claude] bad request:', error.message);
      throw new HttpError('invalid_image', 'No se ha podido procesar la imagen.');
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new HttpError('ai_busy', 'No hay conexión con el servicio de IA.');
    }
    if (error instanceof Anthropic.AnthropicError && !(error instanceof Anthropic.APIError)) {
      // La respuesta no cumple el esquema Zod (p. ej. un valor fuera de la lista).
      console.error('[claude] invalid structured output:', error.message);
      throw new HttpError('ai_failed', 'La IA ha devuelto una respuesta no válida.');
    }
    throw error;
  }

  if (response.stop_reason === 'refusal') {
    console.warn('[claude] refusal:', response.stop_details?.category);
    throw new HttpError('ai_refused', 'La IA no ha podido analizar esta imagen.');
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    throw new HttpError('ai_failed', 'La respuesta de la IA ha llegado incompleta.');
  }

  return {
    result: response.parsed_output as z.infer<T>,
    usage: {
      model: response.model,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  };
}

/** Devuelve el color hex en mayúsculas si es válido, o `null`. */
export function normalizeHex(hex: string | null | undefined): string | null {
  if (!hex) return null;
  const value = hex.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(value) ? value : null;
}
