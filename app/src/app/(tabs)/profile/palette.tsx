import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, EmptyState, Header, Icon, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ContrastLabels, UndertoneLabels } from '@/features/colorimetry/labels';
import { SwatchGrid } from '@/features/colorimetry/swatch-grid';
import { useColorProfile } from '@/features/colorimetry/use-color-profile';
import { useTheme } from '@/hooks/use-theme';

/** Resultado del análisis de colorimetría (RF7, RF2: paleta guardada). */
export default function PaletteScreen() {
  const theme = useTheme();
  const { profile } = useColorProfile();

  if (profile === undefined) {
    return (
      <Screen centered>
        <ActivityIndicator color={theme.accent} />
      </Screen>
    );
  }

  if (!profile?.analyzed_at) {
    return (
      <Screen>
        <Header back overline="Colorimetría" title="Tu paleta" />
        <EmptyState
          icon="palette"
          title="Aún no tienes paleta"
          description="Sube un selfie y la IA analizará tus colores en unos segundos."
          action={<Button title="Subir selfie" onPress={() => router.replace('/profile/selfie')} />}
        />
      </Screen>
    );
  }

  const facts = [
    { label: 'Subtono', value: profile.undertone ? UndertoneLabels[profile.undertone] : '—' },
    { label: 'Contraste', value: profile.contrast ? ContrastLabels[profile.contrast] : '—' },
    { label: 'Metales', value: profile.best_metals.join(', ') || '—' },
  ];

  return (
    <Screen>
      <Header back overline="Tu estación de color" title={profile.season ?? 'Tu paleta'} />

      <View style={styles.facts}>
        {facts.map((fact) => (
          <Card key={fact.label} style={styles.fact}>
            <AppText variant="overline" color="accentText">
              {fact.label}
            </AppText>
            <AppText variant="bodyMedium" style={styles.capitalize}>
              {fact.value}
            </AppText>
          </Card>
        ))}
      </View>

      {profile.summary && <AppText color="textSecondary">{profile.summary}</AppText>}

      <Section title="Tu paleta personal">
        <SwatchGrid swatches={profile.palette} />
      </Section>

      <Section title="Colores estrella" subtitle="Para las prendas que llevas cerca de la cara.">
        <SwatchGrid swatches={profile.recommended_colors} size="lg" />
      </Section>

      <Section title="Colores a evitar" subtitle="Mejor lejos de la cara o en pequeñas dosis.">
        <SwatchGrid swatches={profile.avoid_colors} crossed />
      </Section>

      {profile.tips.length > 0 && (
        <Card>
          <AppText variant="heading">Consejos de estilismo</AppText>
          {profile.tips.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Icon name="sparkles" size={16} color="accentText" />
              <AppText style={styles.tipText}>{tip}</AppText>
            </View>
          ))}
        </Card>
      )}

      <AppText variant="caption" color="textSecondary">
        Análisis orientativo generado con IA a partir de tu selfie. La luz de la foto puede
        influir en el resultado.
      </AppText>
      <Button
        title="Cambiar selfie y repetir análisis"
        variant="secondary"
        onPress={() => router.push('/profile/selfie')}
      />
    </Screen>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="heading">{title}</AppText>
        {subtitle && (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  fact: { flexGrow: 1, flexBasis: 140, padding: Spacing.md, gap: Spacing.xxs },
  capitalize: { textTransform: 'capitalize' },
  section: { gap: Spacing.md },
  sectionHeader: { gap: Spacing.xxs },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  tipText: { flex: 1 },
});
