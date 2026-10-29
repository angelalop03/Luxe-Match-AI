import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/logo';
import { AppText, Card, Screen } from '@/components/ui';
import { FontFamily, Spacing } from '@/constants/theme';

/** Se muestra en desarrollo si faltan las variables de Supabase. */
export function ConfigMissing({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);

  return (
    <Screen centered>
      <Logo />
      <Card>
        <AppText variant="heading">Falta configurar Supabase</AppText>
        <AppText color="textSecondary">
          Copia <AppText style={styles.code}>app/.env.example</AppText> como{' '}
          <AppText style={styles.code}>app/.env.local</AppText>, rellena la URL y la clave
          pública de tu proyecto y reinicia <AppText style={styles.code}>npx expo start</AppText>.
        </AppText>
        <View style={styles.spacer} />
        <AppText variant="caption" color="textSecondary">
          Las instrucciones completas están en el README del proyecto.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: FontFamily.bodySemiBold },
  spacer: { height: Spacing.xxs },
});
