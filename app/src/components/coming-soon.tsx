import { StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, Screen, type IconName } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ComingSoonProps = {
  overline: string;
  title: string;
  description: string;
  icon: IconName;
  features: string[];
};

/** Marcador para las secciones de las siguientes fases del roadmap. */
export function ComingSoon({ overline, title, description, icon, features }: ComingSoonProps) {
  const theme = useTheme();

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <AppText variant="overline" color="accentText">
          {overline}
        </AppText>
        <AppText variant="title">{title}</AppText>
      </View>
      <Card style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
          <Icon name={icon} size={28} color="accentText" />
        </View>
        <AppText variant="heading" center>
          Muy pronto
        </AppText>
        <AppText color="textSecondary" center>
          {description}
        </AppText>
        <View style={styles.list}>
          {features.map((feature) => (
            <View key={feature} style={styles.item}>
              <Icon name="check" size={16} color="accentText" />
              <AppText style={styles.itemText}>{feature}</AppText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.xs },
  card: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { alignSelf: 'stretch', gap: Spacing.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemText: { flex: 1 },
});
