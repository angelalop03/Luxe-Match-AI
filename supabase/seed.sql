-- Cuenta de prueba usada en desarrollo local (créala desde la pantalla de registro;
-- `supabase db reset` la borra): demo@luxematch.test / LuxeDemo2027
--
-- Catálogo de demostración para las recomendaciones ecommerce (RF9).
-- Marcas ficticias. Los enlaces abren una búsqueda de productos similares en Google Shopping;
-- en producción se sustituyen por un feed real o una API de afiliación.
insert into public.products
  (name, brand, category, color_hex, color_name, price, image_url, external_url, styles, occasions, seasons)
values
  ('Blazer de lana entallado', 'Maison Demo', 'outerwear', '#1F2A44', 'Azul marino', 189.00, null,
   'https://www.google.com/search?tbm=shop&q=blazer+de+lana+entallado+azul+marino', '{clasico,minimalista}', '{oficina,entrevista,cena}', '{otono,invierno,primavera}'),
  ('Camisa de seda', 'Atelier Demo', 'top', '#F3EDE2', 'Marfil', 120.00, null,
   'https://www.google.com/search?tbm=shop&q=camisa+de+seda+marfil', '{clasico,romantico,minimalista}', '{oficina,cena,boda}', '{primavera,verano,otono}'),
  ('Pantalón palazzo de crepé', 'Maison Demo', 'bottom', '#2B2623', 'Chocolate', 95.00, null,
   'https://www.google.com/search?tbm=shop&q=pantal%C3%B3n+palazzo+de+crep%C3%A9+chocolate', '{minimalista,glam}', '{oficina,cena,gala}', '{otono,invierno}'),
  ('Vestido midi satinado', 'Atelier Demo', 'dress', '#6B1F2E', 'Burdeos', 210.00, null,
   'https://www.google.com/search?tbm=shop&q=vestido+midi+satinado+burdeos', '{glam,romantico}', '{boda,gala,cena}', '{otono,invierno}'),
  ('Mocasines de piel', 'Calzado Demo', 'shoes', '#3B2A1E', 'Cuero', 140.00, null,
   'https://www.google.com/search?tbm=shop&q=mocasines+de+piel+cuero', '{clasico,minimalista}', '{oficina,casual,viaje}', '{primavera,otono,invierno}'),
  ('Sandalias de tacón fino', 'Calzado Demo', 'shoes', '#C9A876', 'Champán', 160.00, null,
   'https://www.google.com/search?tbm=shop&q=sandalias+de+tac%C3%B3n+fino+champ%C3%A1n', '{glam,romantico}', '{boda,gala,fiesta}', '{primavera,verano}'),
  ('Bolso de mano estructurado', 'Piel Demo', 'bag', '#1A1714', 'Negro', 230.00, null,
   'https://www.google.com/search?tbm=shop&q=bolso+de+mano+estructurado+negro', '{clasico,minimalista,glam}', '{oficina,cena,gala}', '{primavera,verano,otono,invierno}'),
  ('Pendientes de aro dorados', 'Joyería Demo', 'accessory', '#B08D5B', 'Oro', 65.00, null,
   'https://www.google.com/search?tbm=shop&q=pendientes+de+aro+dorados+oro', '{minimalista,clasico,urbano}', '{casual,oficina,cena}', '{primavera,verano,otono,invierno}'),
  ('Pañuelo de seda estampado', 'Atelier Demo', 'accessory', '#8A9A5B', 'Oliva', 55.00, null,
   'https://www.google.com/search?tbm=shop&q=pa%C3%B1uelo+de+seda+estampado+oliva', '{bohemio,clasico}', '{casual,viaje,oficina}', '{primavera,otono}'),
  ('Cinturón de piel fino', 'Piel Demo', 'accessory', '#5A3A22', 'Coñac', 45.00, null,
   'https://www.google.com/search?tbm=shop&q=cintur%C3%B3n+de+piel+fino+co%C3%B1ac', '{clasico,bohemio,minimalista}', '{casual,oficina}', '{primavera,verano,otono,invierno}');

