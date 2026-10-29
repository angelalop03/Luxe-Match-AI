import { supabase } from '@/lib/supabase';
import type { Profile, StylePreferences } from '@/types/profile';

const ProfileColumns =
  'id, full_name, avatar_url, style_preferences, onboarding_completed_at, created_at, updated_at';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(ProfileColumns)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  changes: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select(ProfileColumns)
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Guarda las respuestas del quiz y marca el onboarding como completado. */
export async function saveStylePreferences(
  userId: string,
  preferences: StylePreferences,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      style_preferences: preferences,
      onboarding_completed_at: new Date().toISOString(),
    })
    .select(ProfileColumns)
    .single();
  if (error) throw error;
  return data as Profile;
}
