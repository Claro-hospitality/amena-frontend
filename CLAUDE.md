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

## Reglas de oro

1. **Terminología:** "**colaborador**" es un **rol** del portal; la persona que come es un "**comensal**" (entidad `comensales`, con su QR = `credenciales_qr.qr_token`). Nunca "empleado". Los ids de tablas propias son `int8` → `number` en TS (no `string`/uuid); `user_id` y `qr_token` siguen siendo uuid (`string`).
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
pnpm dev                     # ambas apps en modo dev
pnpm dev:backoffice          # solo backoffice
pnpm dev:portal              # solo portal
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

- **Automática (obligatoria, sin cambios):** `pnpm test` (Vitest), `pnpm build` y `pnpm lint` en verde por cada unidad de trabajo **antes del merge**. Son rápidos y no negociables. El **CI en `dev`** es la red de seguridad.
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

- `.env.local` → desarrollo: apunta al Supabase local del repo `amena-backend` (API en `http://localhost:54331`)
- `.env.production` → producción: apunta al proyecto "Amena" de Supabase Cloud
- Deploy: Firebase Hosting, un site por app (backoffice y portal)
