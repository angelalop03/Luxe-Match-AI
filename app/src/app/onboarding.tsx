import { StyleQuiz } from '@/features/onboarding/style-quiz';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/services/analytics';
import { saveStylePreferences } from '@/services/profile-service';

export default function OnboardingScreen() {
  const { user, profile, setProfile } = useAuth();

  return (
    <StyleQuiz
      initialAnswers={profile?.style_preferences}
      submitLabel="Ver mi espacio"
      onSubmit={async (answers) => {
        if (!user) return;
        const updated = await saveStylePreferences(user.id, answers);
        track('onboarding_completed', { styles: answers.styles, events: answers.events });
        // Al quedar completado, las rutas protegidas llevan a la app principal.
        setProfile(updated);
      }}
    />
  );
}
