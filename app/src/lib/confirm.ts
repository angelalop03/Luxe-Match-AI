import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
};

/** Diálogo de confirmación que funciona igual en iOS, Android y web. */
export function confirm({ title, message, confirmLabel, destructive }: ConfirmOptions) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

/** Aviso simple con un único botón. */
export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
