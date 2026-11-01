# LuxeMatch AI

Plataforma de estilismo con IA que analiza la colorimetría, el armario digital y el tipo de evento para generar outfits personalizados y recomendaciones de compra.

Un solo código para **iOS, Android y web** (Expo + React Native) y un backend en **Supabase**.

```
LuxeMatch/
├── app/          App Expo (iOS · Android · Web)
├── supabase/     Base de datos, auth, storage, Edge Functions de IA y tests
└── .github/      Integración continua (lint, tipos, tests y tests de base de datos)
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
| Supabase Studio (tablas, usuarios y métricas) | http://127.0.0.1:54323 |
| Mailpit (emails de confirmación y recuperación) | http://127.0.0.1:54324 |

Para reiniciar la base de datos con el esquema y los datos de prueba: `npx supabase db reset`.

### IA

Las funciones de IA viven en `supabase/functions/` y funcionan con dos proveedores intercambiables (`_shared/ai.ts`). Las claves **solo** están en el servidor, nunca en la app.

| Proveedor | Modelo | Coste | Notas |
|---|---|---|---|
| **Groq** | `qwen/qwen3.8-27b` (visión) | Plan gratuito con límites de uso | No conserva las peticiones por defecto; activa *Zero Data Retention* en Data Controls para los selfies |
| **Anthropic** | `claude-opus-5-5` | De pago por uso | Más preciso; respuestas estructuradas garantizadas y reintento automático ante rechazos |

```bash
# 1. Crea una clave gratis en https://console.groq.com (o una de Anthropic) y pégala en el archivo de secretos
cp supabase/functions/.env.example supabase/functions/.env   # GROQ_API_KEY=... o ANTHROPIC_API_KEY=...

