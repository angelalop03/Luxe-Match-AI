import { ComingSoon } from '@/components/coming-soon';

export default function WardrobeScreen() {
  return (
    <ComingSoon
      overline="Armario digital"
      title="Tu armario"
      icon="wardrobe"
      description="Digitaliza tus prendas con una foto y la IA las clasificará por ti."
      features={[
        'Sube fotos de tus prendas',
        'Detección automática de tipo, color, estilo y temporada',
        'Categorías y filtros',
        'Ideas de Restyle para darles una segunda vida',
      ]}
    />
  );
}
