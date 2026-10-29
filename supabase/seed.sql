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
