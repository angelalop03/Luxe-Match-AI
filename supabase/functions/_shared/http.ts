/** Cabeceras CORS para que la versión web de la app pueda llamar a las funciones. */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Códigos de error que la app sabe traducir a mensajes en español
 * (ver `app/src/services/ai-service.ts`).
 */
export type ErrorCode =
  | 'unauthorized'
  | 'bad_request'
  | 'not_found'
  | 'rate_limited'
  | 'ai_not_configured'
  | 'ai_busy'
  | 'ai_refused'
  | 'ai_failed'
  | 'invalid_image'
  | 'not_enough_garments';

const StatusByCode: Record<ErrorCode, number> = {
  unauthorized: 401,
  bad_request: 400,
  not_found: 404,
  rate_limited: 429,
  ai_not_configured: 503,
  ai_busy: 503,
  ai_refused: 422,
  ai_failed: 502,
  invalid_image: 422,
  not_enough_garments: 422,
};

export class HttpError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Envuelve el handler con CORS, solo POST y respuestas de error uniformes. */
export function serve(handler: (req: Request) => Promise<Response>) {
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'bad_request', message: 'Usa POST.' }, 405);

    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.code, message: error.message }, StatusByCode[error.code]);
      }
      console.error(error);
      return json({ error: 'ai_failed', message: 'Error inesperado.' }, 500);
    }
  });
}
