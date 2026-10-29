import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { AppText, Button, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { authErrorMessage, validateEmail } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const invalidEmail = validateEmail(email);
    setEmailError(invalidEmail);
    setFormError(null);
    if (invalidEmail) return;
    if (!password) {
      setFormError('Introduce tu contraseña.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setFormError(authErrorMessage(error));
    } else {
      track('sign_in');
      // La navegación la resuelven las rutas protegidas del layout raíz.
    }
  }

  return (
    <Screen centered>
      <AuthHeader title="Hola de nuevo" subtitle="Tu estilista personal te espera." />

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="tu@email.com"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureToggle
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
        />
        <Link href="/forgot-password" style={styles.forgot}>
          <AppText variant="label" color="accentText">
            ¿Has olvidado tu contraseña?
          </AppText>
        </Link>
      </View>

      {formError && (
        <AppText color="danger" center accessibilityLiveRegion="polite">
          {formError}
        </AppText>
      )}

      <Button title="Iniciar sesión" onPress={handleSubmit} loading={loading} />

      <View style={styles.footer}>
        <AppText color="textSecondary">¿Aún no tienes cuenta?</AppText>
        <Link href="/sign-up">
          <AppText variant="bodyMedium" color="accentText">
            Crear cuenta
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
  forgot: { alignSelf: 'flex-end' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
