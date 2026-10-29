import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { updateProfile } from '@/services/profile-service';

export default function EditProfileScreen() {
  const { user, profile, setProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    if (!fullName.trim()) {
      setError('Dinos cómo te llamas.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      setProfile(await updateProfile(user.id, { full_name: fullName.trim() }));
      router.back();
    } catch {
      setError('No hemos podido guardar los cambios.');
      setSaving(false);
    }
  }

  return (
    <Screen
      footer={<Button title="Guardar cambios" onPress={handleSave} loading={saving} />}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          hitSlop={12}>
          <Icon name="back" />
        </Pressable>
        <AppText variant="title">Datos personales</AppText>
      </View>

      <TextField
        label="Nombre"
        value={fullName}
        onChangeText={setFullName}
        error={error}
        autoComplete="name"
        textContentType="name"
      />
      <TextField
        label="Email"
        value={user?.email ?? ''}
        editable={false}
        hint="Para cambiar tu email, escríbenos a soporte."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.md },
});
