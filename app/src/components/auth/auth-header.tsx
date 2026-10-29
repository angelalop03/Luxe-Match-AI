import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/logo';
import { AppText, Icon } from '@/components/ui';
import { Spacing } from '@/constants/theme';

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function AuthHeader({ title, subtitle, showBack }: AuthHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {showBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
          hitSlop={12}
          style={styles.back}>
          <Icon name="back" />
        </Pressable>
      )}
      <Logo />
      <View style={styles.text}>
        <AppText variant="title" center>
          {title}
        </AppText>
        {subtitle && (
          <AppText color="textSecondary" center>
            {subtitle}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xl, marginBottom: Spacing.xs },
  back: { alignSelf: 'flex-start', padding: Spacing.xxs },
  text: { gap: Spacing.xs },
});
