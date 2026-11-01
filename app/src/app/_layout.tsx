// Importamos cada peso por separado para no empaquetar las 29 variantes de
// las familias (RNF2: solo se incluyen las 5 fuentes que usa la app).
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import {
  DarkTheme,
  DefaultTheme,
  router,
  ThemeProvider,
  type ErrorBoundaryProps,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ConfigMissing } from '@/components/config-missing';
import { ScreenTracker } from '@/components/screen-tracker';
import { AppText, Button, Screen } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createSessionFromUrl } from '@/lib/auth-links';
import { isSupabaseConfigured } from '@/lib/env';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

/**
 * Pantalla de error amable si una pantalla falla al renderizar (RNF7): en
 * lugar de una pantalla en blanco, se ofrece reintentar.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
    SplashScreen.hideAsync();
  }, [error]);

  return (
    <Screen centered>
      <AppText variant="title" center>
        Algo no ha ido bien
      </AppText>
      <AppText color="textSecondary" center>
        Ha ocurrido un error inesperado. Tus datos están a salvo.
      </AppText>
      <Button title="Reintentar" onPress={retry} />
    </Screen>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accentText,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {!fontsLoaded ? null : isSupabaseConfigured ? (
        <AuthProvider>
          <AuthLinkHandler />
          <RootNavigator />
        </AuthProvider>
      ) : (
        <ConfigMissing onReady={() => SplashScreen.hideAsync()} />
      )}
    </ThemeProvider>
  );
}

/**
 * Rutas protegidas (RB8): sin sesión solo se ve (auth); con sesión pero sin quiz,
 * el onboarding; con todo completado, la app principal.
 */
function RootNavigator() {
  const { session, initializing, isOnboarded, profileError, refreshProfile, signOut } = useAuth();

  useEffect(() => {
    if (!initializing) SplashScreen.hideAsync();
  }, [initializing]);

  if (initializing) return null;

  if (profileError) {
    return (
      <Screen centered>
        <AppText variant="heading" center>
          {profileError}
        </AppText>
        <Button title="Reintentar" onPress={refreshProfile} />
        <Button title="Cerrar sesión" variant="ghost" onPress={signOut} />
      </Screen>
    );
  }

  // Pantalla de entrada según el estado: si una ruta no está disponible, se va aquí.
  const home = !session ? '/sign-in' : !isOnboarded ? '/onboarding' : '/';

  return (
    <>
      {session && <ScreenTracker />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!session} redirectTo={home}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!session && !isOnboarded} redirectTo={home}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={!!session && isOnboarded} redirectTo={home}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="shop" />
        </Stack.Protected>
        <Stack.Screen name="reset-password" options={{ presentation: 'modal' }} />
        {/* Accesible con y sin sesión: se enlaza desde el registro. */}
        <Stack.Screen name="privacy" />
      </Stack>
    </>
  );
}

/** En móvil, convierte los enlaces de los emails de Supabase en una sesión. */
function AuthLinkHandler() {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (Platform.OS === 'web' || !url) return;
    createSessionFromUrl(url)
      .then((result) => {
        if (result?.type === 'recovery') router.push('/reset-password');
      })
      .catch((error: Error) => console.warn('[auth-link]', error.message));
  }, [url]);

  return null;
}
