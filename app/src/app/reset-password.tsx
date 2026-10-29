import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { authErrorMessage, validatePassword } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/**
 * Se abre desde el enlace del email de recuperación. El enlace inicia una
 * sesión temporal, con la que el usuario puede fijar una contraseña nueva.
 */
export default function ResetPasswordScreen() {
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    const invalid = validatePassword(password) ?? (confirm !== password ? 'Las contraseñas no coinciden.' : null);
    setError(invalid);
    if (invalid) return;

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) setError(authErrorMessage(updateError));
    else setDone(true);
  }

  if (!session) {
    return (
      <Screen centered>
        <AuthHeader
          title="Enlace no válido"
          subtitle="El enlace ha caducado o ya se ha usado. Pide uno nuevo."
        />
        <Button title="Pedir otro enlace" onPress={() => router.replace('/forgot-password')} />
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen centered>
        <AuthHeader title="Contraseña actualizada" />
        <Button title="Continuar" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen centered>
      <AuthHeader title="Nueva contraseña" subtitle="Elige una contraseña que no uses en otro sitio." />
      <View style={styles.form}>
        <TextField
          label="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          hint="Mínimo 8 caracteres, con letras y números."
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          label="Repite la contraseña"
          value={confirm}
          onChangeText={setConfirm}
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>
      {error && (
        <Card>
          <AppText color="danger" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        </Card>
      )}
      <Button title="Guardar contraseña" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
});