-- Ampliación del catálogo para cubrir todas las categorías, colores y presupuestos.
insert into public.products
  (name, brand, category, color_hex, color_name, price, image_url, external_url, styles, occasions, seasons)
values
  ('Camiseta de algodón orgánico', 'Basics Demo', 'top', '#FFFFFF', 'Blanco', 29.00, null,
   'https://www.google.com/search?tbm=shop&q=camiseta+de+algod%C3%B3n+org%C3%A1nico+blanco', '{minimalista,urbano,deportivo}', '{casual,viaje}', '{primavera,verano}'),
  ('Jersey de cachemir cuello vuelto', 'Maison Demo', 'top', '#1A1714', 'Negro', 245.00, null,
   'https://www.google.com/search?tbm=shop&q=jersey+de+cachemir+cuello+vuelto+negro', '{minimalista,clasico}', '{oficina,cena,viaje}', '{otono,invierno}'),
  ('Blusa fluida terracota', 'Atelier Demo', 'top', '#C46A4A', 'Terracota', 69.00, null,
   'https://www.google.com/search?tbm=shop&q=blusa+fluida+terracota+terracota', '{romantico,bohemio}', '{casual,cena}', '{primavera,verano,otono}'),
  ('Vaqueros wide leg', 'Denim Demo', 'bottom', '#3F6EA8', 'Azul', 79.00, null,
   'https://www.google.com/search?tbm=shop&q=vaqueros+wide+leg+azul', '{urbano,minimalista}', '{casual,viaje}', '{primavera,otono,invierno}'),
  ('Falda midi plisada', 'Atelier Demo', 'bottom', '#8A9A5B', 'Salvia', 89.00, null,
   'https://www.google.com/search?tbm=shop&q=falda+midi+plisada+salvia', '{romantico,clasico}', '{oficina,cena,boda}', '{primavera,verano,otono}'),
  ('Pantalón de lino', 'Basics Demo', 'bottom', '#D8C9B0', 'Arena', 49.00, null,
   'https://www.google.com/search?tbm=shop&q=pantal%C3%B3n+de+lino+arena', '{minimalista,bohemio}', '{casual,viaje,oficina}', '{primavera,verano}'),
  ('Vestido camisero de lino', 'Basics Demo', 'dress', '#F3EDE2', 'Marfil', 59.00, null,
   'https://www.google.com/search?tbm=shop&q=vestido+camisero+de+lino+marfil', '{minimalista,bohemio}', '{casual,viaje}', '{primavera,verano}'),
  ('Vestido largo de seda', 'Maison Demo', 'dress', '#1F3A5F', 'Azul noche', 420.00, null,
   'https://www.google.com/search?tbm=shop&q=vestido+largo+de+seda+azul+noche', '{glam,clasico}', '{gala,boda}', '{primavera,verano,otono,invierno}'),
  ('Trench clásico', 'Maison Demo', 'outerwear', '#B98A5A', 'Camel', 210.00, null,
   'https://www.google.com/search?tbm=shop&q=trench+cl%C3%A1sico+camel', '{clasico,minimalista}', '{oficina,casual,viaje}', '{primavera,otono}'),
  ('Cazadora de cuero', 'Piel Demo', 'outerwear', '#1A1714', 'Negro', 299.00, null,
   'https://www.google.com/search?tbm=shop&q=cazadora+de+cuero+negro', '{urbano,vanguardista}', '{casual,fiesta}', '{primavera,otono}'),
  ('Zapatillas de piel blancas', 'Calzado Demo', 'shoes', '#FFFFFF', 'Blanco', 95.00, null,
   'https://www.google.com/search?tbm=shop&q=zapatillas+de+piel+blancas+blanco', '{urbano,minimalista,deportivo}', '{casual,viaje}', '{primavera,verano,otono}'),
  ('Salones de ante', 'Calzado Demo', 'shoes', '#6B1F2E', 'Burdeos', 135.00, null,
   'https://www.google.com/search?tbm=shop&q=salones+de+ante+burdeos', '{clasico,glam}', '{oficina,cena,boda}', '{otono,invierno}'),
  ('Botas altas de piel', 'Calzado Demo', 'shoes', '#6B4A30', 'Chocolate', 260.00, null,
   'https://www.google.com/search?tbm=shop&q=botas+altas+de+piel+chocolate', '{clasico,bohemio}', '{casual,cena,oficina}', '{otono,invierno}'),
  ('Bolso bandolera pequeño', 'Piel Demo', 'bag', '#B98A5A', 'Camel', 120.00, null,
   'https://www.google.com/search?tbm=shop&q=bolso+bandolera+peque%C3%B1o+camel', '{clasico,minimalista,urbano}', '{casual,viaje,cena}', '{primavera,verano,otono,invierno}'),
  ('Clutch joya', 'Joyería Demo', 'bag', '#C9A876', 'Dorado', 85.00, null,
   'https://www.google.com/search?tbm=shop&q=clutch+joya+dorado', '{glam}', '{gala,boda,fiesta}', '{primavera,verano,otono,invierno}'),
  ('Collar de perlas', 'Joyería Demo', 'accessory', '#F3EDE2', 'Marfil', 75.00, null,
   'https://www.google.com/search?tbm=shop&q=collar+de+perlas+marfil', '{clasico,romantico}', '{oficina,cena,boda}', '{primavera,verano,otono,invierno}'),
  ('Bufanda de lana gruesa', 'Basics Demo', 'accessory', '#6B7340', 'Verde oliva', 39.00, null,
   'https://www.google.com/search?tbm=shop&q=bufanda+de+lana+gruesa+verde+oliva', '{bohemio,clasico}', '{casual,viaje}', '{otono,invierno}'),
  ('Gafas de sol de pasta', 'Óptica Demo', 'accessory', '#6B4A30', 'Carey', 110.00, null,
   'https://www.google.com/search?tbm=shop&q=gafas+de+sol+de+pasta+carey', '{clasico,urbano}', '{casual,viaje}', '{primavera,verano}');

