import {
  Bell,
  Building2,
  Check,
  ClipboardCheck,
  Pencil,
  Plus,
  ScanLine,
  Search,
  Settings,
  Trash2,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { Seccion } from './primitivos'

/**
 * Branding (sección Desarrollo → Branding): sistema de color, tipografía,
 * tamaños/espaciado e íconos. La fuente de verdad visual del design system.
 *
 * Estructura del color: PRINCIPALES (naranja/salvia) → TONALIDADES (escalas
 * derivadas) → TERCIARIOS de estado (success/warning/error/info) → SUPERFICIE (neutros).
 */
export function BrandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Fundamentos visuales del tema de Amena. Dos colores principales de marca, sus
        tonalidades derivadas y los colores terciarios de estado. En componentes, usar
        SIEMPRE el token/clase, nunca el hex.
      </p>

      <Principales />
      <Tonalidades />
      <Terciarios />
      <Superficie />
      <Tipografia />
      <Tamanos />
      <Iconos />
    </div>
  )
}

type Muestra = { paso: string; clase: string; hex: string; marca?: boolean }

// Escalas de tonalidades derivadas de los colores de marca. El paso 500 (marca) va marcado.
const ESCALA_NARANJA: Muestra[] = [
  { paso: '50', clase: 'bg-naranja-50', hex: '#fef5ec' },
  { paso: '100', clase: 'bg-naranja-100', hex: '#fde8d3' },
  { paso: '200', clase: 'bg-naranja-200', hex: '#fbd1a7' },
  { paso: '300', clase: 'bg-naranja-300', hex: '#f9b97a' },
  { paso: '400', clase: 'bg-naranja-400', hex: '#f8a354' },
  { paso: '500', clase: 'bg-naranja-500', hex: '#f68d2e', marca: true },
  { paso: '600', clase: 'bg-naranja-600', hex: '#e17615' },
  { paso: '700', clase: 'bg-naranja-700', hex: '#b95f11' },
  { paso: '800', clase: 'bg-naranja-800', hex: '#924a0e' },
  { paso: '900', clase: 'bg-naranja-900', hex: '#6e370b' },
]

const ESCALA_SALVIA: Muestra[] = [
  { paso: '50', clase: 'bg-salvia-50', hex: '#f5f7f0' },
  { paso: '100', clase: 'bg-salvia-100', hex: '#e8eddd' },
  { paso: '200', clase: 'bg-salvia-200', hex: '#d2dbbc' },
  { paso: '300', clase: 'bg-salvia-300', hex: '#bbc89c' },
  { paso: '400', clase: 'bg-salvia-400', hex: '#a6b586' },
  { paso: '500', clase: 'bg-salvia-500', hex: '#92a271', marca: true },
  { paso: '600', clase: 'bg-salvia-600', hex: '#78885a' },
  { paso: '700', clase: 'bg-salvia-700', hex: '#5e6b46' },
  { paso: '800', clase: 'bg-salvia-800', hex: '#454f33' },
  { paso: '900', clase: 'bg-salvia-900', hex: '#2e3522' },
]

const ESCALA_CREMA: Muestra[] = [
  { paso: '50', clase: 'bg-crema-50', hex: '#fcfaf5' },
  { paso: '100', clase: 'bg-crema-100', hex: '#f4efe3', marca: true },
  { paso: '200', clase: 'bg-crema-200', hex: '#e9e1cd' },
  { paso: '300', clase: 'bg-crema-300', hex: '#dbd0b4' },
  { paso: '400', clase: 'bg-crema-400', hex: '#c4b58f' },
  { paso: '500', clase: 'bg-crema-500', hex: '#a99873' },
]

const ESCALA_TINTA: Muestra[] = [
  { paso: '500', clase: 'bg-tinta-500', hex: '#6b675e' },
  { paso: '700', clase: 'bg-tinta-700', hex: '#4a473f' },
  { paso: '900', clase: 'bg-tinta-900', hex: '#2b2925' },
]

