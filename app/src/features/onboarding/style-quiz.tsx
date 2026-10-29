import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Chip, Icon, ProgressBar, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { EmptyStylePreferences, type StylePreferences } from '@/types/profile';

import { isQuestionAnswered, QuizSteps, type QuizQuestion } from './questions';

type StyleQuizProps = {
  initialAnswers?: Partial<StylePreferences>;
  submitLabel: string;
  onSubmit: (answers: StylePreferences) => Promise<void>;
  /** Si se pasa, el primer paso muestra un botón para salir (modo edición). */
  onCancel?: () => void;
};

/**
 * Quiz paso a paso (RF3). Se usa en el onboarding y al editar las
 * preferencias de estilo desde el perfil (RF2).
 */
export function StyleQuiz({ initialAnswers, submitLabel, onSubmit, onCancel }: StyleQuizProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StylePreferences>({
    ...EmptyStylePreferences,
    ...initialAnswers,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = QuizSteps[stepIndex];
  const isLast = stepIndex === QuizSteps.length - 1;
  const canContinue = step.questions.every((q) => isQuestionAnswered(q, answers));

  function toggle(question: QuizQuestion, value: string) {
    setAnswers((prev) => {
      if (question.mode === 'single') {
        return { ...prev, [question.field]: value };
      }
      const current = prev[question.field] as string[];
      if (current.includes(value)) {
        return { ...prev, [question.field]: current.filter((v) => v !== value) };
      }
      if (question.max && current.length >= question.max) {
        // Al llegar al máximo, la opción más antigua deja sitio a la nueva.
        return { ...prev, [question.field]: [...current.slice(1), value] };
      }
      return { ...prev, [question.field]: [...current, value] };
    });
  }

  function isSelected(question: QuizQuestion, value: string) {
    const current = answers[question.field];
    return Array.isArray(current) ? current.includes(value) : current === value;
  }

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(answers);
    } catch {
      setError('No hemos podido guardar tus respuestas. Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else onCancel?.();
  }

  const showBack = stepIndex > 0 || !!onCancel;

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
            title={isLast ? submitLabel : 'Continuar'}
            onPress={handleNext}
            disabled={!canContinue}
            loading={saving}
            accessibilityHint={canContinue ? undefined : 'Selecciona al menos una opción'}
          />
        </View>
      }>
      <View style={styles.header}>
        <View style={styles.topRow}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={stepIndex > 0 ? 'Paso anterior' : 'Cancelar'}
              onPress={handleBack}
              hitSlop={12}>
              <Icon name="back" />
            </Pressable>
          ) : (
            <View />
          )}
          <AppText variant="caption" color="textSecondary">
            {stepIndex + 1} de {QuizSteps.length}
          </AppText>
        </View>
        <ProgressBar
          progress={(stepIndex + 1) / QuizSteps.length}
          label={`Paso ${stepIndex + 1} de ${QuizSteps.length}`}
        />
      </View>

      <View style={styles.titleBlock}>
        <AppText variant="overline" color="accentText">
          {step.overline}
        </AppText>
        <AppText variant="title">{step.title}</AppText>
        <AppText color="textSecondary">{step.subtitle}</AppText>
      </View>

      {step.questions.map((question) => (
        <View
          key={question.field}
          style={styles.question}
          accessibilityRole={question.mode === 'single' ? 'radiogroup' : undefined}
          accessibilityLabel={question.label}>
          {step.questions.length > 1 && <AppText variant="heading">{question.title}</AppText>}
          <View style={styles.options}>
            {question.options.map((option) => (
              <View key={option.value} style={styles.option}>
                <Chip
                  label={option.label}
                  description={option.description}
                  swatch={option.swatch}
                  role={question.mode === 'single' ? 'radio' : 'checkbox'}
                  selected={isSelected(question, option.value)}
                  onPress={() => toggle(question, option.value)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  titleBlock: { gap: Spacing.xs },
  question: { gap: Spacing.sm },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xxs,
  },
  option: {
    flexBasis: '50%',
    flexGrow: 1,
    minWidth: 220,
    padding: Spacing.xxs,
  },
  footer: { gap: Spacing.sm },
});
