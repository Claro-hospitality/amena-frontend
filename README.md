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
