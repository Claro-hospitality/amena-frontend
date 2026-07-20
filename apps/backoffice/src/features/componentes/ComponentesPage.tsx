import { useState, type ReactNode } from 'react'
import {
  Bell,
  Building2,
  Check,
  ClipboardCheck,
  Info,
  Pencil,
  Plus,
  ScanLine,
  Search,
  Settings,
  TriangleAlert,
  Trash2,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@amena/ui/components/ui/alert'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@amena/ui/components/ui/card'
import { Checkbox } from '@amena/ui/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { Label } from '@amena/ui/components/ui/label'
import { Progress } from '@amena/ui/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@amena/ui/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Separator } from '@amena/ui/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@amena/ui/components/ui/sheet'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { Spinner } from '@amena/ui/components/ui/spinner'
import { Switch } from '@amena/ui/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@amena/ui/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@amena/ui/components/ui/tabs'
import { Textarea } from '@amena/ui/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@amena/ui/components/ui/tooltip'

/**
 * Catálogo de componentes de @amena/ui — referencia interna del design system.
 * Muestra tokens del tema, tipografía, íconos y los componentes más usados con
 * sus variantes. Todo con tokens del tema (sin colores hardcodeados).
 */
export function ComponentesPage() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <p className="text-sm text-muted-foreground">
          Referencia de los componentes globales de <code className="font-mono">@amena/ui</code>,
          sus variantes y los tokens del tema. Todo se construye sobre estos bloques.
        </p>

        <TokensColor />
        <Tipografia />
        <Iconos />
        <Botones />
        <Badges />
        <Tarjetas />
        <Alertas />
        <Formulario />
        <Overlays />
        <Datos />
      </div>
    </TooltipProvider>
  )
}

/** Contenedor de una sección: título + tarjeta (superficie bg-card, borde, sin sombra). */
function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        {titulo}
      </h2>
      <div className="rounded-lg border border-border bg-card p-5">{children}</div>
    </section>
  )
}

