# CLAUDE.md — amena-front

Monorepo de frontends del sistema de planes de alimentación corporativos de Amena. Dos aplicaciones web (React + Vite) que comparten paquetes internos. El backend vive en el repo `amena-backend` (Supabase).

## Contexto obligatorio

El contexto de negocio vive en el repo `amena-backend/docs/` (resumen de plataforma, modelo de datos, flujos). Si la tarea involucra lógica de negocio y el contexto no está claro, detenerse y preguntar — no improvisar decisiones de negocio.

## Estructura

```
apps/
  backoffice/        # backoffice.amena.com — personal interno (super_admin, mesero, finanzas)
  portal/            # app.amena.com — admins de empresa y colaboradores
packages/
  ui/                # componentes shadcn/ui con el branding de Amena (tokens en Tailwind)
  supabase/          # cliente de Supabase + tipos TypeScript generados del esquema
  utils/             # utilidades puras: fechas, semanas, formateo de moneda
```

> **Los módulos de eventos son otro producto dentro del backoffice.** `features/eventos`,
> `features/reservaciones` y `features/escaner-boletos` administran el sitio público
> `amena.social` (eventos, reservaciones y boletos QR), no los planes de alimentación.
> Sus tablas viven en el **schema `eventos`** de `amena-backend`, no en `public` — misma
> instancia de Supabase, otro namespace, porque `public` ya tiene su propia `facturas`,
> distinta. Se consultan con `supabase.schema('eventos')`; `pnpm gen:types` genera los dos
> schemas.
>
> **Ser admin de eventos no es "estar autenticado".** Como `auth.users` se comparte con
> backoffice y portal, el acceso se decide con `usuarios_backoffice.rol = 'eventos'` (o
> `super_admin`), vía `eventos.es_admin()`. Toda policy nueva de ese schema debe usar ese
> helper, nunca `using (true)`.
>
> **El backend de estos módulos ya existe, en la rama `eventos` de `amena-backend`** (schema,
> RLS, seed y las 3 edge functions: `reservar-pago`, `google-wallet-boleto`,
> `facturar-consumo`). El sitio público es la rama `eventos` de `landing-amena`, apuntada al
> mismo proyecto con `db.schema = 'eventos'`. **Para arrancar en local, la checklist y las
> trampas están en el CLAUDE.md de `amena-backend` → "Eventos — puesta en marcha"**: secrets,
> orden de pasos y la prueba de punta a punta (reservar en la landing → verla en
> `/eventos/reservaciones` → abrir el pase → escanear en `/eventos/escanear`).
>
> Del lado del front no falta nada para conectar. Sí falta, y es aparte: el test de
> `validarBoleto` (regla 4 — es el update condicionado que evita revalidar un boleto en la
> puerta), y las pantallas de "Facturas emitidas" y "Códigos de consumo", que ya tienen tablas,
> RPCs y datos de seed esperándolas.

## Reglas de oro

1. **Terminología:** "**colaborador**" es un **rol** del portal; la persona que come es un "**comensal**" (entidad `comensales`, con su QR = `credenciales_qr.qr_token`). Nunca "empleado". Los ids de tablas propias son `int8` → `number` en TS (no `string`/uuid); `user_id` y `qr_token` siguen siendo uuid (`string`).
   - **Terminología cerrada — se usa CORTE (no 'cierre') en toda la stack: base de datos, código, UI, textos y documentación. Esta decisión no se re-abre sin cambio de negocio explícito del owner. Nombres canónicos: `cortes_semanales` (tabla), `generar_corte_semanal` (función), `corte-semanal` (edge function), `/cortes` (ruta).**
2. **Código compartido va en `packages/`**, nunca duplicado entre apps. Si dos apps necesitan lo mismo, es un paquete.
3. **Los tipos de la base de datos no se escriben a mano.** Se generan con `pnpm gen:types` (requiere el stack local de `amena-backend` corriendo). Si un tipo no existe, el cambio va primero en el backend.
4. **Toda lógica no trivial lleva test** (Vitest + Testing Library). Correr `pnpm test` antes de dar por terminada cualquier tarea.
5. **Componentes de UI:** usar los de `packages/ui` (shadcn). No instalar librerías de componentes nuevas sin consultar.
6. **Estilos solo con Tailwind** usando los tokens del tema — no colores hardcodeados, no CSS suelto.
7. **Roles y acceso:** cada app valida el rol del usuario contra su tabla (`usuarios_backoffice` para backoffice, `usuarios_portal_empresarial`/`colaboradores` para portal). La seguridad real vive en RLS del backend — la UI solo oculta, nunca es la única barrera.
8. **No usar `localStorage` para estado sensible.** La sesión la maneja el cliente de Supabase.

## Comandos

