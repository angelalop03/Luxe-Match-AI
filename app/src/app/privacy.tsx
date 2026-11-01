import { StyleSheet, View } from 'react-native';

import { AppText, Card, Header, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';

/**
 * Política de privacidad (RGPD). Las tiendas de apps exigen que esté accesible
 * desde la app. Texto base de la demo: revísalo con asesoría legal antes de
 * publicar y completa los datos del responsable.
 */
const Sections: { title: string; body: string }[] = [
  {
    title: 'Qué datos guardamos',
    body: 'Tu email y nombre; tus respuestas del quiz de estilo; las fotos de tus prendas y tu selfie; tus outfits; y datos de uso de la app (pantallas visitadas, outfits generados, clics a tiendas) para mejorar el servicio.',
  },
  {
    title: 'Para qué los usamos',
    body: 'Solo para darte el servicio de estilismo: clasificar tus prendas, analizar tu colorimetría, crear outfits y recomendarte productos. No vendemos tus datos ni los usamos para publicidad de terceros.',
  },
  {
    title: 'Fotos y selfie',
    body: 'Se guardan en un almacenamiento privado al que solo accede tu cuenta. El selfie se usa únicamente para el análisis de color: no se usa para reconocerte ni se comparte. Puedes borrarlo cuando quieras desde tu perfil. Si prefieres no subir ninguna foto, puedes obtener tu paleta con el test de preguntas.',
  },
  {
    title: 'Inteligencia artificial',
    body: 'Para los análisis enviamos la foto o los datos necesarios a nuestro proveedor de IA (Groq o Anthropic, según la configuración del servicio), que los procesa solo para devolver el resultado. Según sus condiciones, ninguno de los dos conserva estas peticiones más allá de lo necesario para el servicio ni las usa para entrenar sus modelos por defecto.',
  },
  {
    title: 'Enlaces a tiendas',
    body: 'Las recomendaciones enlazan a tiendas externas. Al abrir un enlace sales de LuxeMatch y se aplica la política de privacidad de esa tienda.',
  },
  {
    title: 'Tus derechos',
    body: 'Puedes consultar, corregir y eliminar tus datos desde la app. "Eliminar mi cuenta" (en Perfil) borra de forma permanente tu cuenta, tus prendas, fotos, outfits y perfil de color; los datos de uso quedan anonimizados.',
  },
  {
    title: 'Contacto',
    body: 'Para cualquier consulta sobre tus datos, escríbenos a privacidad@luxematch.example.',
  },
];

export default function PrivacyScreen() {
  return (
    <Screen>
      <Header back overline="LuxeMatch AI" title="Política de privacidad" />
      <AppText variant="caption" color="textSecondary">
        Última actualización: noviembre de 2026
      </AppText>
      <View style={styles.list}>
        {Sections.map((section) => (
          <Card key={section.title}>
            <AppText variant="heading">{section.title}</AppText>
            <AppText color="textSecondary">{section.body}</AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
});
