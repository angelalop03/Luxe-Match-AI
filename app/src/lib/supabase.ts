import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env, isSupabaseConfigured } from './env';
import { sessionStorage } from './session-storage';

// Con valores de relleno el cliente se crea igualmente y la app puede mostrar
// la pantalla de "configura Supabase" en lugar de fallar al arrancar.
export const supabase = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseKey || 'missing-key',
  {
    auth: {
      storage: sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      // En web supabase-js lee la sesión del enlace del email automáticamente;
      // en móvil lo hacemos nosotros en `auth-links.ts`.
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);

// En móvil, refrescamos el token solo con la app en primer plano.
if (Platform.OS !== 'web' && isSupabaseConfigured) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
