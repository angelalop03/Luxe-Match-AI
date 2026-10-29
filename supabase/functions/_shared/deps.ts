// Dependencias de las Edge Functions (Deno), con versión fijada.
export { default as Anthropic } from 'npm:@anthropic-ai/sdk@1.3.0';
export { betaZodOutputFormat } from 'npm:@anthropic-ai/sdk@1.3.0/helpers/beta/zod';
export { z } from 'npm:zod@4.6.7';
export { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2.118.0';
