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

1. **Terminología:** se dice "colaboradores", nunca "empleados" — en código, UI y comentarios.
2. **Código compartido va en `packages/`**, nunca duplicado entre apps. Si dos apps necesitan lo mismo, es un paquete.
3. **Los tipos de la base de datos no se escriben a mano.** Se generan con `pnpm gen:types` (requiere el stack local de `amena-backend` corriendo). Si un tipo no existe, el cambio va primero en el backend.
4. **Toda lógica no trivial lleva test** (Vitest + Testing Library). Correr `pnpm test` antes de dar por terminada cualquier tarea.
5. **Componentes de UI:** usar los de `packages/ui` (shadcn). No instalar librerías de componentes nuevas sin consultar.
6. **Estilos solo con Tailwind** usando los tokens del tema — no colores hardcodeados, no CSS suelto.
7. **Roles y acceso:** cada app valida el rol del usuario contra su tabla (`usuarios_internos` para backoffice, `usuarios_empresa`/`colaboradores` para portal). La seguridad real vive en RLS del backend — la UI solo oculta, nunca es la única barrera.
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
- Un PR = una unidad revisable. No mezclar features

## Ambientes

- `.env.local` → desarrollo: apunta al Supabase local del repo `amena-backend` (API en `http://localhost:54331`)
- `.env.production` → producción: apunta al proyecto "Amena" de Supabase Cloud
- Deploy: Firebase Hosting, un site por app (backoffice y portal)
