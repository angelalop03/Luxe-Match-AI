import { useState } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { authRedirectUrl } from '@/lib/auth-links';
import { authErrorMessage, validateEmail } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const invalid = validateEmail(email);
    setError(invalid);
    if (invalid) return;

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl('/reset-password'),
    });
    setLoading(false);

    if (resetError) {
      setError(authErrorMessage(resetError));
    } else {
      setSent(true);
    }
  }

  return (
    <Screen centered>
      <AuthHeader
        title="Recupera tu acceso"
        subtitle="Te enviaremos un enlace para crear una nueva contraseña."
        showBack
      />

      {sent ? (
        <Card>
          <AppText variant="heading">Enlace enviado</AppText>
          <AppText color="textSecondary">
            Si existe una cuenta con {email.trim()}, recibirás un email en unos minutos. Abre el
            enlace desde este dispositivo.
          </AppText>
        </Card>
      ) : (
        <>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={error}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            onSubmitEditing={handleSubmit}
          />
          <Button title="Enviar enlace" onPress={handleSubmit} loading={loading} />
        </>
      )}
    </Screen>
  );
}