/** Fila de ejemplos con envoltura y etiqueta opcional. */
function Fila({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

const TOKENS_COLOR = [
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

function TokensColor() {
  return (
    <Seccion titulo="Tokens de color">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOKENS_COLOR.map((t) => (
          <div key={t.nombre} className="flex items-center gap-3">
            <div className={`size-10 shrink-0 rounded-lg border border-border ${t.clase}`} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.nombre}</p>
              <code className="font-mono text-xs text-muted-foreground">bg-{t.nombre}</code>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Estados: <span className="font-medium text-foreground">success</span> (validado/pagado),{' '}
        <span className="font-medium text-foreground">warning</span> (advertencias),{' '}
        <span className="font-medium text-foreground">destructive</span> (errores),{' '}
        <span className="font-medium text-foreground">info</span> (información). Usar siempre el
        token, nunca el hex.
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
        <p className="font-mono text-sm tabular-nums">$1,234.50 · ID-00421 · font-mono (montos e IDs)</p>
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

function Botones() {
  return (
    <Seccion titulo="Botones">
      <div className="flex flex-col gap-4">
        <Fila>
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Fila>
        <Fila>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Agregar">
            <Plus />
          </Button>
        </Fila>
        <Fila>
          <Button>
            <Plus className="size-4" />
            Con ícono
          </Button>
          <Button disabled>Deshabilitado</Button>
          <Button disabled>
            <Spinner className="size-4" />
            Cargando…
          </Button>
        </Fila>
      </div>
    </Seccion>
  )
}

function Badges() {
  return (
    <Seccion titulo="Badges">
      <div className="flex flex-col gap-4">
        <Fila>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Fila>
        <Fila>
          <Badge className="bg-success text-success-foreground">Activa</Badge>
          <Badge className="bg-warning text-warning-foreground">Por vencer</Badge>
          <Badge className="bg-info text-info-foreground">Nuevo</Badge>
        </Fila>
        <p className="text-xs text-muted-foreground">
          Estados de negocio: usar los tokens de estado (success/warning/info) por className.
        </p>
      </div>
    </Seccion>
  )
}

function Tarjetas() {
  return (
    <Seccion titulo="Tarjetas (Card)">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Título de la tarjeta</CardTitle>
            <CardDescription>Descripción breve del contenido.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contenido de la tarjeta. Superficie <code className="font-mono">bg-card</code>.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Otra tarjeta</CardTitle>
            <CardDescription>Con una acción al pie.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Estado del recurso</span>
            <Badge className="bg-success text-success-foreground">Activo</Badge>
          </CardContent>
        </Card>
      </div>
    </Seccion>
  )
}

function Alertas() {
  return (
    <Seccion titulo="Alerts">
      <div className="flex flex-col gap-3">
        <Alert>
          <Info />
          <AlertTitle>Información general</AlertTitle>
          <AlertDescription>Mensaje neutro sobre fondo de tarjeta.</AlertDescription>
        </Alert>
        <Alert variant="info">
          <Info />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>Dato informativo (azul de marca).</AlertDescription>
        </Alert>
        <Alert variant="success">
          <Check />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>La operación se completó correctamente.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <TriangleAlert />
          <AlertTitle>Advertencia</AlertTitle>
          <AlertDescription>Revisa esto antes de continuar.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <X />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Ocurrió un problema al guardar.</AlertDescription>
        </Alert>
      </div>
    </Seccion>
  )
}

function Formulario() {
  return (
    <Seccion titulo="Formulario">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="demo-input">Input</FieldLabel>
          <Input id="demo-input" placeholder="Escribe algo…" />
        </Field>

        <Field>
          <FieldLabel htmlFor="demo-select">Select</FieldLabel>
          <Select defaultValue="mensual">
            <SelectTrigger id="demo-select" className="w-full">
              <SelectValue>{(v) => (v === 'semanal' ? 'Semanal' : 'Mensual')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="demo-textarea">Textarea</FieldLabel>
          <Textarea id="demo-textarea" placeholder="Comentario…" />
        </Field>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="demo-check" defaultChecked />
            <Label htmlFor="demo-check">Checkbox</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="demo-switch" defaultChecked />
            <Label htmlFor="demo-switch">Switch</Label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Radio group</Label>
          <RadioGroup defaultValue="a">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="demo-radio-a" value="a" />
              <Label htmlFor="demo-radio-a">Opción A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="demo-radio-b" value="b" />
              <Label htmlFor="demo-radio-b">Opción B</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Seccion>
  )
}

function Overlays() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [sheetAbierto, setSheetAbierto] = useState(false)

  return (
    <Seccion titulo="Overlays y feedback">
      <Fila>
        <Button variant="outline" onClick={() => setDialogAbierto(true)}>
          Abrir dialog
        </Button>

        <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
          <SheetTrigger render={<Button variant="outline">Abrir sheet</Button>} />
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Panel lateral</SheetTitle>
            </SheetHeader>
            <p className="px-4 text-sm text-muted-foreground">Contenido del sheet.</p>
          </SheetContent>
        </Sheet>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Con tooltip</Button>} />
          <TooltipContent>Texto de ayuda</TooltipContent>
        </Tooltip>

        <Button variant="outline" onClick={() => toast.success('Guardado correctamente')}>
          Toast de éxito
        </Button>
        <Button variant="outline" onClick={() => toast.error('Algo salió mal')}>
          Toast de error
        </Button>
      </Fila>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título del dialog</DialogTitle>
            <DialogDescription>Descripción breve de la acción.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Contenido del cuerpo del diálogo.</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setDialogAbierto(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Seccion>
  )
}

function Datos() {
  return (
    <Seccion titulo="Datos y estados">
      <div className="flex flex-col gap-6">
        <Tabs defaultValue="tabla">
          <TabsList>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
            <TabsTrigger value="progreso">Progreso</TabsTrigger>
            <TabsTrigger value="carga">Carga</TabsTrigger>
          </TabsList>

          <TabsContent value="tabla">
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Constructora Norte</TableCell>
                    <TableCell>Mensual</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-success-foreground">Activa</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Estudio Creativo Sur</TableCell>
                    <TableCell>Semanal</TableCell>
                    <TableCell>
                      <Badge variant="outline">Inactiva</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="progreso">
            <div className="flex flex-col gap-3">
              <Progress value={30} />
              <Progress value={70} />
            </div>
          </TabsContent>

          <TabsContent value="carga">
            <div className="flex items-center gap-3">
              <Spinner className="size-5" />
              <span className="text-sm text-muted-foreground">Cargando…</span>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-2">
          <Label>Skeleton</Label>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </div>

        <Separator />

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>Componente Empty para estados vacíos.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline">Acción</Button>
          </EmptyContent>
        </Empty>
      </div>
    </Seccion>
  )
}
