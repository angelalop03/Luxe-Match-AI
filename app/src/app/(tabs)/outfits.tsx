import { ComingSoon } from '@/components/coming-soon';

export default function OutfitsScreen() {
  return (
    <ComingSoon
      overline="Estilismo IA"
      title="Tus outfits"
      icon="sparkles"
      description="Looks creados con tus propias prendas, pensados para cada ocasión."
      features={[
        'Varias propuestas por evento y temporada',
        'Explicación estilística de cada look',
        'Guarda y edita tus favoritos',
        'Accesorios y compras que complementan, sin duplicar',
      ]}
    />
  );
}
