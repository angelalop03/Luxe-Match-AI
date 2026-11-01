import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openStoreSearch, type ShopContext } from '@/services/product-service';
import type { Recommendation } from '@/types/product';

import { searchTermFor, Stores } from './stores';

type StorePickerProps = {
  recommendation: Recommendation | null;
  context: ShopContext;
  onClose: () => void;
};

/** Hoja inferior para elegir en qué tienda real buscar una idea. */
export function StorePicker({ recommendation, context, onClose }: StorePickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const product = recommendation?.product;
  const term = product ? searchTermFor(product) : '';

  return (
    <Modal visible={!!product} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.surface, borderColor: theme.border, paddingBottom: insets.bottom + Spacing.md },
        ]}
        accessibilityViewIsModal>
        <View style={styles.content}>
          <AppText variant="overline" color="accentText">
            Buscar en tiendas
          </AppText>
          <AppText variant="heading">«{term}»</AppText>
          <AppText variant="caption" color="textSecondary">
            Se abrirá la web de la tienda con resultados reales. Los precios y la disponibilidad son
            los de cada tienda.
          </AppText>

          <View style={styles.list}>
            {Stores.map((store) => (
              <Pressable
                key={store.id}
                accessibilityRole="link"
                accessibilityLabel={`Buscar en ${store.name}`}
                onPress={() => {
                  if (product) openStoreSearch(product, store, term, context);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.store,
                  { borderColor: theme.border },
                  pressed && styles.pressed,
                ]}>
                <AppText variant="bodyMedium" style={styles.storeName}>
                  {store.name}
                </AppText>
                <Icon name="chevronRight" size={16} color="textSecondary" />
              </Pressable>
            ))}
          </View>

          <Button title="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  content: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.sm },
  list: { gap: Spacing.xs, marginTop: Spacing.xs },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  storeName: { flex: 1 },
  pressed: { opacity: 0.75 },
});
