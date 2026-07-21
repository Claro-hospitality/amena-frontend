---
name: amena-ui
description: Estándares obligatorios de UI/UX para el frontend de Amena. Usar SIEMPRE que se implementen componentes, pantallas, features de interfaz, formularios, tablas, obtención de datos, o cualquier cambio visual en apps/backoffice o apps/portal. Cubre: componentes de @amena/ui (shadcn sobre Base UI), tokens del tema, estado de servidor (TanStack Query), formularios (Base UI + zod + useActionState), patrones de UX (carga/vacío/error), manejo de errores con Sentry, testing de UI, estrategia responsive (portal = mobile-first, backoffice = desktop-first) y referencias a la doc oficial de shadcn (variante Base UI).
---

# Estándares de UI/UX — Amena Frontend

> Stack real: React 19.2 · Vite 8 · TypeScript 6 · Tailwind 4 · React Router 7 · TanStack Query · Vitest 3 + Testing Library · Sentry. Kit `@amena/ui` = shadcn (estilo base-rhea) sobre **`@base-ui/react`** (Base UI, no Radix).

## 1. Componentes: solo @amena/ui

- **Todo control de interfaz sale de `@amena/ui`**. Nunca `<button>`, `<input>`, `<select>` o `<table>` crudos; nunca librerías de componentes nuevas.
- El kit está construido sobre **Base UI** (`@base-ui/react`), no Radix. La accesibilidad de foco/teclado/ARIA la aportan esos primitivos — no la reimplementes a mano.
- Antes de usar un componente, consulta su doc oficial en la **variante Base UI** de shadcn (ver §10 Referencias). El API real en este repo es el del archivo local en `packages/ui/src/components/ui/<componente>.tsx` — esa es la fuente de verdad si difiere de la doc.
- Si el componente necesario no existe en `packages/ui`, se agrega con el CLI de shadcn en la misma rama (`pnpm dlx shadcn@latest add <componente>`) — jamás se construye a mano un equivalente.
- Composiciones del catálogo antes que inventos: `combobox` para búsqueda+selección, `table` (+ `pagination`/`scroll-area`) para tablas, `calendar` para fechas, `command` para paletas de búsqueda, `chart` (recharts) para gráficas.
- Los componentes NO se modifican en `packages/ui` para un caso puntual de una app; se componen o extienden en la app. Solo se edita el componente base si el cambio aplica a todo el sistema (y se reporta).
- Iconos: solo `lucide-react`. Tamaño vía clases (`size-4`, `size-5`), nunca px sueltos. Iconos decorativos con `aria-hidden`; iconos-botón con `aria-label` o `tooltip`.

## 2. Tema: tokens siempre, valores nunca

- Colores SOLO vía tokens del tema (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `bg-warning`...). Prohibido hardcodear hex, rgb, o clases de paleta Tailwind cruda (`bg-orange-500` ❌).
- Las escalas de marca (`naranja-*`, `salvia-*`, `crema-*`, `tinta-*`) existen para casos donde los tokens semánticos no alcanzan (gráficas custom, ilustraciones) — preferir siempre el token semántico.
- Estados de negocio: validado/pagado/activo → `success`; advertencias/por vencer → `warning`; errores/rechazos/destructivo → `destructive`.
- Los inputs son "filled" por el override global del tema — no agregar bordes ni fondos custom a campos de formulario.
- Tipografía: la del tema (Geist). Montos, folios e IDs en `font-mono`. No importar fuentes.
- `theme.css` es intocable desde tareas de features.
- **Dark mode: fuera de alcance por ahora.** El tema tiene tokens de modo oscuro pero aún no se cablea en las apps. No agregar toggles ni asumir soporte. Aun así, usar solo tokens semánticos deja el dark mode "gratis" para cuando se active — hardcodear un color lo rompe.

### Superficies y jerarquía visual (cards, tablas, secciones)

Regla del proyecto, obligatoria en **ambas apps** (backoffice y portal):

