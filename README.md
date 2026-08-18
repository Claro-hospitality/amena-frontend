# amena-front

Monorepo de frontends de Amena (Turborepo + pnpm). Dos apps React + Vite —
`backoffice` (personal interno) y `portal` (empresas y colaboradores)— que
comparten paquetes internos en `packages/`. La guía de desarrollo vive en
[`CLAUDE.md`](./CLAUDE.md).

## Requisitos

- **Node 22** (la versión que usa el CI) y **pnpm**: el repo fija `pnpm@10.13.1` en `packageManager`, así que con Corepack activo (`corepack enable`) se toma la versión correcta sola.
- Para el modo dev: el **stack local de Supabase** del repo `amena-backend` corriendo (`supabase start`). Ver su README.

```bash
pnpm install    # instala todo el workspace
```

## Los dos modos de correr el front

La misma app se puede correr contra tu Docker local o contra el Supabase de producción. Lo único que cambia es **qué backend** consume y **qué archivo de entorno** lee:

| | `pnpm dev` | `pnpm prod` |
|---|---|---|
| Backend | Docker local (`amena-backend`) | **Supabase Cloud de producción** |
| Archivo de entorno | `.env.local` de cada app | `.env.prod` de cada app |
| Modo de Vite | `development` | `prod` |
| Puerto backoffice | `5174` | `5184` |
| Puerto portal | `5173` | `5183` |
| Datos | seed, desechables | **reales** |

Los puertos son distintos a propósito: **puedes tener los dos modos arriba al mismo tiempo** y comparar comportamientos sin apagar nada.

### Modo dev — contra el Docker local

Es el modo normal de trabajo. Requiere el stack del backend levantado.

```bash
# 1. En el repo amena-backend, una sola vez por sesión:
#    supabase start   →  copia la publishable key que imprime (o `supabase status`)

# 2. Aquí, la primera vez: configura el entorno de cada app
cp apps/backoffice/.env.example apps/backoffice/.env.local
cp apps/portal/.env.example apps/portal/.env.local
#    → pega la llave local en VITE_SUPABASE_ANON_KEY (la URL ya viene: http://localhost:54331)

# 3. Levantar
pnpm dev              # ambas apps
pnpm dev:backoffice   # solo backoffice  → http://localhost:5174
pnpm dev:portal       # solo portal      → http://localhost:5173
```

Entra con cualquier usuario del seed (`super@amena.com` / `password123` para el backoffice, `admin@constructora.mx` / `password123` para el portal). La lista completa está en el README de `amena-backend`.

### Modo prod — contra la base real

Sirve para verificar en producción sin desplegar: corres el front **en tu máquina** apuntando al Supabase Cloud real.

```bash
# La primera vez: configura el entorno de prod de cada app
cp apps/backoffice/.env.prod.example apps/backoffice/.env.prod
cp apps/portal/.env.prod.example apps/portal/.env.prod
#    → pega la llave publishable de PROD (Dashboard de Supabase → Project Settings → API Keys)

pnpm prod              # ambas apps
pnpm prod:backoffice   # solo backoffice  → http://localhost:5184
pnpm prod:portal       # solo portal      → http://localhost:5183
```

> ⚠️ **Estás en la base de datos real.** Todo lo que hagas aquí es producción: usuarios que se crean de verdad, consumos que cuentan, correos que **salen a la gente**. No es un ambiente de pruebas — sirve para reproducir un problema reportado o confirmar un despliegue, no para experimentar. Para eso está el modo dev.
>
> `.env.local` y `.env.prod` están fuera de git (solo se versionan los `.example`). Nunca commitees llaves.

### Regenerar los tipos de la base

Los tipos de TypeScript del esquema **no se escriben a mano**: se generan del Supabase **local**, así que necesita el stack del backend corriendo.

```bash
pnpm gen:types    # → packages/supabase/src/database.types.ts
```

Si un tipo no existe, el cambio va **primero** en el backend (migración → merge a su `dev`) y luego se regeneran aquí.

## Comandos

```bash
pnpm dev / dev:backoffice / dev:portal      # dev contra el Docker local
pnpm prod / prod:backoffice / prod:portal   # local contra el Supabase de producción
pnpm dev:lan / dev:lan:portal / …           # dev accesible desde el teléfono (ver abajo)
pnpm build                                  # build de todo (Turborepo cachea lo no afectado)
pnpm test                                   # tests del workspace (Vitest)
pnpm lint                                   # lint del workspace
pnpm gen:types                              # regenerar tipos desde el esquema local
```

`pnpm build`, `pnpm test` y `pnpm lint` en verde son requisito antes de integrar a `dev` (ver [`CLAUDE.md`](./CLAUDE.md)).

### Probar desde teléfono/tablet (LAN)

Para abrir las apps desde otro dispositivo en la misma red Wi-Fi (útil porque el
portal es mobile-first y el escáner del backoffice se usa en tablet):

```bash
pnpm dev:lan              # ambas apps expuestas en la LAN
pnpm dev:lan:portal       # solo portal      → http://<IP-de-tu-Mac>:5173
pnpm dev:lan:backoffice   # solo backoffice  → http://<IP-de-tu-Mac>:5174
```

El script [`scripts/dev-lan.sh`](./scripts/dev-lan.sh) detecta la IP LAN de la Mac
y **apunta el cliente de Supabase a esa IP** (no a `localhost`, que desde el
teléfono sería el propio teléfono). Solo sobrescribe `VITE_SUPABASE_URL` para esa
corrida — no toca `.env.local`. Requiere el stack local de `amena-backend`
corriendo. Override del puerto de Supabase: `SUPABASE_PORT=xxxx pnpm dev:lan`.

