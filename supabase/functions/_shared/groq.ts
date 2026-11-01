import type { z } from './deps.ts';
import { z as zod } from './deps.ts';
import { HttpError } from './http.ts';

/**
 * Proveedor gratuito: Groq con un modelo abierto de visión. Su API es
 * compatible con OpenAI. No garantiza el esquema como los structured outputs
 * de Claude, así que pedimos JSON y lo validamos con Zod.
 * Groq no conserva las peticiones por defecto (ver README).
 */
export const GroqModel = 'qwen/qwen3.8-27b';
const Endpoint = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * El plan gratuito de Groq limita la salida a 1.000 tokens por minuto y
 * rechaza cualquier petición que pida más. Nuestras respuestas JSON caben de
 * sobra; con un plan de pago se puede subir con GROQ_MAX_OUTPUT_TOKENS.
 */
const MaxOutputTokens = Number(Deno.env.get('GROQ_MAX_OUTPUT_TOKENS')) || 1000;

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

type GenerateOptions<T extends z.ZodType> = {
  schema: T;
  system: string;
  content: ContentBlock[];
  effort: 'low' | 'medium' | 'high';
};

export async function generateWithGroq<T extends z.ZodType>(
  apiKey: string,
  { schema, system, content, effort }: GenerateOptions<T>,
): Promise<{ result: z.infer<T>; usage: Record<string, unknown> }> {
  const jsonSchema = JSON.stringify(zod.toJSONSchema(schema));
  const messages = [
    {
      role: 'system',
      content: `${system}\n\nResponde ÚNICAMENTE con un objeto JSON válido que cumpla este JSON Schema, usando exactamente los valores permitidos en cada "enum":\n${jsonSchema}`,
    },
    {
      role: 'user',
      content: content.map((block) =>
        block.type === 'text'
          ? { type: 'text', text: block.text }
          : {
              type: 'image_url',
              image_url: { url: `data:${block.source.media_type};base64,${block.source.data}` },
            },
      ),
    },
  ];

  let response: Response;
  try {
    response = await fetch(Endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GroqModel,
        messages,
        response_format: { type: 'json_object' },
        // Sin razonamiento: sus tokens cuentan para el límite de salida del plan
        // gratuito y dejarían la respuesta JSON incompleta.
        reasoning_format: 'hidden',
        reasoning_effort: 'default',
        max_completion_tokens: MaxOutputTokens,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new HttpError('ai_busy', 'No hay conexión con el servicio de IA.');
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(`[groq] ${response.status}:`, detail.slice(0, 500));
    if (response.status === 401 || response.status === 403) {
      throw new HttpError('ai_not_configured', 'La clave de Groq no es válida.');
    }
    if (response.status === 429 || response.status >= 500) {
      throw new HttpError('ai_busy', 'El servicio de IA está ocupado.');
    }
    throw new HttpError('invalid_image', 'No se ha podido procesar la petición.');
  }

  const body = await response.json();
  const text: string = body?.choices?.[0]?.message?.content ?? '';
  const finishReason: string | undefined = body?.choices?.[0]?.finish_reason;
  if (finishReason === 'length') {
    console.error('[groq] respuesta cortada por el límite de tokens:', body?.usage);
    throw new HttpError('ai_failed', 'La respuesta de la IA ha llegado incompleta.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('[groq] respuesta sin JSON válido:', text.slice(0, 300));
    throw new HttpError('ai_failed', 'La respuesta de la IA no es válida.');
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    console.error('[groq] el JSON no cumple el esquema:', validated.error.message.slice(0, 500));
    throw new HttpError('ai_failed', 'La IA ha devuelto una respuesta no válida.');
  }

  return {
    result: validated.data as z.infer<T>,
    usage: {
      model: body?.model ?? GroqModel,
      input_tokens: body?.usage?.prompt_tokens,
      output_tokens: body?.usage?.completion_tokens,
    },
  };
}
