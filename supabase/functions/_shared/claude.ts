import { Anthropic, betaZodOutputFormat, type z } from './deps.ts';
import { HttpError } from './http.ts';

/** Modelo usado para todos los análisis y generaciones. */
export const ClaudeModel = 'claude-opus-5-5';

type Effort = 'low' | 'medium' | 'high';
type ContentBlock = Anthropic.Beta.BetaContentBlockParam;

type GenerateOptions<T extends z.ZodType> = {
  schema: T;
  system: string;
  content: ContentBlock[];
  /** `low` para clasificar rápido; `medium` cuando hace falta más criterio. */
  effort: Effort;
};

type Generated<T extends z.ZodType> = { result: z.infer<T>; usage: Record<string, unknown> };

let client: InstanceType<typeof Anthropic> | null = null;

function getClient() {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new HttpError('ai_not_configured', 'Falta ANTHROPIC_API_KEY en el servidor.');
  client ??= new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 });
  return client;
}

/**
 * Pide a Claude una respuesta estructurada y la devuelve ya validada con el
 * esquema Zod (structured outputs). Si un clasificador de seguridad rechaza la
 * petición, `fallbacks: "default"` la reintenta en el modelo recomendado.
 */
export async function generateStructured<T extends z.ZodType>({
  schema,
  system,
  content,
  effort,
}: GenerateOptions<T>): Promise<Generated<T>> {
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
      messages: [{ role: 'user', content }],
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
      throw new HttpError('invalid_image', 'No se ha podido procesar la petición.');
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
    throw new HttpError('ai_refused', 'La IA no ha podido completar la petición.');
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
      {
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: options.imageBase64 },
      },
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
