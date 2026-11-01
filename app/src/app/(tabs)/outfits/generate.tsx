import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Header, Pill, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { currentSeason, OccasionOptions, Seasons } from '@/features/outfits/outfit-options';
import { ProposalCard, type ProposalStatus } from '@/features/outfits/proposal-card';
import { useGarments } from '@/features/wardrobe/use-garments';
import { useSignedUrls } from '@/hooks/use-signed-urls';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth-provider';
import { AiError, generateOutfits } from '@/services/ai-service';
import { OutfitError, saveProposal } from '@/services/outfit-service';
import type { Garment, Season } from '@/types/garment';
import type { OutfitProposal, OutfitSource } from '@/types/outfit';

type Result = {
  source: OutfitSource;
  occasion: string;
  season: Season;
  proposals: OutfitProposal[];
};

type SaveState = { status: ProposalStatus; error?: string | null; outfitId?: string };

/** Generación de outfits por ocasión y temporada (RF8, RB3, RB4). */
export default function GenerateOutfitsScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const { garments } = useGarments();

  const userEvents = useMemo(() => profile?.style_preferences.events ?? [], [profile]);
  const [occasion, setOccasion] = useState(userEvents[0] ?? 'casual');
  const [season, setSeason] = useState<Season>(currentSeason());
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({});

  // Primero las ocasiones que la persona marcó en el quiz.
  const occasions = useMemo(
    () => [
      ...OccasionOptions.filter((o) => userEvents.includes(o.value)),
      ...OccasionOptions.filter((o) => !userEvents.includes(o.value)),
    ],
    [userEvents],
  );

  const garmentById = useMemo(() => new Map((garments ?? []).map((g) => [g.id, g])), [garments]);
  const proposalGarments = (proposal: OutfitProposal) =>
    proposal.garment_ids.map((id) => garmentById.get(id)).filter((g): g is Garment => !!g);
  const imageUrls = useSignedUrls(
    'garments',
    (result?.proposals ?? []).flatMap((p) => proposalGarments(p).map((g) => g.image_path)),
  );

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResult(null);
    setSaveStates({});
    try {
      const response = await generateOutfits({ occasion, season, notes: notes.trim() || undefined });
      setResult({ source: response.source, occasion, season, proposals: response.outfits });
    } catch (e) {
      setError(
        e instanceof AiError
          ? { message: e.message, code: e.code }
          : { message: 'No hemos podido crear los looks.' },
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(index: number, proposal: OutfitProposal) {
    if (!result) return;
    setSaveStates((s) => ({ ...s, [index]: { status: 'saving' } }));
    try {
      const outfitId = await saveProposal(proposal, {
        occasion: result.occasion,
        season: result.season,
        source: result.source,
      });
      setSaveStates((s) => ({ ...s, [index]: { status: 'saved', outfitId } }));
    } catch (e) {
      setSaveStates((s) => ({
        ...s,
        [index]: {
          status: 'idle',
          error: e instanceof OutfitError ? e.message : 'No hemos podido guardarlo.',
        },
      }));
    }
  }

  return (
    <Screen>
      <Header back overline="Estilismo IA" title="Crear looks" />

      <View style={styles.field}>
        <AppText variant="heading">¿Para qué ocasión?</AppText>
        <View style={styles.pills}>
          {occasions.map((o) => (
            <Pill
              key={o.value}
              role="radio"
              label={o.label}
              selected={occasion === o.value}
              onPress={() => setOccasion(o.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <AppText variant="heading">Temporada</AppText>
        <View style={styles.pills}>
          {Seasons.map((s) => (
            <Pill
              key={s.value}
              role="radio"
              label={s.label}
              selected={season === s.value}
              onPress={() => setSeason(s.value)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="¿Algo más? (opcional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Algo cómodo, con tacón bajo, en tonos neutros…"
        maxLength={200}
      />

      <Button title={result ? 'Generar otros looks' : 'Generar looks'} onPress={handleGenerate} loading={generating} />

      {generating && (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={theme.accent} />
          <AppText color="textSecondary" center>
            Combinando las prendas de tu armario…
          </AppText>
        </View>
      )}

      {error && (
        <Card>
          <AppText color="danger" accessibilityLiveRegion="polite">
            {error.message}
          </AppText>
          {error.code === 'not_enough_garments' && (
            <Button title="Ir a mi armario" variant="ghost" onPress={() => router.navigate('/wardrobe')} />
          )}
        </Card>
      )}

      {result && (
        <View style={styles.results}>
          <AppText variant="caption" color="textSecondary">
            {result.source === 'ai'
              ? `${result.proposals.length} propuestas creadas con IA solo con prendas de tu armario.`
              : `${result.proposals.length} propuestas automáticas con prendas de tu armario (la IA no está disponible ahora mismo).`}
          </AppText>
          {result.proposals.map((proposal, index) => {
            const state = saveStates[index] ?? { status: 'idle' };
            return (
              <ProposalCard
                key={proposal.garment_ids.join('|')}
                proposal={proposal}
                garments={proposalGarments(proposal)}
                imageUrls={imageUrls}
                status={state.status}
                error={state.error}
                onSave={() => handleSave(index, proposal)}
                onOpenSaved={() =>
                  state.outfitId &&
                  router.push({ pathname: '/outfits/[id]', params: { id: state.outfitId } })
                }
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  loading: { gap: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.lg },
  results: { gap: Spacing.lg },
});
