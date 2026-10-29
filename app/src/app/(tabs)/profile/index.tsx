import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon, Screen, type IconName } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { optionLabel, QuizSteps } from '@/features/onboarding/questions';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth-provider';
import type { StylePreferences } from '@/types/profile';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const theme = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const preferences = profile?.style_preferences ?? {};
  const initial = (profile?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
          <AppText variant="title" color="accentText">
            {initial}
          </AppText>
        </View>
        <View style={styles.identityText}>
          <AppText variant="heading">{profile?.full_name || 'Sin nombre'}</AppText>
          <AppText variant="caption" color="textSecondary">
            {user?.email}
          </AppText>
        </View>
      </View>

      <Card>
        <MenuRow icon="edit" label="Datos personales" onPress={() => router.push('/profile/edit')} />
        <Divider />
        <MenuRow
          icon="sparkles"
          label="Preferencias de estilo"
          onPress={() => router.push('/profile/preferences')}
        />
      </Card>

      <View style={styles.section}>
        <AppText variant="overline" color="accentText">
          Tu perfil de estilo
        </AppText>
        <Card>
          {QuizSteps.flatMap((step) => step.questions).map((question) => (
            <PreferenceRow
              key={question.field}
              title={question.title}
              field={question.field}
              value={preferences[question.field]}
            />
          ))}
        </Card>
      </View>

      <Card>
        <MenuRow icon="palette" label="Mi paleta de color" hint="Disponible próximamente" />
      </Card>

      <Button
        title="Cerrar sesión"
        variant="secondary"
        onPress={handleSignOut}
        loading={signingOut}
      />
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      accessibilityState={{ disabled: !onPress }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon name={icon} color="accentText" />
      <View style={styles.rowText}>
        <AppText variant="bodyMedium">{label}</AppText>
        {hint && (
          <AppText variant="caption" color="textSecondary">
            {hint}
          </AppText>
        )}
      </View>
      {onPress && <Icon name="chevronRight" size={16} color="textSecondary" />}
    </Pressable>
  );
}

function PreferenceRow({
  title,
  field,
  value,
}: {
  title: string;
  field: keyof StylePreferences;
  value: StylePreferences[keyof StylePreferences] | undefined;
}) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <View style={styles.preference}>
      <AppText variant="caption" color="textSecondary">
        {title}
      </AppText>
      <AppText>
        {values.length > 0 ? values.map((v) => optionLabel(field, v)).join(', ') : '—'}
      </AppText>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  identityText: { flex: 1, gap: Spacing.xxs },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
  },
  rowText: { flex: 1 },
  pressed: { opacity: 0.7 },
  divider: { height: StyleSheet.hairlineWidth },
  preference: { gap: Spacing.xxs, paddingVertical: Spacing.xxs },
});
