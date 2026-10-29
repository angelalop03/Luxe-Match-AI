import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ImageSourcePicker } from '@/components/image-source-picker';
import { AppText, Button, Header, Pill, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { PreparedImage } from '@/lib/images';
import type { Garment, GarmentCategory, GarmentInput, Season } from '@/types/garment';

import {
  Categories,
  GarmentColors,
  OccasionOptions,
  Seasons,
  StyleOptions,
} from './garment-options';

type GarmentFormProps = {
  title: string;
  overline: string;
  initial?: Garment;
  /** URL firmada de la imagen guardada (modo edición). */
  imageUrl?: string;
  submitLabel: string;
  onSubmit: (input: GarmentInput, image: PreparedImage | null) => Promise<void>;
  /** Acciones extra bajo el formulario (p. ej. eliminar). */
  extraActions?: ReactNode;
};

type Errors = Partial<Record<'image' | 'name' | 'category' | 'form', string>>;

export function GarmentForm({
  title,
  overline,
  initial,
  imageUrl,
  submitLabel,
  onSubmit,
  extraActions,
}: GarmentFormProps) {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [name, setName] = useState(initial?.name ?? '');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  const [category, setCategory] = useState<GarmentCategory | null>(initial?.category ?? null);
  const [colorHex, setColorHex] = useState<string | null>(initial?.primary_color_hex ?? null);
  const [styles_, setStyles] = useState<string[]>(initial?.styles ?? []);
  const [occasions, setOccasions] = useState<string[]>(initial?.occasions ?? []);
  const [seasons, setSeasons] = useState<Season[]>(initial?.seasons ?? []);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const next: Errors = {};
    if (!initial && !image) next.image = 'Añade una foto de la prenda.';
    if (!name.trim()) next.name = 'Ponle un nombre, p. ej. "Blazer negro".';
    if (!category) next.category = 'Elige una categoría.';
    setErrors(next);
    if (Object.keys(next).length > 0 || !category) return;

    setSaving(true);
    try {
      const color = GarmentColors.find((c) => c.hex === colorHex);
      await onSubmit(
        {
          name: name.trim(),
          subcategory: subcategory.trim() || null,
          category,
          primary_color_hex: colorHex,
          color_name: color?.name ?? initial?.color_name ?? null,
          styles: styles_,
          occasions,
          seasons,
        },
        image,
      );
    } catch {
      setErrors({ form: 'No hemos podido guardar la prenda. Inténtalo de nuevo.' });
      setSaving(false);
    }
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          {errors.form && (
            <AppText color="danger" center accessibilityLiveRegion="polite">
              {errors.form}
            </AppText>
          )}
          <Button title={submitLabel} onPress={handleSubmit} loading={saving} />
        </View>
      }>
      <Header back overline={overline} title={title} />

      <View style={styles.field}>
        <ImageSourcePicker
          value={image}
          onChange={(picked) => {
            setImage(picked);
            setErrors((e) => ({ ...e, image: undefined }));
          }}
          currentUrl={imageUrl}
          aspect={[3, 4]}
          placeholder="Haz una foto de la prenda sobre un fondo liso"
        />
        {errors.image && (
          <AppText variant="caption" color="danger">
            {errors.image}
          </AppText>
        )}
      </View>

      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Blazer negro de lana"
      />
      <TextField
        label="Tipo (opcional)"
        value={subcategory}
        onChangeText={setSubcategory}
        placeholder="Camisa, vaqueros, botines…"
      />

      <Section title="Categoría" error={errors.category}>
        {Categories.map((c) => (
          <Pill
            key={c.value}
            role="radio"
            label={c.label}
            selected={category === c.value}
            onPress={() => setCategory(c.value)}
          />
        ))}
      </Section>

      <Section title="Color principal">
        {GarmentColors.map((c) => (
          <Pill
            key={c.hex}
            role="radio"
            label={c.name}
            swatch={c.hex}
            selected={colorHex === c.hex}
            onPress={() => setColorHex(colorHex === c.hex ? null : c.hex)}
          />
        ))}
      </Section>

      <Section title="Temporada">
        {Seasons.map((s) => (
          <Pill
            key={s.value}
            label={s.label}
            selected={seasons.includes(s.value)}
            onPress={() => setSeasons(toggle(seasons, s.value))}
          />
        ))}
      </Section>

      <Section title="Ocasión">
        {OccasionOptions.map((o) => (
          <Pill
            key={o.value}
            label={o.label}
            selected={occasions.includes(o.value)}
            onPress={() => setOccasions(toggle(occasions, o.value))}
          />
        ))}
      </Section>

      <Section title="Estilo">
        {StyleOptions.map((o) => (
          <Pill
            key={o.value}
            label={o.label}
            selected={styles_.includes(o.value)}
            onPress={() => setStyles(toggle(styles_, o.value))}
          />
        ))}
      </Section>

      {extraActions}
    </Screen>
  );
}

function Section({ title, error, children }: { title: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.field} accessibilityLabel={title}>
      <AppText variant="heading">{title}</AppText>
      <View style={styles.pills}>{children}</View>
      {error && (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      )}
    </View>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const styles = StyleSheet.create({
  field: { gap: Spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  footer: { gap: Spacing.sm },
});
