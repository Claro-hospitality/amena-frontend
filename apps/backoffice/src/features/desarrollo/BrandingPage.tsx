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
 * Branding (sección Desarrollo → Branding): tokens de color, tipografía,
 * tamaños/espaciado e íconos. La fuente de verdad visual del design system.
 */
export function BrandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Fundamentos visuales del tema de Amena: colores, tipografía, tamaños e íconos. Usar
        siempre los tokens, nunca valores hardcodeados.
      </p>

      <TokensColor />
      <Tipografia />
      <Tamanos />
      <Iconos />
    </div>
  )
}

type TokenColor = { nombre: string; clase?: string; hex?: string; codigo?: string }

// Los 3 colores PRINCIPALES de la identidad de marca (Amena Brand Book), con su hex REAL
// (escala de marca: --color-naranja/salvia/crema). Se muestran con su hex exacto.
const COLORES_MARCA: TokenColor[] = [
  { nombre: 'Naranja Acento', hex: '#F68D2E', codigo: 'naranja-500' },
  { nombre: 'Verde Salvia', hex: '#92A271', codigo: 'salvia-500' },
  { nombre: 'Crema Base', hex: '#F4EFE3', codigo: 'crema-100' },
]

// Tokens semánticos del sistema (lo que consumen los componentes). Derivan de la paleta;
// algunos son tintes claros del color de marca (p. ej. secondary = salvia claro), NO el
// color de marca puro.
const TOKENS_SISTEMA: TokenColor[] = [
  { nombre: 'primary', clase: 'bg-primary' },
  { nombre: 'secondary', clase: 'bg-secondary' },
  { nombre: 'accent', clase: 'bg-accent' },
  { nombre: 'muted', clase: 'bg-muted' },
  { nombre: 'success', clase: 'bg-success' },
  { nombre: 'warning', clase: 'bg-warning' },
  { nombre: 'destructive', clase: 'bg-destructive' },
  { nombre: 'info', clase: 'bg-info' },
  { nombre: 'card', clase: 'bg-card' },
  { nombre: 'background', clase: 'bg-background' },
  { nombre: 'border', clase: 'bg-border' },
  { nombre: 'foreground', clase: 'bg-foreground' },
]

function GrillaTokens({ tokens }: { tokens: TokenColor[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tokens.map((t) => (
        <div key={t.nombre} className="flex items-center gap-3">
          <div
            className={`size-10 shrink-0 rounded-lg border border-border ${t.clase ?? ''}`}
            style={t.hex ? { backgroundColor: t.hex } : undefined}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.nombre}</p>
            <code className="font-mono text-xs text-muted-foreground">
              {t.hex ? `${t.hex} · ${t.codigo}` : `bg-${t.nombre}`}
            </code>
          </div>
        </div>
      ))}
    </div>
  )
}

function TokensColor() {
  return (
    <Seccion titulo="Tokens de color">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Colores principales de la marca</p>
          <GrillaTokens tokens={COLORES_MARCA} />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Tokens del sistema</p>
          <GrillaTokens tokens={TOKENS_SISTEMA} />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Los <span className="font-medium text-foreground">colores de marca</span> son la fuente;
        los tokens del sistema derivan de ellos (algunos son tintes, p. ej.{' '}
        <span className="font-medium text-foreground">secondary</span> es un salvia claro).
        Estados: <span className="font-medium text-foreground">success</span> (validado/pagado),{' '}
        <span className="font-medium text-foreground">warning</span> (advertencias),{' '}
        <span className="font-medium text-foreground">destructive</span> (errores),{' '}
        <span className="font-medium text-foreground">info</span> (información). En componentes,
        usar siempre el token, nunca el hex.
      </p>
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
