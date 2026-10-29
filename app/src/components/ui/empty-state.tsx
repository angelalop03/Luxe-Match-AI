import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { AppText } from './text';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, { borderColor: theme.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
        <Icon name={icon} size={28} color="accentText" />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      <AppText color="textSecondary" center>
        {description}
      </AppText>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { alignSelf: 'stretch', marginTop: Spacing.sm },
});
