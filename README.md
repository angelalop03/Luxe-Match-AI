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

## Arquitectura

| Capa | Tecnología | Notas |
|---|---|---|
| App | Expo SDK 58, Expo Router, TypeScript | Rutas en `app/src/app` |
| UI | Sistema de diseño propio (`constants/theme.ts`, `components/ui`) | Cormorant Garamond + Inter, modo claro y oscuro, contraste AA |
| Auth | Supabase Auth | Sesión cifrada en el móvil (SecureStore + AES) |
| Datos | Postgres con Row Level Security | Cada usuario solo accede a sus datos (RB7, RB8) |
| Imágenes | Supabase Storage, buckets privados `selfies` y `garments` | Carpeta por usuario |
| IA (fase 3) | Claude con visión, desde Supabase Edge Functions | La clave nunca va en la app |
| Analytics | Tabla `analytics_events` + `services/analytics.ts` | RF13 |

### Estructura de `app/src`

```
app/                 Rutas (cada archivo es una pantalla)
  (auth)/            sign-in, sign-up, forgot-password
  (tabs)/            index (dashboard), wardrobe, outfits, profile/
  onboarding.tsx     Quiz inicial
  reset-password.tsx Nueva contraseña (desde el email)
  _layout.tsx        Fuentes, AuthProvider y rutas protegidas
components/ui/       Botón, campo de texto, chip, tarjeta, icono…
features/onboarding/ Preguntas y componente del quiz
lib/                 Cliente Supabase, enlaces de auth, validaciones
providers/           AuthProvider (sesión + perfil)
services/            Acceso a datos (perfil, analytics)
```

Las rutas protegidas del layout raíz deciden qué ve el usuario: sin sesión → `(auth)`; con sesión y sin quiz → `onboarding`; con todo completado → `(tabs)`.

## Estado del roadmap

- [x] **Fase 0** · Sistema de diseño luxury y estructura modular
- [x] **Fase 1** · Registro, login, logout y recuperación de contraseña (RF1) · perfil editable (RF2) · quiz de onboarding (RF3) · esquema completo con RLS
- [ ] **Fase 2** · Subida de imágenes y armario digital (RF4, RF5)
- [ ] **Fase 3** · Escaneo IA de prendas y colorimetría (RF6, RF7)
- [ ] **Fase 4** · Generación y guardado de outfits (RF8, RF10, RB1–RB11)
- [ ] **Fase 5** · Ecommerce, Restyle y dashboard completo (RF9, RF11, RF14)
- [ ] **Fase 6** · Analytics, accesibilidad, tests y publicación

## Pasar a producción

1. Crea un proyecto en [supabase.com](https://supabase.com) y aplica las migraciones: `npx supabase link` y luego `npx supabase db push`.
2. En **Authentication → URL Configuration**, añade las URLs de redirección: la de tu web, `luxematch://**` y `exp://**`.
3. Pon la URL y la publishable key del proyecto en las variables de entorno de EAS o Vercel.
4. Móvil: `npx eas-cli@latest build` (las cuentas de Apple Developer y Google Play son necesarias para publicar en las tiendas).
5. Web: `cd app && npx expo export --platform web` y sube `dist/` a Vercel o Netlify.
