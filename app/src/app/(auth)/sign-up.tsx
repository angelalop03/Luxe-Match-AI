import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { AppText, Button, Chip, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { authRedirectUrl } from '@/lib/auth-links';
import { authErrorMessage, validateEmail, validatePassword } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'terms', string>>;

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Dinos cómo te llamas.';
    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (confirm !== password) next.confirm = 'Las contraseñas no coinciden.';
    if (!acceptedTerms) next.terms = 'Necesitamos tu consentimiento para continuar.';
    return next;
  }

  async function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: authRedirectUrl('/'),
      },
    });
    setLoading(false);

    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    track('sign_up');
    // Si el proyecto exige confirmar el email, aún no hay sesión.
    if (!data.session) setPendingConfirmation(true);
  }

  if (pendingConfirmation) {
    return (
      <Screen centered>
        <AuthHeader
          title="Revisa tu email"
          subtitle={`Te hemos enviado un enlace a ${email.trim()} para activar tu cuenta.`}
        />
        <Link href="/sign-in" asChild>
          <Button title="Volver a iniciar sesión" variant="secondary" />
        </Link>
      </Screen>
    );
  }

  return (
    <Screen centered>
      <AuthHeader
        title="Crea tu cuenta"
        subtitle="Descubre los colores y looks que mejor te sientan."
        showBack
      />

      <View style={styles.form}>
        <TextField
          label="Nombre"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          hint="Mínimo 8 caracteres, con letras y números."
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          label="Repite la contraseña"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>

      <View style={styles.consent}>
        <Chip
          label="Acepto la política de privacidad"
          description="Tus fotos y datos de estilo solo los ves tú y puedes borrarlos cuando quieras."
          selected={acceptedTerms}
          onPress={() => setAcceptedTerms((v) => !v)}
        />
        {errors.terms && (
          <AppText variant="caption" color="danger">
            {errors.terms}
          </AppText>
        )}
      </View>

      {formError && (
        <AppText color="danger" center accessibilityLiveRegion="polite">
          {formError}
        </AppText>
      )}

      <Button title="Crear cuenta" onPress={handleSubmit} loading={loading} />

      <View style={styles.footer}>
        <AppText color="textSecondary">¿Ya tienes cuenta?</AppText>
        <Link href="/sign-in">
          <AppText variant="bodyMedium" color="accentText">
            Inicia sesión
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
  consent: { gap: Spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
