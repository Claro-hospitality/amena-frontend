# eventos — admin de amena.social

Panel de administración de **eventos, reservaciones y validación de boletos por QR** del sitio
público `amena.social`. Migrado desde el repo standalone `amena-admin`, que a su vez se extrajo
de `amena-landing` (donde vivía bajo `/admin/*`).

> ⚠️ **Esta app NO es el backoffice de planes de alimentación.** Es otro producto: otro Supabase,
> otro esquema, otros usuarios. Lo único que comparte con `backoffice`/`portal` es el proyecto de
> Firebase. Ver "Aislamiento" abajo antes de tocar nada.

## Aislamiento respecto al resto del monorepo

- **Otro proyecto de Supabase.** Esta app apunta al Supabase de `amena-landing`
  (eventos, reservaciones, boletos), no al de `amena-backend` (comensales, empresas, cortes).
  Por eso **no usa `@amena/supabase`**: tiene su propio cliente en `src/lib/supabase.ts` y sus
  propios tipos escritos a mano. `pnpm gen:types` no genera nada para esta app y no debe usarse
  para sus tablas.
- **No usa `@amena/ui`.** Trae su propio `src/theme.css` (tokens de marca de amena.social:
  `naranja-*`, `salvia-*`, `crema-*`, `tinta-*`), distinto del branding del backoffice.
- **No usa `@amena/utils`.** Sus helpers viven en `src/lib/`.

Si algún día los dos productos convergen, la migración correcta es mover código a `packages/`;
mientras tanto la duplicación es deliberada, no un descuido.

## Comandos

```bash
pnpm dev --filter=eventos     # vite en http://localhost:5176 (puerto fijo, strictPort)
pnpm build --filter=eventos   # tsc -b (typecheck) + vite build -> dist/
```

Abrir <http://localhost:5176/admin/login>: la raíz `/` redirige a `/admin`, que exige sesión.
El puerto 5176 no choca con backoffice (5174/5184), portal (5173/5183) ni la landing (5175).

Antes de `pnpm dev` hace falta `apps/eventos/.env.local` (copia de `.env.example`) con las
credenciales del Supabase de amena.social: `src/lib/supabase.ts` **lanza al importarse** si
faltan `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, así que sin esas variables la app truena
en blanco al arrancar. `VITE_SITIO_PUBLICO_URL` es opcional (default `https://amena.social`).