- **Contraste por superficie, no por sombra.** Todo contenedor que agrupa componentes (card de tabla, formulario, sección) debe distinguirse del fondo de la página por **superficie + borde**, jamás por sombra:
  - Página = `bg-background` (crema, `--background`). Contenedor = `bg-card` (blanco, `--card`) + `border border-border`.
  - **Nunca** dejar el contenedor transparente: se funde con la página (bug real corregido en `/empresas`). Si envuelves una tabla/lista/form, dale `bg-card`.
- **Cero sombras.** Prohibido `shadow-*` en cards/contenedores que agrupan componentes — la jerarquía se logra con superficie y borde. ⚠️ El componente base `<Card>` de `@amena/ui` trae `shadow-sm` propio: al usarlo, anúlalo con `shadow-none`.
- **Toolbar dentro del card.** Buscadores, filtros y acciones de una tabla van **dentro** del mismo card que agrupa la tabla (barra superior separada por `border-b`), no sueltos sobre la página. El `DataTable` del backoffice acepta un prop `toolbar` para esto.
- **"Sin resultados" ≠ "vacío total".** Una búsqueda/filtro sin coincidencias muestra su mensaje **dentro** de la tabla (el buscador permanece visible, no se atrapa al usuario); el estado `empty` con CTA (§5) se reserva para cuando no existe ningún dato aún.

## 3. Datos: estado de servidor con TanStack Query

**Norma ratificada del proyecto.** Los datos que vienen de Supabase son **estado de servidor**, no estado local, y se manejan con **TanStack Query** (`@tanstack/react-query`). No se manejan con `useState` + `useEffect`.