# 2. Sirve las funciones en local (con Supabase ya arrancado)
npx supabase functions serve --env-file supabase/functions/.env
```

Si hay las dos claves se usa Claude; `AI_PROVIDER=groq` fuerza Groq. Con Groq, la respuesta se valida con el mismo esquema Zod que con Claude y, si no lo cumple, se descarta.

Medido en local con Groq: outfits en ~2 s y colorimetría en ~3–4 s. Límites del plan gratuito: unos **1.000 tokens de salida por minuto**, así que caben aproximadamente un análisis o una generación por minuto (si se supera, la app avisa de que la IA está ocupada). El modelo gratuito es menos preciso y consistente que Claude: repetir el análisis con el mismo selfie puede dar una estación vecina.

Sin ninguna clave la app sigue funcionando: el escaneo avisa de que la IA no está configurada, los outfits y el Restyle usan un generador por reglas, y la colorimetría se puede hacer con el **test sin foto** (8 preguntas que calculan la estación de color en la propia app, `features/colorimetry/color-quiz.ts`). El test también es la opción para quien prefiere no subir un selfie.

| Función | Qué hace | Límite por usuario |
|---|---|---|
| `scan-garment` | Detecta tipo, color, estilo, ocasión y temporada de una prenda (RF6) | 30 / hora |
| `analyze-colors` | Estación de color, paleta, colores recomendados y a evitar a partir del selfie (RF7) | 5 / hora |
| `generate-outfits` | Outfits por ocasión y temporada solo con prendas del armario, con explicación estilística (RF8) | 20 / hora |
| `restyle-garment` | Ideas para transformar, llevar de otra forma o actualizar una prenda, con accesorios complementarios (RF14) | 10 / hora |
| `delete-account` | Borra la cuenta, las fotos y todos los datos personales (RGPD) | — |

`generate-outfits` filtra primero por reglas (temporada, prendas existentes), pide a Claude las combinaciones y valida cada propuesta (parte de arriba + de abajo, o vestido). Si la IA no está disponible, usa un generador por reglas que puntúa las prendas por ocasión, estilo y paleta.

Las recomendaciones de compra (RF9) se calculan en la app (`features/shop/recommend.ts`) a partir del catálogo `products`: puntúan ocasión, temporada, estilo, paleta y presupuesto, y descartan cualquier producto que duplique una prenda que ya tienes (misma categoría y color parecido, RB6). El catálogo (`supabase/seed.sql`) es un catálogo de **ideas de compra**: tipo de prenda, color, estilo y un término de búsqueda corto (`search_term`, p. ej. "blazer azul marino"). Al pulsar una idea se elige tienda y se abre su búsqueda con productos reales (`features/shop/stores.ts`):

| Tienda | Cómo se busca |
|---|---|
| Zara, Bershka, H&M, Zalando | Buscador propio de la tienda (URL comprobada) |
| Mango, Pull&Bear, Stradivarius | Google limitado a la web de la tienda |

Cada clic se registra en `ecommerce_click` con la tienda y el término. Para mostrar productos concretos con foto y precio dentro de la app, el siguiente paso es un feed de una red de afiliación (Awin, Tradedoubler…) con las tiendas que lo ofrecen; Zara y Bershka no tienen programa de afiliados.

## Arquitectura

| Capa | Tecnología | Notas |
|---|---|---|
| App | Expo SDK 58, Expo Router, TypeScript | Rutas en `app/src/app` |
| UI | Sistema de diseño propio (`constants/theme.ts`, `components/ui`) | Cormorant Garamond + Inter, modo claro y oscuro, contraste AA |
| Auth | Supabase Auth | Sesión cifrada en el móvil (SecureStore + AES) |
| Datos | Postgres con Row Level Security | Cada usuario solo accede a sus datos (RB7, RB8) |
| Imágenes | Supabase Storage, buckets privados `selfies` y `garments` | Carpeta por usuario, JPEG de 1280 px |
| IA | Groq (`qwen/qwen3.8-27b`, gratis) o Claude (`claude-opus-5-5`), desde Supabase Edge Functions | Proveedor intercambiable; la clave nunca va en la app |
| Analytics | `analytics_events` + vistas de métricas | RF13 |

### Estructura de `app/src`

```
app/                 Rutas (cada archivo es una pantalla)
  (auth)/            sign-in, sign-up, forgot-password
  (tabs)/            index (dashboard), wardrobe/ (+ restyle/), outfits/, profile/
  onboarding.tsx     Quiz inicial
  shop.tsx           Recomendaciones "Para ti"
  privacy.tsx        Política de privacidad (pública)
  _layout.tsx        Fuentes, AuthProvider, rutas protegidas y pantalla de error
components/          UI reutilizable (botón, campo, tarjeta, icono, selector de imagen…)
features/            Lógica y componentes por área: onboarding, wardrobe, colorimetry,
                     outfits, shop, restyle
lib/                 Cliente Supabase, imágenes (picker, compresión, subida), auth, colores
providers/           AuthProvider (sesión + perfil)
services/            Acceso a datos y a las Edge Functions
types/               Tipos del dominio
```

Las rutas protegidas del layout raíz deciden qué ve el usuario: sin sesión → `(auth)`; con sesión y sin quiz → `onboarding`; con todo completado → `(tabs)`.

## Calidad

```bash
cd app
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Tests unitarios (Jest)

