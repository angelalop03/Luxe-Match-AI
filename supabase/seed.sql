-- Cuenta de prueba usada en desarrollo local (créala desde la pantalla de registro;
-- `supabase db reset` la borra): demo@luxematch.test / LuxeDemo2027
--
-- Catálogo de demostración para las recomendaciones ecommerce (RF9).
-- Marcas y enlaces ficticios: sustitúyelos por un feed real o una API de afiliación.
insert into public.products
  (name, brand, category, color_hex, color_name, price, image_url, external_url, styles, occasions, seasons)
values
  ('Blazer de lana entallado', 'Maison Demo', 'outerwear', '#1F2A44', 'Azul marino', 189.00, null,
   'https://example.com/products/blazer-lana', '{clasico,minimalista}', '{oficina,entrevista,cena}', '{otono,invierno,primavera}'),
  ('Camisa de seda', 'Atelier Demo', 'top', '#F3EDE2', 'Marfil', 120.00, null,
   'https://example.com/products/camisa-seda', '{clasico,romantico,minimalista}', '{oficina,cena,boda}', '{primavera,verano,otono}'),
  ('Pantalón palazzo de crepé', 'Maison Demo', 'bottom', '#2B2623', 'Chocolate', 95.00, null,
   'https://example.com/products/palazzo-crepe', '{minimalista,glam}', '{oficina,cena,gala}', '{otono,invierno}'),
  ('Vestido midi satinado', 'Atelier Demo', 'dress', '#6B1F2E', 'Burdeos', 210.00, null,
   'https://example.com/products/vestido-satinado', '{glam,romantico}', '{boda,gala,cena}', '{otono,invierno}'),
  ('Mocasines de piel', 'Calzado Demo', 'shoes', '#3B2A1E', 'Cuero', 140.00, null,
   'https://example.com/products/mocasines-piel', '{clasico,minimalista}', '{oficina,casual,viaje}', '{primavera,otono,invierno}'),
  ('Sandalias de tacón fino', 'Calzado Demo', 'shoes', '#C9A876', 'Champán', 160.00, null,
   'https://example.com/products/sandalias-tacon', '{glam,romantico}', '{boda,gala,fiesta}', '{primavera,verano}'),
  ('Bolso de mano estructurado', 'Piel Demo', 'bag', '#1A1714', 'Negro', 230.00, null,
   'https://example.com/products/bolso-estructurado', '{clasico,minimalista,glam}', '{oficina,cena,gala}', '{primavera,verano,otono,invierno}'),
  ('Pendientes de aro dorados', 'Joyería Demo', 'accessory', '#B08D5B', 'Oro', 65.00, null,
   'https://example.com/products/aros-dorados', '{minimalista,clasico,urbano}', '{casual,oficina,cena}', '{primavera,verano,otono,invierno}'),
  ('Pañuelo de seda estampado', 'Atelier Demo', 'accessory', '#8A9A5B', 'Oliva', 55.00, null,
   'https://example.com/products/panuelo-seda', '{bohemio,clasico}', '{casual,viaje,oficina}', '{primavera,otono}'),
  ('Cinturón de piel fino', 'Piel Demo', 'accessory', '#5A3A22', 'Coñac', 45.00, null,
   'https://example.com/products/cinturon-piel', '{clasico,bohemio,minimalista}', '{casual,oficina}', '{primavera,verano,otono,invierno}');

-- Ampliación del catálogo para cubrir todas las categorías, colores y presupuestos.
insert into public.products
  (name, brand, category, color_hex, color_name, price, image_url, external_url, styles, occasions, seasons)