- **Toda lectura va por `useQuery`; toda escritura por `useMutation`.** Prohibido llamar a Supabase dentro de un `useEffect` para llenar un `useState` — jamás.
- **Invalidar tras cada mutación exitosa**: `queryClient.invalidateQueries({ queryKey })` en `onSuccess` — no refrescar a mano. `queryKey` estable y descriptiva, con sus dependencias (`['colaboradores', empresaId]`).
- **Capa de datos por feature**: las funciones que tocan Supabase viven en `features/<x>/api.ts`, tipadas con los tipos generados de **`@amena/supabase`**; los hooks (`useQuery`/`useMutation`) en `features/<x>/queries.ts`. El componente solo consume el hook.
- `isLoading` / `isError` / `data` vacío alimentan directamente los patrones de UX (sección 5).
- La app monta un `QueryClientProvider` en su entrada; las excepciones inesperadas las captura un `ErrorBoundary` a nivel ruta que reporta a Sentry (sección 5).
- UI optimista (`useMutation` con `onMutate`, o `useOptimistic` de React 19) en acciones frecuentes del mesero (marcar consumo, validar QR).

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ['colaboradores', empresaId],
  queryFn: () => listarColaboradores(empresaId),
})
```

## 4. Formularios: Base UI Form + zod + useActionState

Patrón único, aprovechando Base UI y React 19 (no usamos react-hook-form):

- Schema de validación con **`zod`**; los mensajes de error del schema en **español**.
- Submit con **`useActionState`** (React 19): valida con zod, y si falla devuelve los errores por campo; si pasa, ejecuta la mutación (sección 3).
- Estructura visual con `<Form>` + `field`/`label` de `@amena/ui`. Errores debajo de cada campo.
- Deshabilitar el submit mientras `pending`; feedback de éxito/error por `sonner` (sección 5).
- Errores del servidor mapeados al campo correspondiente cuando sea posible; si no, toast.

```tsx
const [state, action, pending] = useActionState(async (_prev, fd) => {
  const parsed = schema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }
  await crearColaborador(parsed.data) // mutación (useMutation) → invalida la cache de TanStack Query (sección 3)
  return { ok: true }
})
```

> `zod` ya está instalado (se agregó en el módulo empresas); reutilizarlo.

## 5. Patrones de UX obligatorios

Toda pantalla o feature debe resolver estos estados — no son opcionales:

- **Carga**: `skeleton` con la forma del contenido real (no spinners genéricos a pantalla completa; `spinner` solo para acciones puntuales en botones). Para carga a nivel ruta, preferir `React.lazy` + `Suspense`.
- **Vacío**: componente `empty` con mensaje útil y, si aplica, la acción para crear el primer elemento ("Aún no hay colaboradores — Agregar colaborador").
- **Error**: distinguir dos tipos:
  - *Esperados* (validación, 4xx, permisos): mensaje claro en español con qué hacer; errores de mutación via toast (`sonner`), errores de carga con estado en pantalla y opción de reintentar (`refetch`).
  - *Inesperados* (excepciones): capturados por un **`ErrorBoundary`** a nivel ruta que reporta a **Sentry** (`@sentry/react`) y muestra un fallback amable. Nunca dejar que una excepción tumbe la app en blanco.
- **Éxito**: feedback inmediato via `sonner` tras crear/editar/eliminar.
- **Acciones destructivas** (desactivar, eliminar, cancelar factura): SIEMPRE `alert-dialog` de confirmación que nombre el objeto afectado ("¿Desactivar a María López?").
- **Accesibilidad**: todo campo con `label`; iconos-botón con `tooltip` o `aria-label`; el foco visible ya lo da el tema (ring naranja) — no suprimirlo jamás. El manejo de foco/teclado en diálogos y menús lo da Base UI.
- **Textos**: español de México, tono directo y cálido (voz de marca), "colaboradores" nunca "empleados".
- **Formateo**: fechas, semanas y montos SIEMPRE vía `@amena/utils` (con `date-fns` + locale es-MX). Prohibido `toLocaleString`/formateo inline en componentes — si falta una utilidad, se agrega al paquete.

## 6. Responsive: estrategia POR APP

Tailwind es mobile-first por naturaleza (los breakpoints `sm:`, `md:`, `lg:` son min-width). La estrategia define QUÉ diseño es el principal y en qué orden se diseña y verifica:

### apps/portal → MOBILE FIRST
Los colaboradores y admins de empresa lo usarán mayormente desde el teléfono.
- Diseñar primero la vista móvil (~375px): las clases base (sin prefijo) describen el móvil.
- Después adaptar hacia arriba con `sm:` / `md:` / `lg:` (tablet y escritorio).
- Patrones: navegación colapsada en móvil, listas tipo card en móvil que pueden volverse tabla en `md:+`, touch targets ≥44px, el QR del colaborador protagonista a pantalla completa en móvil.
- Orden de verificación: 375px → 768px → 1280px.

### apps/backoffice → DESKTOP FIRST
El personal de Amena lo opera desde computadora; el mesero desde tablet/dispositivo fijo.
- Diseñar primero la vista de escritorio (~1280px+): densidad de información, tablas completas, sidebar expandido.
- Después degradar con elegancia: tablet (~768px, prioridad alta por el dispositivo del mesero — el escáner DEBE ser excelente en tablet) y móvil al final (funcional, sin pixel-perfection).
- En código sigue siendo Tailwind min-width: la clase base describe el móvil funcional simple y los prefijos construyen hacia el diseño desktop completo — pero el diseño se piensa y se pule desde desktop hacia abajo.
- Orden de verificación: 1280px → 768px → 375px.

### Reglas comunes
- Nada de anchos fijos en px para layouts; usar grid/flex con los tokens de spacing.
- Ninguna pantalla con scroll horizontal en ningún breakpoint.
- Tablas largas en pantallas chicas: `scroll-area` horizontal contenido o transformación a cards.

## 7. Testing de UI (Vitest + Testing Library)

Toda lógica de UI no trivial lleva test junto al componente (`Componente.tsx` + `Componente.test.tsx`):

- Consultar por **rol y nombre accesible** (`getByRole('button', { name: /guardar/i })`), no por texto frágil ni por clases/test-ids salvo último recurso.
- Simular interacción con **`@testing-library/user-event`**, no `fireEvent`.
- Testear **comportamiento observable** (qué ve y hace el usuario), no detalles de implementación ni estado interno.
- Mockear el cliente de Supabase y envolver en el `QueryClientProvider` de prueba; testear los estados de carga, vacío, error y éxito.
- Aserciones de formularios: mensajes de validación en español visibles, submit deshabilitado mientras envía.

## 8. Performance

- Rutas con **`React.lazy` + `Suspense`** (code-splitting por ruta). No cargar todo en el bundle inicial.
- `recharts`/`chart` es pesado: importarlo solo en las pantallas que lo usan, nunca en barriles compartidos.
- Imágenes y media con `aspect-ratio` para evitar layout shift.
- No optimizar de más: memoizar (`useMemo`/`memo`) solo ante un problema medido, no por defecto.

## 9. Checklist antes de dar por terminada cualquier tarea de UI

1. ¿Todos los controles vienen de @amena/ui? ¿Cero HTML crudo de formulario?
2. ¿Cero colores hardcodeados? (buscar `#`, `rgb(`, clases de paleta cruda en el diff)
3. ¿Los datos van por TanStack Query (`useQuery`/`useMutation`, sin `useEffect`+`useState`)? ¿Las mutaciones invalidan la cache?
4. ¿Estados de carga, vacío y error resueltos? ¿Errores inesperados con ErrorBoundary + Sentry?
5. ¿Acciones destructivas con confirmación? ¿Mutaciones con toast de éxito/error?
6. ¿Fechas/montos formateados vía @amena/utils (nada inline)?
7. ¿Verificado en los 3 breakpoints EN EL ORDEN de la app correspondiente?
8. ¿Textos en español, con "colaboradores"?
9. ¿Superficies correctas: los cards que agrupan componentes usan `bg-card` + borde (nunca transparentes ni con sombra), y los buscadores/toolbars van dentro del card? (§2)
10. ¿Tests de UI por rol/comportamiento? ¿pnpm build, test y lint en verde?