```bash
pnpm install                 # instalar todo el workspace
pnpm dev                     # ambas apps en modo dev (backend LOCAL: localhost:54331)
pnpm dev:backoffice          # solo backoffice
pnpm dev:portal              # solo portal
pnpm prod                    # front LOCAL contra el backend de PROD (Supabase Cloud); backoffice :5184 / portal :5183
pnpm prod:backoffice         # solo backoffice contra prod
pnpm prod:portal             # solo portal contra prod
pnpm build                   # build de todo (Turborepo cachea lo no afectado)
pnpm test                    # tests de todo el workspace
pnpm lint                    # lint de todo el workspace
pnpm gen:types               # regenerar tipos desde el esquema local de Supabase
```

## Convenciones de código

- Componentes por feature: `src/features/<feature>/` dentro de cada app (ej. `features/escaner/`, `features/colaboradores/`)
- Los tests viven junto al código: `Componente.tsx` + `Componente.test.tsx`
- Idioma: código y comentarios en español; nombres de variables descriptivos
- Una rama de módulo = una unidad de trabajo coherente. No mezclar módulos (ver Flujo de ramas)

## Verificación

> **Cambio en prueba (2026-07-17) — evaluar tras módulos 4.7 y 4.8.**

- **Automática (obligatoria, sin cambios):** `pnpm test` (Vitest), `pnpm build` y `pnpm lint` en verde por cada unidad de trabajo **antes del merge**. Son rápidos y no negociables. El CI **ya no corre en `dev`** (solo al tocar `main`: PR de release + push a `main`), así que estos checks locales antes del merge y el **PR de release** son la red de seguridad.
- **Visual con Puppeteer: FUERA de la rutina de módulos.** La revisión visual la hace **Cristian** al cierre de cada módulo — no se generan capturas por defecto.
  - **Excepción:** usar Puppeteer solo cuando la verificación requiera una simulación que el humano no pueda hacer fácilmente (p. ej. cámara falsa para el escáner, estados difíciles de reproducir). **Avisar antes de usarlo y explicar por qué.**
- **Guía de revisión (obligatoria en el resumen final de cada módulo):** para que Cristian revise, incluir por cada pantalla nueva o modificada:
  1. **Ruta/URL** de la pantalla.
  2. **Con qué usuario del seed** probarla (email/contraseña).
  3. **Qué verificar** — 2-3 puntos concretos.
  4. **En qué anchos** según la app: **portal → 375 primero**; **backoffice → 1280 primero** (y tablet 768–1024 si aplica, p. ej. el escáner).

## Flujo de ramas

- **`main`**: solo producción. Refleja lo desplegado. Los workflows de deploy/push a producción están atados a `main`.
- **`dev`**: rama de integración. Todo el trabajo se acumula aquí antes de un release.
- **Ramas de trabajo**: nombradas por el **módulo** que tocan (`backoffice`, `portal`, `menu`, `modelo-datos`, etc.). Vida corta: se crean desde `dev` actualizado y se borran al integrarse.

**Integrar un módulo a `dev`** — merge **directo, sin PR**:

```bash
git checkout dev && git pull            # dev actualizado
git checkout -b <modulo>                # trabajar
# ... commits ...
pnpm build && pnpm test                 # OBLIGATORIO: ambos en verde localmente
git checkout dev && git merge <modulo> && git push
git branch -d <modulo>                  # borrar rama al integrar
```

**Llevar `dev` a producción** — única forma de tocar `main`: **PR de release `dev → main`** (pasa por el CI y el ruleset de `main`). Nunca se commitea ni se mergea a `main` fuera de ese PR.

### Reglas duras

1. **Nunca commitear directo a `dev`.** Todo cambio entra por una rama de módulo.
2. **Nunca mergear a `dev` con tests o build rotos.** `pnpm build` y `pnpm test` en verde localmente es requisito previo al merge.
3. **Jamás tocar `main` directamente.** `main` solo avanza vía PR de release desde `dev`; ninguna rama de módulo se mergea a `main`.

## Ambientes

- **`pnpm dev`** (mode `development`) → `.env.local`: apunta al Supabase **local** de `amena-backend` (`http://localhost:54331`). Puertos backoffice 5174 / portal 5173.
- **`pnpm prod`** (mode `prod`, Vite `--mode prod`) → `.env.prod` (gitignored, local por app): front local contra el **Supabase Cloud de producción**. Puertos backoffice 5184 / portal 5183, así que puede correr **a la vez** que `pnpm dev` sin chocar. ⚠️ Escribe en la BD real de prod.
- **Build/deploy** (mode `production`) → usa los secrets de GitHub (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`) en el workflow, no un `.env` local. Nombre de mode distinto (`prod` ≠ `production`) para no interferir con el build.
- Deploy: Firebase Hosting (proyecto `amena-20df0`), un site por app (backoffice / portal), al mergear `dev → main` (`.github/workflows/deploy.yml`).
- **Los módulos de eventos se despliegan con el backoffice**, en el mismo site de Firebase. Ya no necesitan site aparte: al vivir dentro de `apps/backoffice` comparten build y secrets. Lo que sí falta es subir el schema `eventos` al Supabase de producción (`supabase db push`) y agregar `eventos` a `api.schemas` del `config.toml` de prod — sin eso PostgREST no lo sirve y las pantallas devuelven 404.