values
  ('Camiseta de algodón orgánico', 'Basics Demo', 'top', '#FFFFFF', 'Blanco', 29.00, null,
   'https://example.com/products/camiseta-organica', '{minimalista,urbano,deportivo}', '{casual,viaje}', '{primavera,verano}'),
  ('Jersey de cachemir cuello vuelto', 'Maison Demo', 'top', '#1A1714', 'Negro', 245.00, null,
   'https://example.com/products/jersey-cachemir', '{minimalista,clasico}', '{oficina,cena,viaje}', '{otono,invierno}'),
  ('Blusa fluida terracota', 'Atelier Demo', 'top', '#C46A4A', 'Terracota', 69.00, null,
   'https://example.com/products/blusa-terracota', '{romantico,bohemio}', '{casual,cena}', '{primavera,verano,otono}'),
  ('Vaqueros wide leg', 'Denim Demo', 'bottom', '#3F6EA8', 'Azul', 79.00, null,
   'https://example.com/products/vaqueros-wide', '{urbano,minimalista}', '{casual,viaje}', '{primavera,otono,invierno}'),
  ('Falda midi plisada', 'Atelier Demo', 'bottom', '#8A9A5B', 'Salvia', 89.00, null,
   'https://example.com/products/falda-plisada', '{romantico,clasico}', '{oficina,cena,boda}', '{primavera,verano,otono}'),
  ('Pantalón de lino', 'Basics Demo', 'bottom', '#D8C9B0', 'Arena', 49.00, null,
   'https://example.com/products/pantalon-lino', '{minimalista,bohemio}', '{casual,viaje,oficina}', '{primavera,verano}'),
  ('Vestido camisero de lino', 'Basics Demo', 'dress', '#F3EDE2', 'Marfil', 59.00, null,
   'https://example.com/products/vestido-camisero', '{minimalista,bohemio}', '{casual,viaje}', '{primavera,verano}'),
  ('Vestido largo de seda', 'Maison Demo', 'dress', '#1F3A5F', 'Azul noche', 420.00, null,
   'https://example.com/products/vestido-seda-largo', '{glam,clasico}', '{gala,boda}', '{primavera,verano,otono,invierno}'),
  ('Trench clásico', 'Maison Demo', 'outerwear', '#B98A5A', 'Camel', 210.00, null,
   'https://example.com/products/trench', '{clasico,minimalista}', '{oficina,casual,viaje}', '{primavera,otono}'),
  ('Cazadora de cuero', 'Piel Demo', 'outerwear', '#1A1714', 'Negro', 299.00, null,
   'https://example.com/products/cazadora-cuero', '{urbano,vanguardista}', '{casual,fiesta}', '{primavera,otono}'),
  ('Zapatillas de piel blancas', 'Calzado Demo', 'shoes', '#FFFFFF', 'Blanco', 95.00, null,
   'https://example.com/products/zapatillas-piel', '{urbano,minimalista,deportivo}', '{casual,viaje}', '{primavera,verano,otono}'),
  ('Salones de ante', 'Calzado Demo', 'shoes', '#6B1F2E', 'Burdeos', 135.00, null,
   'https://example.com/products/salones-ante', '{clasico,glam}', '{oficina,cena,boda}', '{otono,invierno}'),
  ('Botas altas de piel', 'Calzado Demo', 'shoes', '#6B4A30', 'Chocolate', 260.00, null,
   'https://example.com/products/botas-altas', '{clasico,bohemio}', '{casual,cena,oficina}', '{otono,invierno}'),
  ('Bolso bandolera pequeño', 'Piel Demo', 'bag', '#B98A5A', 'Camel', 120.00, null,
   'https://example.com/products/bandolera', '{clasico,minimalista,urbano}', '{casual,viaje,cena}', '{primavera,verano,otono,invierno}'),
  ('Clutch joya', 'Joyería Demo', 'bag', '#C9A876', 'Dorado', 85.00, null,
   'https://example.com/products/clutch-joya', '{glam}', '{gala,boda,fiesta}', '{primavera,verano,otono,invierno}'),
  ('Collar de perlas', 'Joyería Demo', 'accessory', '#F3EDE2', 'Marfil', 75.00, null,
   'https://example.com/products/collar-perlas', '{clasico,romantico}', '{oficina,cena,boda}', '{primavera,verano,otono,invierno}'),
  ('Bufanda de lana gruesa', 'Basics Demo', 'accessory', '#6B7340', 'Verde oliva', 39.00, null,
   'https://example.com/products/bufanda-lana', '{bohemio,clasico}', '{casual,viaje}', '{otono,invierno}'),
  ('Gafas de sol de pasta', 'Óptica Demo', 'accessory', '#6B4A30', 'Carey', 110.00, null,
   'https://example.com/products/gafas-pasta', '{clasico,urbano}', '{casual,viaje}', '{primavera,verano}');