/** Un color principal de marca: bloque grande + nombre, hex y clases de uso. */
function TilePrincipal({
  nombre,
  hex,
  clase,
  clases,
  descripcion,
}: {
  nombre: string
  hex: string
  clase: string
  clases: string[]
  descripcion: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className={`h-20 w-full rounded-md border border-border ${clase}`} />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">{nombre}</p>
        <code className="font-mono text-xs text-muted-foreground">{hex}</code>
        <p className="text-xs text-muted-foreground">{descripcion}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {clases.map((c) => (
            <code
              key={c}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
            >
              {c}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}

function Principales() {
  return (
    <Seccion titulo="Colores principales">
      <div className="grid gap-4 sm:grid-cols-2">
        <TilePrincipal
          nombre="Primario — Naranja Acento"
          hex="#F68D2E"
          clase="bg-primary"
          clases={['bg-primary', 'bg-naranja-500']}
          descripcion="Acciones principales, botones, foco (ring) e identidad."
        />
        <TilePrincipal
          nombre="Secundario — Verde Salvia"
          hex="#92A271"
          clase="bg-salvia-500"
          clases={['bg-salvia-500']}
          descripcion="Segundo color de marca (identidad y acentos). El token secondary es un tinte claro derivado de este verde, no el verde puro."
        />
      </div>
    </Seccion>
  )
}

/** Rampa horizontal de tonalidades de una escala; marca el paso de marca (500). */
function Rampa({
  nombre,
  descripcion,
  escala,
}: {
  nombre: string
  descripcion: string
  escala: Muestra[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-medium">{nombre}</p>
        <p className="text-xs text-muted-foreground">{descripcion}</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {escala.map((m) => (
          <div key={m.paso} className="flex flex-col gap-1">
            <div
              className={`h-10 rounded-md border border-border ${m.clase} ${
                m.marca ? 'ring-2 ring-offset-2 ring-foreground ring-offset-card' : ''
              }`}
              title={m.marca ? 'Color de marca' : undefined}
            />
            <div className="text-center leading-tight">
              <code className="block font-mono text-[10px] font-medium">{m.paso}</code>
              <code className="block font-mono text-[9px] text-muted-foreground">{m.hex}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tonalidades() {
  return (
    <Seccion titulo="Tonalidades (derivadas de los principales)">
      <div className="flex flex-col gap-6">
        <Rampa
          nombre="Naranja (primario) · naranja-*"
          descripcion="Escala del color primario. El 500 es el naranja de marca #F68D2E."
          escala={ESCALA_NARANJA}
        />
        <Rampa
          nombre="Salvia (secundario) · salvia-*"
          descripcion="Escala del color secundario. El 500 es el verde de marca #92A271."
          escala={ESCALA_SALVIA}
        />
        <Rampa
          nombre="Crema (fondos y superficies) · crema-*"
          descripcion="Base cálida de la que derivan background, card y muted. El 100 es la crema de marca #F4EFE3."
          escala={ESCALA_CREMA}
        />
        <Rampa
          nombre="Tinta (texto) · tinta-*"
          descripcion="Neutro cálido para texto (foreground y variantes)."
          escala={ESCALA_TINTA}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Preferir siempre el token semántico (<code className="font-mono">bg-primary</code>,{' '}
        <code className="font-mono">text-muted-foreground</code>…). Las escalas crudas
        (<code className="font-mono">bg-salvia-600</code>…) solo para casos donde el token
        semántico no alcanza (gráficas, ilustraciones, acentos de marca).
      </p>
    </Seccion>
  )
}

type Estado = { nombre: string; clase: string; claseFg: string; hex: string; uso: string }

// Terciarios: colores de estado. Hues semánticos fijos, cada uno con su foreground.
const ESTADOS: Estado[] = [
  {
    nombre: 'success',
    clase: 'bg-success',
    claseFg: 'text-success-foreground',
    hex: '#63B079',
    uso: 'Validado, pagado, activo',
  },
  {
    nombre: 'warning',
    clase: 'bg-warning',
    claseFg: 'text-warning-foreground',
    hex: '#F2B441',
    uso: 'Advertencias, por vencer',
  },
  {
    nombre: 'error (destructive)',
    clase: 'bg-error',
    claseFg: 'text-error-foreground',
    hex: '#CF5644',
    uso: 'Errores, acciones destructivas',
  },
  {
    nombre: 'info',
    clase: 'bg-info',
    claseFg: 'text-info-foreground',
    hex: '#6EA6E6',
    uso: 'Información neutra',
  },
]

function Terciarios() {
  return (
    <Seccion titulo="Colores terciarios (estado)">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ESTADOS.map((e) => (
          <div key={e.nombre} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <div
              className={`flex h-16 items-center justify-center rounded-md ${e.clase} ${e.claseFg}`}
            >
              <span className="text-sm font-semibold">Ejemplo</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">{e.nombre}</p>
              <code className="font-mono text-xs text-muted-foreground">{e.hex}</code>
              <p className="text-xs text-muted-foreground">{e.uso}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Cada estado trae su color de texto pareja (
        <code className="font-mono">text-success-foreground</code>, etc.).{' '}
        <code className="font-mono">error</code> es alias de{' '}
        <code className="font-mono">destructive</code> (mismo rojo).
      </p>
    </Seccion>
  )
}

type Superficie = { nombre: string; clase: string; borde?: boolean; uso: string }

// Superficie / UI: neutros del sistema (derivan de crema/tinta vía el export en oklch).
const SUPERFICIES: Superficie[] = [
  { nombre: 'background', clase: 'bg-background', borde: true, uso: 'Fondo de página (crema)' },
  { nombre: 'card', clase: 'bg-card', borde: true, uso: 'Tarjetas y contenedores' },
  { nombre: 'muted', clase: 'bg-muted', uso: 'Fondos sutiles, estados neutros' },
  { nombre: 'secondary', clase: 'bg-secondary', uso: 'Botones/badges secundarios (tinte salvia)' },
  { nombre: 'accent', clase: 'bg-accent', uso: 'Hovers y resaltados (naranja suave)' },
  { nombre: 'border', clase: 'bg-border', uso: 'Bordes y separadores' },
  { nombre: 'foreground', clase: 'bg-foreground', uso: 'Texto principal' },
]

function Superficie() {
  return (
    <Seccion titulo="Superficie y UI (neutros)">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SUPERFICIES.map((s) => (
          <div key={s.nombre} className="flex items-center gap-3">
            <div className={`size-10 shrink-0 rounded-lg border border-border ${s.clase}`} />
            <div className="min-w-0">
              <code className="block truncate font-mono text-xs font-medium">
                bg-{s.nombre.split(' ')[0]}
              </code>
              <p className="truncate text-xs text-muted-foreground">{s.uso}</p>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Tipografia() {
  return (
    <Seccion titulo="Tipografía">
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-semibold tracking-tight">Título grande · text-2xl</p>
        <p className="text-xl font-semibold tracking-tight">Título de página · text-xl</p>
        <p className="text-base font-medium">Subtítulo · text-base</p>
        <p className="text-sm">Texto de cuerpo · text-sm</p>
        <p className="text-sm text-muted-foreground">Texto secundario · text-muted-foreground</p>
        <p className="text-xs text-muted-foreground">Texto pequeño · text-xs</p>
        <p className="font-mono text-sm tabular-nums">
          $1,234.50 · ID-00421 · font-mono (montos e IDs)
        </p>
      </div>
    </Seccion>
  )
}

const ESPACIOS = [
  { clase: 'w-1', nombre: 'spacing-1' },
  { clase: 'w-2', nombre: 'spacing-2' },
  { clase: 'w-3', nombre: 'spacing-3' },
  { clase: 'w-4', nombre: 'spacing-4' },
  { clase: 'w-6', nombre: 'spacing-6' },
  { clase: 'w-8', nombre: 'spacing-8' },
]

const RADIOS = [
  { clase: 'rounded-sm', nombre: 'sm' },
  { clase: 'rounded-md', nombre: 'md' },
  { clase: 'rounded-lg', nombre: 'lg' },
  { clase: 'rounded-2xl', nombre: '2xl' },
  { clase: 'rounded-full', nombre: 'full' },
]

function Tamanos() {
  return (
    <Seccion titulo="Tamaños: espaciado y radios">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Escala de espaciado</p>
          {ESPACIOS.map((e) => (
            <div key={e.nombre} className="flex items-center gap-3">
              <div className={`h-3 rounded-sm bg-primary ${e.clase}`} />
              <code className="font-mono text-xs text-muted-foreground">{e.nombre}</code>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Radios de borde</p>
          <div className="flex flex-wrap gap-4">
            {RADIOS.map((r) => (
              <div key={r.nombre} className="flex flex-col items-center gap-1.5">
                <div className={`size-12 border border-border bg-muted ${r.clase}`} />
                <code className="font-mono text-xs text-muted-foreground">{r.nombre}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Seccion>
  )
}

const ICONOS = [
  { Icono: ScanLine, nombre: 'ScanLine' },
  { Icono: Building2, nombre: 'Building2' },
  { Icono: UtensilsCrossed, nombre: 'UtensilsCrossed' },
  { Icono: Users, nombre: 'Users' },
  { Icono: ClipboardCheck, nombre: 'ClipboardCheck' },
  { Icono: Settings, nombre: 'Settings' },
  { Icono: Plus, nombre: 'Plus' },
  { Icono: Pencil, nombre: 'Pencil' },
  { Icono: Trash2, nombre: 'Trash2' },
  { Icono: Search, nombre: 'Search' },
  { Icono: Bell, nombre: 'Bell' },
  { Icono: Check, nombre: 'Check' },
]

function Iconos() {
  return (
    <Seccion titulo="Íconos (lucide-react)">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {ICONOS.map(({ Icono, nombre }) => (
          <div
            key={nombre}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center"
          >
            <Icono className="size-5 text-foreground" />
            <code className="font-mono text-[11px] text-muted-foreground">{nombre}</code>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Tamaño por clase (<code className="font-mono">size-4</code>,{' '}
        <code className="font-mono">size-5</code>), nunca px. Decorativos con{' '}
        <code className="font-mono">aria-hidden</code>.
      </p>
    </Seccion>
  )
}
