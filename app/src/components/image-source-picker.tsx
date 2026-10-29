import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/confirm';
import { pickImage, ImagePermissionError, type PreparedImage } from '@/lib/images';

type ImageSourcePickerProps = {
  /** Imagen elegida en esta sesión (aún sin guardar). */
  value: PreparedImage | null;
  onChange: (image: PreparedImage) => void;
  /** URL de la imagen ya guardada, si existe. */
  currentUrl?: string;
  aspect: [number, number];
  frontCamera?: boolean;
  placeholder: string;
};

/**
 * Selector de imagen con vista previa antes de guardar (RF4): permite hacer
 * una foto o elegirla de la galería, y muestra el resultado ya optimizado.
 */
export function ImageSourcePicker({
  value,
  onChange,
  currentUrl,
  aspect,
  frontCamera,
  placeholder,
}: ImageSourcePickerProps) {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const previewUri = value?.uri ?? currentUrl;

  async function handlePick(source: 'camera' | 'library') {
    setBusy(true);
    try {
      const image = await pickImage(source, { aspect, frontCamera });
      if (image) onChange(image);
    } catch (error) {
      notify(
        'No se ha podido cargar la imagen',
        error instanceof ImagePermissionError ? error.message : 'Prueba con otra foto.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.preview,
          { aspectRatio: aspect[0] / aspect[1], backgroundColor: theme.surfaceMuted, borderColor: theme.border },
        ]}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            accessibilityLabel="Vista previa de la imagen"
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="image" size={36} color="textSecondary" />
            <AppText color="textSecondary" center>
              {busy ? 'Procesando imagen…' : placeholder}
            </AppText>
          </View>
        )}
        {value && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <AppText variant="overline" style={{ color: theme.onPrimary }}>
              Sin guardar
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <SourceButton icon="camera" label="Hacer foto" onPress={() => handlePick('camera')} disabled={busy} />
        <SourceButton icon="gallery" label="Galería" onPress={() => handlePick('library')} disabled={busy} />
      </View>
    </View>
  );
}

function SourceButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: 'camera' | 'gallery';
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sourceButton,
        { borderColor: theme.border, backgroundColor: theme.surface },
        (pressed || disabled) && styles.dimmed,
      ]}>
      <Icon name={icon} size={20} color="accentText" />
      <AppText variant="label">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  preview: {
    width: '100%',
    maxHeight: 420,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  sourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  dimmed: { opacity: 0.6 },
});
