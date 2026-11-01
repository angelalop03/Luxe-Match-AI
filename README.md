# LuxeMatch AI

Plataforma de estilismo con IA que analiza la colorimetría, el armario digital y el tipo de evento para generar outfits personalizados y recomendaciones de compra.

Un solo código para **iOS, Android y web** (Expo + React Native) y un backend en **Supabase**.

```
LuxeMatch/
├── app/          App Expo (iOS · Android · Web)
└── supabase/     Base de datos, auth, storage y (más adelante) Edge Functions de IA
```

## Puesta en marcha (local)

Requisitos: Node 20+, Docker Desktop abierto.

```bash
# 1. Backend local (la primera vez descarga las imágenes de Docker)
npx supabase start

# 2. Variables de la app
cp app/.env.example app/.env.local
#    → pega la "API URL" y la "Publishable key" que muestra `npx supabase status`

# 3. App
cd app
npm install
npm run web        # navegador
npm run android    # emulador o Expo Go
npm run ios        # simulador (macOS) o Expo Go
```

| Servicio local | URL |
|---|---|
| App web | http://localhost:8081 |
| Supabase Studio (ver tablas y usuarios) | http://127.0.0.1:54323 |
| Mailpit (emails de confirmación y recuperación) | http://127.0.0.1:54324 |

Para reiniciar la base de datos con el esquema y los datos de prueba: `npx supabase db reset`.

### IA (escaneo de prendas y colorimetría)

Las funciones de IA viven en `supabase/functions/` y llaman a Claude (`claude-opus-5-5`) con visión y respuestas estructuradas. La clave de Anthropic **solo** está en el servidor, nunca en la app.

```bash
# 1. Crea una clave en https://console.anthropic.com y guárdala en el archivo de secretos local
cp supabase/functions/.env.example supabase/functions/.env   # y pega ANTHROPIC_API_KEY

# 2. Sirve las funciones en local (con Supabase ya arrancado)
npx supabase functions serve --env-file supabase/functions/.env
```

Sin clave, la app sigue funcionando: avisa de que la IA no está configurada y permite rellenar las prendas a mano.

| Función | Qué hace | Límite por usuario |
|---|---|---|
| `scan-garment` | Detecta tipo, color, estilo, ocasión y temporada de una prenda (RF6) | 30 / hora |
| `analyze-colors` | Estación de color, paleta, colores recomendados y a evitar a partir del selfie (RF7) | 5 / hora |
| `generate-outfits` | Outfits por ocasión y temporada solo con prendas del armario, con explicación estilística (RF8) | 20 / hora |
| `restyle-garment` | Ideas para transformar, llevar de otra forma o actualizar una prenda, con accesorios complementarios (RF14) | 10 / hora |

Las recomendaciones de compra (RF9) se calculan en la app (`features/shop/recommend.ts`) a partir del catálogo `products`: puntúan ocasión, temporada, estilo, paleta y presupuesto, y descartan cualquier producto que duplique una prenda que ya tienes (misma categoría y color parecido, RB6). Los clics a tienda se registran como `ecommerce_click`. El catálogo incluido es de demostración (`supabase/seed.sql`); en producción se sustituiría por un feed real o una API de afiliación.

`generate-outfits` filtra primero por reglas (temporada, prendas existentes), pide a Claude las combinaciones y valida cada propuesta (parte de arriba + de abajo, o vestido). Si la IA no está disponible, usa un generador por reglas que puntúa las prendas por ocasión, estilo y paleta, así la app sigue funcionando sin clave.

Cada llamada queda registrada en `analytics_events` (`ai_garment_scan`, `ai_color_analysis`) con los tokens usados y el tiempo de respuesta, para controlar coste y rendimiento. Como referencia, cada análisis ronda los 2–4 mil tokens de entrada y unos cientos de salida.

## Arquitectura

| Capa | Tecnología | Notas |
|---|---|---|
| App | Expo SDK 58, Expo Router, TypeScript | Rutas en `app/src/app` |
| UI | Sistema de diseño propio (`constants/theme.ts`, `components/ui`) | Cormorant Garamond + Inter, modo claro y oscuro, contraste AA |
| Auth | Supabase Auth | Sesión cifrada en el móvil (SecureStore + AES) |
| Datos | Postgres con Row Level Security | Cada usuario solo accede a sus datos (RB7, RB8) |
| Imágenes | Supabase Storage, buckets privados `selfies` y `garments` | Carpeta por usuario |
| IA | Claude (`claude-opus-5-5`) con visión y structured outputs, desde Supabase Edge Functions | La clave nunca va en la app; fallback automático ante rechazos |
| Analytics | Tabla `analytics_events` + `services/analytics.ts` | RF13 |

### Estructura de `app/src`

```
app/                 Rutas (cada archivo es una pantalla)
  (auth)/            sign-in, sign-up, forgot-password
  (tabs)/            index (dashboard), wardrobe/, outfits, profile/
  onboarding.tsx     Quiz inicial
  reset-password.tsx Nueva contraseña (desde el email)
  _layout.tsx        Fuentes, AuthProvider y rutas protegidas
components/ui/       Botón, campo de texto, chip, tarjeta, icono…
features/onboarding/ Preguntas y componente del quiz
features/wardrobe/   Opciones de prendas, filtros, tarjeta y formulario
lib/                 Cliente Supabase, imágenes (picker, compresión, subida), auth
providers/           AuthProvider (sesión + perfil)
services/            Acceso a datos (perfil, analytics)
```

Las rutas protegidas del layout raíz deciden qué ve el usuario: sin sesión → `(auth)`; con sesión y sin quiz → `onboarding`; con todo completado → `(tabs)`.

## Estado del roadmap

- [x] **Fase 0** · Sistema de diseño luxury y estructura modular
- [x] **Fase 1** · Registro, login, logout y recuperación de contraseña (RF1) · perfil editable (RF2) · quiz de onboarding (RF3) · esquema completo con RLS
- [x] **Fase 2** · Subida de imágenes con vista previa y compresión (RF4) · armario digital: añadir, editar, eliminar, categorizar y filtrar prendas (RF5) · selfie para colorimetría · dashboard con datos reales
- [x] **Fase 3** · Escaneo IA de prendas que rellena el formulario (RF6) · análisis de colorimetría con paleta, colores estrella y a evitar (RF7)
- [x] **Fase 4** · Generación de outfits por ocasión y temporada (RF8) · guardar, editar, marcar favoritos y eliminar (RF10) · validación de composición en la base de datos (RB9)
- [x] **Fase 5** · Recomendaciones de compra sin duplicar el armario y "Completa el look" (RF9, RB6) · Restyle con detección de prendas olvidadas (RF14) · dashboard completo (RF11) · clics ecommerce en analytics (RF13)
- [ ] **Fase 6** · Analytics, accesibilidad, tests y publicación

## Pasar a producción

1. Crea un proyecto en [supabase.com](https://supabase.com) y aplica las migraciones: `npx supabase link` y luego `npx supabase db push`.
1. Sube la clave de IA y despliega las funciones: `npx supabase secrets set ANTHROPIC_API_KEY=...` y `npx supabase functions deploy`.
2. En **Authentication → URL Configuration**, añade las URLs de redirección: la de tu web, `luxematch://**` y `exp://**`.
3. Pon la URL y la publishable key del proyecto en las variables de entorno de EAS o Vercel.
4. Móvil: `npx eas-cli@latest build` (las cuentas de Apple Developer y Google Play son necesarias para publicar en las tiendas).
5. Web: `cd app && npx expo export --platform web` y sube `dist/` a Vercel o Netlify.
