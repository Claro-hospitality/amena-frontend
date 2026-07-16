# amena-front

Monorepo de frontends de Amena (Turborepo + pnpm). Dos apps React + Vite —
`backoffice` (personal interno) y `portal` (empresas y colaboradores)— que
comparten paquetes internos en `packages/`. La guía de desarrollo vive en
[`CLAUDE.md`](./CLAUDE.md).

## Desarrollo

```bash
pnpm install          # instalar todo el workspace
pnpm dev              # ambas apps en modo dev
pnpm dev:backoffice   # solo backoffice
pnpm dev:portal       # solo portal
pnpm build            # build de todo (Turborepo cachea lo no afectado)
pnpm lint             # lint del workspace
pnpm test             # tests del workspace
```

Cada app usa variables `VITE_*`. Copia el `.env.example` de cada app a
`.env.local` y complétalo (ver [`apps/backoffice/.env.example`](./apps/backoffice/.env.example)
y [`apps/portal/.env.example`](./apps/portal/.env.example)).

## Observabilidad (Sentry)

Ambas apps inicializan `@sentry/react` en su `main.tsx`, pero **solo si
`VITE_SENTRY_DSN` tiene valor**. En desarrollo se deja vacío: Sentry queda
deshabilitado y Vite lo elimina del bundle (coste cero). El DSN solo se llena en
producción (secret de CI, ver abajo).

## CI

`.github/workflows/ci.yml` corre en cada **pull request** y en **push a `main`**:
instala dependencias con caché de pnpm y ejecuta `turbo run lint test build --affected`
(solo procesa los paquetes afectados). No requiere secrets.

## Deploy — Firebase Hosting

Cada app se publica como un **site de Hosting independiente** dentro del proyecto
Firebase `amena-20df0`:

| App        | Target de Firebase | Site ID        | Carpeta publicada       |
|------------|--------------------|----------------|-------------------------|
| backoffice | `backoffice`       | `amena-admin`  | `apps/backoffice/dist`  |
| portal     | `portal`           | `amena-portal` | `apps/portal/dist`      |

La configuración vive en [`firebase.json`](./firebase.json) (targets + rewrites SPA)
y [`.firebaserc`](./.firebaserc) (proyecto default y mapeo target → site).

### Deploy continuo

`.github/workflows/deploy.yml` se dispara en **push a `main`**: hace build de
producción de ambas apps y las despliega al canal `live` de cada site con el
action oficial `FirebaseExtended/action-hosting-deploy`.

### Secrets a crear en GitHub

En **Settings → Secrets and variables → Actions** del repositorio:

| Secret                     | Para qué sirve                                                        |
|----------------------------|----------------------------------------------------------------------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de una service account con permiso *Firebase Hosting Admin*. Se genera en Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar clave privada. Pega el JSON completo. |
| `VITE_SUPABASE_URL`        | URL del Supabase de producción (proyecto "Amena" en Supabase Cloud). |
| `VITE_SUPABASE_ANON_KEY`   | Llave publishable (`sb_publishable_...`) de producción.              |
| `VITE_SENTRY_DSN`          | DSN de Sentry para producción (deja el secret sin crear si aún no usas Sentry en prod; el build funciona igual y Sentry queda deshabilitado). |

### Primer deploy manual (una sola vez)

Requiere `firebase-tools` (aquí vía `npx`; o instálalo global con `npm i -g firebase-tools`).
Los sites deben existir antes del primer deploy.

```bash
# 1. Autenticación y selección de proyecto
npx firebase-tools login
npx firebase-tools use amena-20df0

# 2. Crear los sites de Hosting (solo si no existen aún)
npx firebase-tools hosting:sites:create amena-admin
npx firebase-tools hosting:sites:create amena-portal

# (Los targets ya están en .firebaserc. Si necesitas reaplicarlos:)
npx firebase-tools target:apply hosting backoffice amena-admin
npx firebase-tools target:apply hosting portal amena-portal

# 3. Build de producción y deploy
#    Antes: asegura las VITE_* de producción (apps/*/.env.production o exportadas).
pnpm build
npx firebase-tools deploy --only hosting
```

A partir de ahí, cada push a `main` despliega automáticamente vía `deploy.yml`.
