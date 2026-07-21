import {
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  LogOut,
  Plus,
  QrCode,
  Receipt,
  ScanLine,
  Settings,
  TriangleAlert,
  Users,
  Utensils,
} from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Seccion } from './primitivos'

/** Tipo mínimo común a todos los iconos de lucide-react (aceptan className y strokeWidth). */
type IconoLucide = React.ComponentType<{ className?: string; strokeWidth?: number }>

/** Muestra representativa del dominio Amena (~12 iconos). */
const ICONOS_DOMINIO: { Icon: IconoLucide; label: string }[] = [
  { Icon: Building2, label: 'Empresa' },
  { Icon: Users, label: 'Colaboradores' },
  { Icon: QrCode, label: 'QR' },
  { Icon: Utensils, label: 'Comida' },
  { Icon: CalendarDays, label: 'Calendario' },
  { Icon: Receipt, label: 'Factura' },
  { Icon: BarChart3, label: 'Gráficas' },
  { Icon: Settings, label: 'Configuración' },
  { Icon: ScanLine, label: 'Escáner' },
  { Icon: Check, label: 'Check' },
  { Icon: TriangleAlert, label: 'Alerta' },
  { Icon: LogOut, label: 'Cerrar sesión' },
]

/** Nota corta bajo el título de cada sección. */
function Nota({ children }: { children: React.ReactNode }) {
  return <p className="-mt-1 mb-1 max-w-2xl text-xs text-muted-foreground">{children}</p>
}

/**
 * Explorador visual de la identidad de iconos (Lucide) para el proyecto.
 * Solo para evaluación en Desarrollo → Componentes → Iconos. Todo con tokens del tema.
 */
export function IconosShowcase() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Muestra de {ICONOS_DOMINIO.length} iconos representativos del dominio con{' '}
        <code className="font-mono">lucide-react</code>. Compara grosor, escala y tratamientos de
        color para decidir la identidad. La decisión final es tuya.
      </p>

      <Grosor />
      <Escala />
      <Color />
      <Combinaciones />
    </div>
  )
}

/* 1 · GROSOR DE TRAZO ------------------------------------------------------ */

const GROSORES = [
  { w: 1.25, label: 'Fino / elegante' },
  { w: 1.5, label: 'Medio' },
  { w: 2, label: 'Default' },
  { w: 2.5, label: 'Sólido / amigable' },
]

