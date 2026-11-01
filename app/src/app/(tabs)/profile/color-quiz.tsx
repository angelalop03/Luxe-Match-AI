import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Chip, Icon, ProgressBar, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  ColorQuizQuestions,
  computeColorProfile,
  type ColorQuizAnswers,
} from '@/features/colorimetry/color-quiz';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/services/analytics';
import { saveQuizProfile } from '@/services/color-profile-service';

/**
 * Test de colorimetría sin selfie (RF7): para quien prefiere no subir una
 * foto o cuando la IA no está disponible. Una pregunta por pantalla.
 */
export default function ColorQuizScreen() {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ColorQuizAnswers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = ColorQuizQuestions.length;
  const question = ColorQuizQuestions[index];
  const isLast = index === total - 1;
  const answered = !!answers[question.id];

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const result = computeColorProfile(answers);
      await saveQuizProfile(user.id, result);
      track('color_quiz_completed', { season: result.season });
      router.replace('/profile/palette');
    } catch {
      setError('No hemos podido guardar tu resultado. Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  function handleBack() {
    if (index > 0) setIndex((i) => i - 1);
    else router.back();
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          {error && (
            <AppText color="danger" center accessibilityLiveRegion="polite">
              {error}
            </AppText>
          )}
          <Button
            title={isLast ? 'Ver mi paleta' : 'Continuar'}
            onPress={handleNext}
            disabled={!answered}
            loading={saving}
            accessibilityHint={answered ? undefined : 'Elige una respuesta'}
          />
        </View>
      }>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={index > 0 ? 'Pregunta anterior' : 'Salir del test'}
            onPress={handleBack}
            hitSlop={12}>
            <Icon name="back" />
          </Pressable>
          <AppText variant="caption" color="textSecondary">
            {index + 1} de {total}
          </AppText>
        </View>
        <ProgressBar progress={(index + 1) / total} label={`Pregunta ${index + 1} de ${total}`} />
      </View>

      <View style={styles.titleBlock}>
        <AppText variant="overline" color="accentText">
          Test de colorimetría
        </AppText>
        <AppText variant="title">{question.title}</AppText>
        <AppText color="textSecondary">{question.help}</AppText>
      </View>

      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={question.title}>
        {question.options.map((option) => (
          <Chip
            key={option.value}
            role="radio"
            label={option.label}
            description={option.description}
            swatch={option.swatch}
            selected={answers[question.id] === option.value}
            onPress={() => setAnswers((a) => ({ ...a, [question.id]: option.value }))}
          />
        ))}
      </View>

      {index === 0 && (
        <AppText variant="caption" color="textSecondary">
          No necesitas foto: con tus respuestas calculamos tu estación de color. Para un resultado
          más preciso, puedes hacer también el análisis con selfie.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28 },
  titleBlock: { gap: Spacing.xs },
  options: { gap: Spacing.sm },
  footer: { gap: Spacing.sm },
});