cd ..
npx supabase test db   # Tests de base de datos (pgTAP), con Supabase arrancado
```

- **Tests unitarios** (46): recomendaciones sin duplicados (RB6), paleta y presupuesto (RB2), filtros del armario (RF5), generador y validación de outfits (RB1, RB3, RB4, RB5, RB9), test de colorimetría sin foto (RF7), validación de formularios.
- **Tests de base de datos** (18): aislamiento entre cuentas con RLS (RB7), fotos solo en la carpeta propia, composición de outfits (RB9), borrado de prendas (RB10), catálogo público y analytics.
- **Integración continua**: `.github/workflows/ci.yml` ejecuta todo lo anterior en cada push y pull request.
- **Accesibilidad** (RNF8): contraste AA en ambos temas, nombres accesibles en todos los controles, etiquetas en formularios y áreas táctiles de al menos 24 px. `app/scripts/a11y-audit.js` repite la auditoría pegándolo en la consola del navegador.

## Analytics (RF13)

La app registra en `analytics_events`: registro e inicio de sesión, onboarding, pantallas visitadas (`screen_view`, solo el patrón de ruta, sin ids), prendas subidas, escaneos IA, outfits generados y guardados, Restyle y clics a tiendas (`ecommerce_click`). Las Edge Functions añaden tokens y tiempo de respuesta de cada llamada a la IA.

Vistas de métricas (solo para el equipo, desde Supabase Studio o con `service_role`):

| Vista | Para qué |
|---|---|
| `analytics_daily` | Eventos y usuarias únicas por día |
| `analytics_outfit_generation` | Generaciones con IA frente a reglas y tiempo de respuesta |
| `analytics_ecommerce_clicks` | Clics a tienda por pantalla y categoría |
| `analytics_ai_usage` | Llamadas, tokens y latencia (media y p95) por tipo de análisis |
| `analytics_screens` | Pantallas más visitadas |

## Publicación

### Backend (Supabase)

```bash
npx supabase link --project-ref <tu-proyecto>
npx supabase db push
npx supabase secrets set GROQ_API_KEY=...        # o ANTHROPIC_API_KEY=...
npx supabase functions deploy
```

En **Authentication → URL Configuration** añade la URL de la web, `luxematch://**` y `exp://**`. Carga el catálogo real de productos (el de `seed.sql` es de demostración).

### Web (Vercel)

`app/vercel.json` ya está configurado (export estático + rutas SPA). En Vercel: importa el repositorio con **Root Directory = `app`** y añade las variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_KEY`.

### iOS y Android (EAS)

```bash
cd app
npx eas-cli@latest login
npx eas-cli@latest init                      # vincula el proyecto
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value ...
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_KEY --value ...
npx eas-cli@latest build --profile preview   # APK / build interna para probar en móvil
npx eas-cli@latest build --profile production
npx eas-cli@latest submit --profile production
```

Perfiles en `app/eas.json`: `preview` (distribución interna, APK en Android) y `production` (numeración automática).

### Antes de enviar a las tiendas

- [ ] Icono, splash y capturas de pantalla con la identidad de LuxeMatch (ahora son los de Expo).
- [ ] Revisar la política de privacidad (`app/src/app/privacy.tsx`) con asesoría legal y completar el responsable y el email de contacto.
- [ ] Cuentas de Apple Developer (99 $/año) y Google Play Console (25 $ una vez).
- [ ] Probar en dispositivos reales: cámara, galería, enlaces de los emails (`luxematch://`) y permisos.
- [ ] Medir el tiempo de respuesta de la IA con la clave real (RNF2: menos de 5 s) y ajustar el esfuerzo o el modelo si hace falta.

## Estado del roadmap

- [x] **Fase 0** · Sistema de diseño luxury y estructura modular
- [x] **Fase 1** · Registro, login, logout y recuperación de contraseña (RF1) · perfil editable (RF2) · quiz de onboarding (RF3) · esquema completo con RLS
- [x] **Fase 2** · Subida de imágenes con vista previa y compresión (RF4) · armario digital: añadir, editar, eliminar, categorizar y filtrar prendas (RF5) · selfie para colorimetría
- [x] **Fase 3** · Escaneo IA de prendas que rellena el formulario (RF6) · análisis de colorimetría con paleta, colores estrella y a evitar (RF7)
- [x] **Fase 4** · Generación de outfits por ocasión y temporada (RF8) · guardar, editar, marcar favoritos y eliminar (RF10) · validación de composición en la base de datos (RB9)
- [x] **Fase 5** · Recomendaciones de compra sin duplicar el armario y "Completa el look" (RF9, RB6) · Restyle con detección de prendas olvidadas (RF14) · dashboard completo (RF11) · clics ecommerce (RF13)
- [x] **Fase 6** · Tests unitarios y de base de datos con CI · métricas de producto y pantallas visitadas (RF13) · auditoría de accesibilidad (RNF8) · privacidad y eliminación de cuenta · pantalla de error · fuentes optimizadas · configuración de publicación web y tiendas