## 10. Referencias externas

Consultar SIEMPRE antes de construir un componente o una pantalla nueva. Al implementar, usa WebFetch sobre la URL exacta del componente para traer su API y ejemplos.

### Doc de componentes — shadcn, variante Base UI (la de este repo)

- **Patrón de URL:** `https://ui.shadcn.com/docs/components/base/<componente>`
  - ⚠️ Usar SIEMPRE el segmento `/base/` — es la variante sobre `@base-ui/react` (base-rhea), la que usa `@amena/ui`. La ruta sin `/base/` es la de **Radix** y su API difiere.
  - Ejemplos: `.../base/button`, `.../base/data-table`, `.../base/combobox`, `.../base/field`, `.../base/sidebar`, `.../base/sonner`, `.../base/calendar`.
- **Guías generales:**
  - Theming / tokens: `https://ui.shadcn.com/docs/theming` (referencia; en este repo el tema ya está fijo en `theme.css`, no se toca)
  - Data Table (tablas con orden/filtro/paginación): `https://ui.shadcn.com/docs/components/base/data-table`
  - Date Picker: `https://ui.shadcn.com/docs/components/base/date-picker`
- **Regla de precedencia:** la doc oficial explica *qué* componente usar y *cómo* se compone; el **API real** de este proyecto es el componente local en `packages/ui/src/components/ui/`. Si difieren, gana el local.

### Ejemplos de layout — inspiración

- **`https://shadcnexamples.com/blocks`** — bloques/plantillas de página (dashboards de admin, autenticación, settings, file manager, listas de productos, POS, pricing, etc.). Útil para decidir la **estructura de layout** de pantallas de Amena (p. ej. el dashboard del backoffice o el POS del mesero se parecen a "Admin Dashboard" y "Point of Sale").
- ⚠️ **Solo inspiración, no copiar/pegar:** esos bloques están hechos con **Radix + Next.js**. Reimplementar SIEMPRE con `@amena/ui` (Base UI), los tokens del tema (§2) y la estrategia responsive por app (§6). Nunca traer sus colores, fuentes ni dependencias.

### Cómo usar estas referencias en una tarea

1. Identifica qué componentes del catálogo (§1) necesita la pantalla.
2. WebFetch la doc `/base/<componente>` de cada uno para ver props y composición correctas.
3. Si es una pantalla nueva, revisa `shadcnexamples.com/blocks` para el layout y adáptalo a los estándares de este skill.
4. Verifica el API contra el componente local antes de escribir código.
