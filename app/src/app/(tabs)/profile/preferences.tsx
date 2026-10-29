import { router } from 'expo-router';

import { StyleQuiz } from '@/features/onboarding/style-quiz';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/services/analytics';
import { saveStylePreferences } from '@/services/profile-service';

export default function EditPreferencesScreen() {
  const { user, profile, setProfile } = useAuth();

  return (
    <StyleQuiz
      initialAnswers={profile?.style_preferences}
      submitLabel="Guardar preferencias"
      onCancel={() => router.back()}
      onSubmit={async (answers) => {
        if (!user) return;
        setProfile(await saveStylePreferences(user.id, answers));
        track('style_preferences_updated');
        router.back();
      }}
    />
  );
}
