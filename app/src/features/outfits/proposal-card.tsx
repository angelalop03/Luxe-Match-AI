import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Garment } from '@/types/garment';
import type { OutfitProposal } from '@/types/outfit';

import { OutfitCollage } from './outfit-collage';
import { OutfitPieces } from './outfit-pieces';

export type ProposalStatus = 'idle' | 'saving' | 'saved';

type ProposalCardProps = {
  proposal: OutfitProposal;
  garments: Garment[];
  imageUrls: Record<string, string>;
  status: ProposalStatus;
  error?: string | null;
  onSave: () => void;
  onOpenSaved: () => void;
};

/** Propuesta de outfit generada, con su explicación estilística (RB9). */
export function ProposalCard({
  proposal,
  garments,
  imageUrls,
  status,
  error,
  onSave,
  onOpenSaved,
}: ProposalCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={styles.collage}>
          <OutfitCollage garments={garments} imageUrls={imageUrls} />
        </View>
        <View style={styles.summary}>
          <AppText variant="heading">{proposal.name}</AppText>
          <AppText color="textSecondary">{proposal.explanation}</AppText>
        </View>
      </View>

      <OutfitPieces garments={garments} imageUrls={imageUrls} />

      <Detail icon="palette" text={proposal.color_harmony} />
      <Detail icon="sparkles" text={proposal.styling_tip} />
      {proposal.missing_piece ? (
        <View style={[styles.missing, { backgroundColor: theme.accentSoft }]}>
          <Icon name="bag" size={16} color="accentText" />
          <AppText variant="caption" style={styles.detailText}>
            Le vendría bien: {proposal.missing_piece}
          </AppText>
        </View>
      ) : null}

      {error && (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      {status === 'saved' ? (
        <Button title="Guardado · ver outfit" variant="secondary" onPress={onOpenSaved} />
      ) : (
        <Button title="Guardar outfit" onPress={onSave} loading={status === 'saving'} />
      )}
    </Card>
  );
}

function Detail({ icon, text }: { icon: 'palette' | 'sparkles'; text: string }) {
  if (!text) return null;
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={16} color="accentText" />
      <AppText variant="caption" style={styles.detailText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  top: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  collage: { width: 140 },
  summary: { flex: 1, minWidth: 200, gap: Spacing.xs },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  detailText: { flex: 1 },
  missing: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
});
