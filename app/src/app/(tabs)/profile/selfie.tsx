import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ImageSourcePicker } from '@/components/image-source-picker';
import { AppText, Button, Card, Header, Icon, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { confirm, notify } from '@/lib/confirm';
import type { PreparedImage } from '@/lib/images';
import { useAuth } from '@/providers/auth-provider';
import { deleteSelfie, fetchColorProfile, saveSelfie } from '@/services/color-profile-service';
import type { ColorProfile } from '@/types/color-profile';

const Tips = [
  'Luz natural de frente, sin flash',
  'Cara despejada y sin filtros',
  'Fondo neutro (blanco o gris)',
  'Mejor con poco o ningún maquillaje',
];

/** Subida del selfie para el análisis de colorimetría (RF4, RF7). */
export default function SelfieScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<ColorProfile | null | undefined>(undefined);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const urls = useSignedUrls('selfies', [profile?.selfie_path]);
  const currentUrl = profile?.selfie_path ? urls[profile.selfie_path] : undefined;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchColorProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSave() {
    if (!user || !image) return;
    setSaving(true);
    try {
      setProfile(await saveSelfie(user.id, image, profile ?? null));
      setImage(null);
    } catch {
      notify('No se ha podido guardar', 'Inténtalo de nuevo en unos segundos.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!profile) return;
    const confirmed = await confirm({
      title: 'Eliminar selfie',
      message: 'Borraremos la foto de nuestros servidores.',
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteSelfie(profile);
      setProfile({ ...profile, selfie_path: null });
    } catch {
      notify('No se ha podido eliminar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  return (
    <Screen
      footer={
        image ? <Button title="Guardar selfie" onPress={handleSave} loading={saving} /> : undefined
      }>
      <Header back overline="Colorimetría" title="Tu selfie" />
      <AppText color="textSecondary">
        Con una foto de tu cara analizaremos tu subtono de piel, el contraste y tu estación de
        color para crear tu paleta personal.
      </AppText>

      {profile === undefined ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <ImageSourcePicker
          value={image}
          onChange={setImage}
          currentUrl={currentUrl}
          aspect={[1, 1]}
          frontCamera
          placeholder="Hazte un selfie con luz natural"
        />
      )}

      <Card>
        <AppText variant="heading">Para un buen resultado</AppText>
        {Tips.map((tip) => (
          <View key={tip} style={styles.tip}>
            <Icon name="check" size={16} color="accentText" />
            <AppText style={styles.tipText}>{tip}</AppText>
          </View>
        ))}
      </Card>

      {profile?.selfie_path && !image && (
        <Card>
          <AppText variant="heading">Análisis de colorimetría</AppText>
          <AppText color="textSecondary">
            {profile.analyzed_at
              ? `Tu estación: ${profile.season}`
              : 'Selfie guardado. El análisis con IA estará disponible muy pronto.'}
          </AppText>
        </Card>
      )}

      <AppText variant="caption" color="textSecondary">
        Tu selfie es privado: solo tú puedes verlo y puedes eliminarlo cuando quieras.
      </AppText>
      {profile?.selfie_path && !image && (
        <Button title="Eliminar selfie" variant="ghost" onPress={handleDelete} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tipText: { flex: 1 },
});