Esta app todavía **no tiene lint ni tests**: `tsc -b` (dentro de `build`) es el único check
automático. TypeScript está en `strict` con `noUnusedLocals`/`noUnusedParameters`, así que una
variable o import sin usar rompe el build (los *exports* sin usar sí sobreviven — ver "Código
heredado").

## Arquitectura

### Rutas y layout

`src/main.tsx` monta `react-router-dom` (`BrowserRouter`) y conserva el prefijo `/admin`
heredado de la landing; cualquier ruta desconocida redirige a `/admin`.

| Ruta | Página |
| --- | --- |
| `/admin/login` | `AdminLoginPage` (única pública) |
| `/admin` | `AdminDashboardPage` |
| `/admin/eventos` | `AdminEventosPage` |
| `/admin/eventos/nuevo` · `/admin/eventos/:slug/editar` | `AdminEventoFormPage` (alta y edición comparten componente; distingue por `slug`) |
| `/admin/reservaciones` · `/admin/reservaciones/:folio` | `AdminReservacionesPage` / `AdminReservacionDetallePage` |
| `/admin/escanear` | `AdminEscanearPage` |

Al agregar una pantalla: `<Route>` en `main.tsx` + entrada en `NAV_OPERACION` y `TABS_M` de
`AdminLayout.tsx`.

**El guard no está en el router.** Cada página se envuelve a sí misma en `<RequireAdminAuth>`
(exportado desde `AdminLayout.tsx`); si se te olvida, la pantalla queda pública. La mayoría
además envuelve en `<AdminLayout>` (sidebar en desktop, topbar + tab bar en móvil), pero
`AdminEscanearPage` es la excepción deliberada: usa solo `RequireAdminAuth` porque necesita
pantalla completa para la cámara.

`AdminLayout` recibe `title`/`subtitle`/`actions`/`backTo`. Pasar `backTo` cambia el chrome
móvil a modo detalle: flecha de regreso y sin tab bar inferior.

### Auth

Supabase Auth (email + password). `src/lib/admin-auth.ts` envuelve login/logout/sesión y expone
`onAdminAuthChange` (suscripción que devuelve su propio unsubscribe — úsalo como cleanup del
`useEffect`). `RequireAdminAuth` renderiza un estado `cargando` antes de decidir, para no
mandar a `/admin/login` mientras Supabase rehidrata la sesión. El logout hace
`window.location.assign('/admin/login')` (recarga dura, no navegación de router) para limpiar
todo el estado en memoria.

**No hay chequeo de rol: cualquier usuario de ese Supabase Auth entra.** No hay equivalente a
`usuarios_backoffice` ni a `RutaProtegida`. Las cuentas se crean a mano en el dashboard de
Supabase; no hay alta ni recuperación desde la UI.

### Acceso a datos

Nada de queries sueltas en los componentes: las páginas solo llaman funciones de `src/data/`.

- `data/eventos.ts` — tipos de dominio (`Evento`, `Categoria`, `EstadoEvento`) y `mapEventoRow`.
- `data/admin-eventos-store.ts` — CRUD de eventos (`listAdminEventos`, `getAdminEventoBySlug`,
  `upsertAdminEvento`) y `slugify`.
- `data/reservaciones.ts` — `listReservaciones`, `getReservacionByFolio`, `validarBoleto`.

Convenciones de esa capa, importantes al tocarla:

- **La DB habla snake_case, la app camelCase.** Toda fila pasa por `mapEventoRow` /
  `mapReservacionRow`; los tipos `*Row` describen la forma cruda de Supabase y no salen de
  `src/data/`. Un campo nuevo se agrega en tres lugares: el tipo `Row`, el tipo de dominio y el
  mapper (y en `upsertAdminEvento` si es escribible).
- **Las fechas se formatean en el mapper, no en la vista.** `Evento.fechaBadge`, `fechaLarga`,
  `horario`, `precioLabel` y `Reservacion.reservadaEl` ya llegan como strings listos para
  pintar. `lib/fechas.ts` tiene los nombres de días/meses en español a mano (no usa `Intl`) y
  parsea `YYYY-MM-DD` componente por componente para evitar el corrimiento de zona horaria de
  `new Date('2026-01-01')`. `Evento.mes` es 0-indexado (compatible con `new Date`).
- **`upsertAdminEvento` distingue alta de edición por el argumento `existingId`**, no por el
  contenido del input.
- **`validarBoleto` es la operación crítica del negocio.** Marca el boleto con un `update`
  condicionado (`.neq('estado_boleto', 'validado')`): si dos escaneos simultáneos compiten,
  solo uno recibe fila y el otro cae al camino `ya-usado`. No lo simplifiques a un update
  directo — ahí es donde se evita revalidar un boleto ya usado.
- `precio` y `monto` llegan de Supabase como `number | string` (columnas numeric); los mappers
  hacen `Number(...)`. No asumas número crudo.

### Estilos

Design tokens en `src/theme.css` (Tailwind v4 `@theme`, importado una sola vez desde
`main.tsx`), idénticos a los de la landing. Nunca hardcodees un hex de marca en un componente:
usa las utilidades de Tailwind. Prefiere los tokens semánticos (`bg-card`,
`text-muted-foreground`, `border-border`) y baja a la escala de marca solo para acentos
(`bg-naranja-100`, `hover:bg-naranja-600`). `theme.css` define el variant `dark` y su paleta,
pero **no hay toggle** en esta app.

`cn()` (`src/lib/utils.ts`, `clsx` + `tailwind-merge`) es la forma estándar de componer clases
condicionales. Iconos: `lucide-react`.

### Páginas

Cada `Admin*Page.tsx` contiene la pantalla completa como árbol de componentes locales (el
sufijo `M` en un componente local significa "móvil", p. ej. `AdminTopbarM`). Sigue esa
convención en lugar de extraer componentes, salvo que algo se vuelva realmente reutilizable
entre pantallas. Esta app **no** usa la estructura `src/features/<feature>/` del backoffice.

Patrón de carga uniforme: `useState` + `useEffect` que llama la función de `src/data/` y apaga
un flag `cargando`. No hay react-query ni store global.

**Enlaces al sitio público** deben ser absolutos vía `VITE_SITIO_PUBLICO_URL` (ver
`SITIO_PUBLICO_URL` en `AdminLayout.tsx`): este admin no comparte dominio con la landing.

**QR**: `src/lib/qr.ts` genera el data URL (el detalle de reservación pinta el QR del folio) y
`jsqr` lo lee cuadro a cuadro desde `getUserMedia` en `AdminEscanearPage.tsx`, dibujando el
video en un `<canvas>` fuera del DOM. Esa pantalla maneja fallo de cámara
(`permiso-denegado` / `no-disponible`) con captura manual de folio como respaldo — cualquier
cambio ahí debe conservar ese camino, porque la cámara no funciona sin HTTPS o permiso.
(El backoffice resuelve su escáner con `@zxing/browser`; son implementaciones independientes.)

### Código heredado de la landing

Copiado tal cual y **sin usar**: `lib/sinergypay.ts`, `autorizarPago` / `confirmarPago` en
`data/reservaciones.ts` (invocan la edge function `reservar-pago`), `listEventosPublicados` /
`getEventoBySlug` en `data/eventos.ts` y `formatFechaHoraLarga`. Sobreviven porque
`noUnusedLocals` no aplica a exports. Existen para mantener paridad con `amena-landing`; no
construyas sobre ellos sin confirmar que es lo que se quiere.

La sección "Facturación" del menú (`NAV_FACTURACION`) son placeholders "Próximamente" sin ruta.

## Backend

Las migraciones, políticas RLS y edge functions de este producto viven en el repo
`amena-landing` (`supabase/`); acá solo se consume la API con la llave anon, así que los
permisos reales los define RLS de ese repo — si una query falla en silencio o devuelve vacío,
sospecha de RLS antes que del código. Un cambio de esquema hay que reflejarlo también en
`amena-landing`, que comparte estos módulos por copia.

## Deploy

**Todavía no está desplegada desde este monorepo.** El site de Firebase `amena-admin` ya lo
ocupa `apps/backoffice`; esta app necesita un site propio (p. ej. `amena-eventos`) más su
propio par de secrets de Supabase, porque el `deploy.yml` actual construye todas las apps con
un solo `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — los del otro proyecto. Hasta que eso
se resuelva, `firebase.json`, `.firebaserc` y `deploy.yml` no incluyen esta app.
