import type { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/services/profile-service';
import type { Profile } from '@/types/profile';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** `true` hasta conocer la sesión y el perfil inicial. */
  initializing: boolean;
  profileError: string | null;
  isOnboarded: boolean;
  setProfile: (profile: Profile) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

/** Perfil cargado, asociado al usuario al que pertenece. */
type ProfileState = { userId: string; profile: Profile | null; error: string | null };

const ProfileLoadError = 'No hemos podido cargar tu perfil.';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!isSupabaseConfigured);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // En web, el enlace del email dispara este evento (en móvil, ver auth-links.ts).
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfile(userId)
      .then((profile) => {
        if (!cancelled) setProfileState({ userId, profile, error: null });
      })
      .catch(() => {
        if (!cancelled) setProfileState({ userId, profile: null, error: ProfileLoadError });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setProfileState({ userId, profile: await fetchProfile(userId), error: null });
    } catch {
      setProfileState((prev) => ({ userId, profile: prev?.profile ?? null, error: ProfileLoadError }));
    }
  }, [userId]);

  const setProfile = useCallback((profile: Profile) => {
    setProfileState({ userId: profile.id, profile, error: null });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    // Ignoramos un perfil que pertenezca a una sesión anterior.
    const current = profileState && profileState.userId === userId ? profileState : null;
    return {
      session,
      user: session?.user ?? null,
      profile: current?.profile ?? null,
      initializing: !sessionLoaded || (!!userId && !current),
      profileError: current?.error ?? null,
      isOnboarded: !!current?.profile?.onboarding_completed_at,
      setProfile,
      refreshProfile,
      signOut,
    };
  }, [session, sessionLoaded, userId, profileState, setProfile, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