-- Término corto para buscar cada idea en tiendas reales (Zara, Bershka, H&M…).
update public.products as p set search_term = t.term
from (values
  ('Blazer de lana entallado', 'blazer azul marino'),
  ('Bolso de mano estructurado', 'bolso negro'),
  ('Camisa de seda', 'camisa satinada crudo'),
  ('Cinturón de piel fino', 'cinturón piel marrón'),
  ('Mocasines de piel', 'mocasines piel'),
  ('Pantalón palazzo de crepé', 'pantalón palazzo marrón'),
  ('Pañuelo de seda estampado', 'pañuelo estampado'),
  ('Pendientes de aro dorados', 'pendientes aro dorados'),
  ('Sandalias de tacón fino', 'sandalias tacón dorado'),
  ('Vestido midi satinado', 'vestido midi satinado burdeos'),
  ('Blusa fluida terracota', 'blusa fluida teja'),
  ('Bolso bandolera pequeño', 'bolso bandolera camel'),
  ('Botas altas de piel', 'botas altas marrón'),
  ('Bufanda de lana gruesa', 'bufanda verde'),
  ('Camiseta de algodón orgánico', 'camiseta blanca algodón'),
  ('Cazadora de cuero', 'cazadora cuero negra'),
  ('Clutch joya', 'clutch dorado'),
  ('Collar de perlas', 'collar perlas'),
  ('Falda midi plisada', 'falda midi plisada verde'),
  ('Gafas de sol de pasta', 'gafas de sol carey'),
  ('Jersey de cachemir cuello vuelto', 'jersey cuello alto negro'),
  ('Pantalón de lino', 'pantalón lino beige'),
  ('Salones de ante', 'zapatos salón burdeos'),
  ('Trench clásico', 'gabardina trench camel'),
  ('Vaqueros wide leg', 'vaqueros wide leg'),
  ('Vestido camisero de lino', 'vestido camisero lino'),
  ('Vestido largo de seda', 'vestido largo satinado azul'),
  ('Zapatillas de piel blancas', 'zapatillas blancas piel')
) as t(name, term)
where p.name = t.name;