> **Limitación conocida — cámara del escáner por LAN:** se sirve por `http://`
> (no HTTPS), y los navegadores bloquean el acceso a la cámara fuera de un
> *secure context* salvo en `localhost`. Por eso **el escáner QR del mesero no
> funciona por LAN**; el resto de las pantallas sí. Para probar la cámara en un
> dispositivo real hace falta HTTPS (p. ej. un túnel tipo ngrok o un certificado
> local); la app ya muestra un mensaje claro cuando la cámara no está en contexto
> seguro.

## Observabilidad (Sentry)

Ambas apps inicializan `@sentry/react` en su `main.tsx`, pero **solo si
`VITE_SENTRY_DSN` tiene valor**. En desarrollo se deja vacío: Sentry queda
deshabilitado y Vite lo elimina del bundle (coste cero). El DSN solo se llena en
producción (secret de CI, ver abajo).

## CI

`.github/workflows/ci.yml` corre **solo al tocar `main`**: en los pull requests *hacia* `main`
(el PR de release) y en push a `main`. **No** corre en push a `dev`, así que la verificación antes
de integrar a `dev` es local (`pnpm build`, `pnpm test`, `pnpm lint`). El job
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

### Requisito único: crear los sites de Hosting

Antes del primer deploy (por CD **o** manual) los sites deben existir; el workflow
**no** los crea. Una sola vez, con `firebase-tools` autenticado (ver más abajo):

```bash
npx firebase-tools use amena-20df0
npx firebase-tools hosting:sites:create amena-admin
npx firebase-tools hosting:sites:create amena-portal
```

### Deploy continuo (flujo principal)

`.github/workflows/deploy.yml` se dispara en **push a `main`**: hace build de
producción de ambas apps y las despliega al canal `live` de cada site con el
action oficial `FirebaseExtended/action-hosting-deploy`. Este es el flujo real de
despliegue, **incluido el primer deploy**: una vez creados los sites y configurados
los secrets + IAM, basta con integrar a `main` para que ambos sites se publiquen
(no hace falta correr `firebase deploy` a mano).

### Secrets a crear en GitHub

En **Settings → Secrets and variables → Actions** del repositorio:

| Secret                     | Para qué sirve                                                        |
|----------------------------|----------------------------------------------------------------------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de una service account **dedicada** con rol mínimo. Créala en Google Cloud Console → IAM y administración → Cuentas de servicio → *Crear cuenta de servicio* (proyecto `amena-20df0`), otórgale el rol **Firebase Hosting Admin** (`roles/firebasehosting.admin`) y genera una llave **JSON** (Claves → Agregar clave → Crear clave nueva → JSON). Pega el JSON completo. **No** uses la llave del Admin SDK por defecto de Firebase Console (acceso demasiado amplio). |
| `VITE_SUPABASE_URL`        | URL del Supabase de producción (proyecto "Amena" en Supabase Cloud). |
| `VITE_SUPABASE_ANON_KEY`   | Llave publishable (`sb_publishable_...`) de producción.              |
| `VITE_SENTRY_DSN`          | DSN de Sentry para producción (deja el secret sin crear si aún no usas Sentry en prod; el build funciona igual y Sentry queda deshabilitado). |

### Deploy manual (alternativa / local)

Normalmente **no hace falta**: el deploy de producción lo hace el CD al integrar a
`main`. Usa esto solo para desplegar a mano (debugging o un deploy puntual desde tu
máquina). Requiere `firebase-tools` (vía `npx` o global con `npm i -g firebase-tools`)
y que los sites ya existan (ver "Requisito único" arriba).

```bash
# 1. Autenticación y selección de proyecto
npx firebase-tools login
npx firebase-tools use amena-20df0

# 2. (Opcional) Reaplicar los targets si hiciera falta — ya están en .firebaserc
npx firebase-tools target:apply hosting backoffice amena-admin
npx firebase-tools target:apply hosting portal amena-portal

# 3. Build de producción y deploy
#    Antes: asegura las VITE_* de producción (apps/*/.env.production o exportadas).
pnpm build
npx firebase-tools deploy --only hosting
```

### Troubleshooting — permisos de la service account

**Síntoma:** `deploy.yml` falla en el paso de deploy con un error de permisos /
autenticación de Firebase Hosting, aun con `FIREBASE_SERVICE_ACCOUNT` configurado.

**Causa (vista en el primer deploy):** en el IAM del proyecto `amena-20df0` había un
**binding de rol apuntando a una identidad eliminada** — aparece como
`deleted:serviceAccount:...?uid=...`. El rol de Hosting estaba asignado a esa
identidad muerta y no a la service account viva que usa el workflow.

**Solución:**

1. Google Cloud Console → **IAM y administración → IAM** del proyecto `amena-20df0`.
2. Busca bindings con el prefijo **`deleted:`** (uid huérfano) y **elimínalos**.
3. Otorga **Firebase Hosting Admin** (`roles/firebasehosting.admin`) a la service
   account **viva** (la del JSON en `FIREBASE_SERVICE_ACCOUNT`).
4. Re-ejecuta el job fallido: **Actions → run fallido → Re-run jobs**.

Puede recurrir si se elimina y recrea una service account: los bindings antiguos que
la referenciaban quedan como `deleted:...?uid=...` y hay que limpiarlos.