function Grosor() {
  return (
    <Seccion titulo="1 · Grosor de trazo">
      <Nota>
        El mismo set repetido con distinto <code className="font-mono">strokeWidth</code>. Define la
        personalidad: fino se lee sobrio y premium; grueso, cercano y amigable. Lucide usa 2 por
        defecto. Elige uno y aplícalo a TODO el sistema para que se vea coherente.
      </Nota>
      <div className="flex flex-col gap-5">
        {GROSORES.map(({ w, label }) => (
          <div key={w} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{label}</span>
              <span className="font-mono text-xs text-muted-foreground">strokeWidth={w}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {ICONOS_DOMINIO.map(({ Icon, label }) => (
                <Icon key={label} className="size-6 text-foreground" strokeWidth={w} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

/* 2 · ESCALA POR CONTEXTO -------------------------------------------------- */

const ESCALAS = [
  { cls: 'size-4', px: 16, uso: 'Inline en texto y badges' },
  { cls: 'size-5', px: 20, uso: 'Botones e items de navegación' },
  { cls: 'size-6', px: 24, uso: 'Default' },
  { cls: 'size-8', px: 32, uso: 'Encabezados de estados vacíos' },
  { cls: 'size-12', px: 48, uso: 'Estados vacíos grandes y pantalla del escáner' },
]

function Escala() {
  return (
    <Seccion titulo="2 · Escala por contexto">
      <Nota>
        Tamaños de uso real. El tamaño se controla con clases (<code className="font-mono">size-4</code>
        … <code className="font-mono">size-12</code>), nunca con px sueltos. Mantén cada contexto en
        su tamaño para conservar el ritmo visual.
      </Nota>
      <div className="flex flex-wrap items-end gap-8">
        {ESCALAS.map(({ cls, px, uso }) => (
          <div key={px} className="flex w-28 flex-col items-center gap-2 text-center">
            <div className="flex h-12 items-end">
              <QrCode className={`${cls} text-foreground`} />
            </div>
            <div>
              <div className="font-mono text-xs">{px}px</div>
              <div className="text-xs text-muted-foreground">{uso}</div>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

/* 3 · TRATAMIENTOS DE COLOR ------------------------------------------------ */

/** Chip redondeado (patrón "dashboard moderno"): contenedor con superficie + icono. */
function Chip({ tono, Icon }: { tono: string; Icon: IconoLucide }) {
  return (
    <span className={`flex size-10 items-center justify-center rounded-xl ${tono}`}>
      <Icon className="size-5" />
    </span>
  )
}

const CHIPS_SEMANTICOS = [
  { tono: 'bg-success/15 text-success', label: 'success', Icon: Check },
  { tono: 'bg-warning/15 text-warning', label: 'warning', Icon: TriangleAlert },
  { tono: 'bg-destructive/15 text-destructive', label: 'destructive', Icon: TriangleAlert },
  { tono: 'bg-muted text-muted-foreground', label: 'muted', Icon: Settings },
]

const PARES_RELLENO = [Building2, QrCode, Receipt, Users]

function Muestra({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function Color() {
  return (
    <Seccion titulo="3 · Tratamientos de color">
      <Nota>
        Siempre con tokens del tema, nunca hex. Neutro para lo funcional; acento naranja para lo que
        guía; chips para stats y acentos de dashboard; variantes semánticas para estados.
      </Nota>

      <div className="flex flex-col gap-7">
        {/* Plano vs acento */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Plano y acento</span>
          <div className="flex flex-wrap items-start gap-8">
            <Muestra label="foreground (neutro)">
              <Building2 className="size-8 text-foreground" />
            </Muestra>
            <Muestra label="text-primary (acento)">
              <Building2 className="size-8 text-primary" />
            </Muestra>
          </div>
        </div>

        {/* Chip acento (dashboard moderno) */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Chip sobre superficie (patrón dashboard)</span>
          <div className="flex flex-wrap items-center gap-4">
            {[Building2, Users, QrCode, BarChart3, CalendarDays].map((Icon, i) => (
              <Chip key={i} tono="bg-accent text-accent-foreground" Icon={Icon} />
            ))}
            <span className="font-mono text-xs text-muted-foreground">
              bg-accent · text-accent-foreground
            </span>
          </div>
        </div>

        {/* Chips semánticos */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Chips en variantes semánticas</span>
          <div className="flex flex-wrap items-start gap-6">
            {CHIPS_SEMANTICOS.map(({ tono, label, Icon }) => (
              <Muestra key={label} label={label}>
                <Chip tono={tono} Icon={Icon} />
              </Muestra>
            ))}
          </div>
        </div>

        {/* Relleno suave (bulk / twotone) vs outline */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Relleno suave (efecto bulk/twotone) vs outline</span>
          <div className="flex flex-wrap items-start gap-8">
            <Muestra label="Outline puro">
              <div className="flex gap-3">
                {PARES_RELLENO.map((Icon, i) => (
                  <Icon key={i} className="size-8 text-primary" />
                ))}
              </div>
            </Muestra>
            <Muestra label="Relleno suave (fill-primary/15)">
              <div className="flex gap-3">
                {PARES_RELLENO.map((Icon, i) => (
                  <Icon key={i} className="size-8 fill-primary/15 text-primary" />
                ))}
              </div>
            </Muestra>
          </div>
        </div>
      </div>
    </Seccion>
  )
}

/* 4 · COMBINACIONES APLICADAS --------------------------------------------- */

function Combinaciones() {
  return (
    <Seccion titulo="4 · Combinaciones aplicadas">
      <Nota>
        Propuesta de <strong>identidad Amena</strong>: outline Lucide a{' '}
        <code className="font-mono">strokeWidth 2</code>, tamaño 20 en nav y botones; chips{' '}
        <code className="font-mono">bg-accent</code> para stats y acentos de dashboard; variantes
        semánticas para estados; y <strong>relleno suave reservado al icono protagonista</strong> de
        los estados vacíos. Así se ve en el producto:
      </Nota>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Item de sidebar */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Item de sidebar</span>
          <div className="w-60 rounded-lg border border-border bg-card p-2">
            <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              <Building2 className="size-5" />
              Empresas
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <Users className="size-5" />
              Colaboradores
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <Receipt className="size-5" />
              Cierres
            </div>
          </div>
        </div>

        {/* Botones con icono */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Botones con icono</span>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Button>
              <Plus className="size-4" />
              Nueva empresa
            </Button>
            <Button variant="outline">
              <QrCode className="size-4" />
              Ver QR
            </Button>
            <Button variant="secondary">
              <ScanLine className="size-4" />
              Escanear
            </Button>
          </div>
        </div>

        {/* Card de estado vacío con icono protagonista */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Estado vacío (icono protagonista)</span>
          <Empty className="rounded-lg border border-border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Utensils className="size-6 fill-primary/15 text-primary" />
              </EmptyMedia>
              <EmptyTitle>Aún no hay platillos</EmptyTitle>
              <EmptyDescription>Crea el primer platillo del menú semanal.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <Plus className="size-4" />
                Nuevo platillo
              </Button>
            </EmptyContent>
          </Empty>
        </div>

        {/* Stat de dashboard: chip + número */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Stat de dashboard (chip + número)</span>
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <Chip tono="bg-accent text-accent-foreground" Icon={Building2} />
                <div>
                  <div className="text-2xl font-semibold tabular-nums">24</div>
                  <div className="text-xs text-muted-foreground">Empresas activas</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <Chip tono="bg-success/15 text-success" Icon={Check} />
                <div>
                  <div className="text-2xl font-semibold tabular-nums">1,280</div>
                  <div className="text-xs text-muted-foreground">Comidas validadas</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Tip</Badge>
        Mezcla mínima: elige un grosor, un tamaño por contexto y un tratamiento de acento. El resto
        se mantiene neutro.
      </p>
    </Seccion>
  )
}
