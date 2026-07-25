import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@amena/ui/components/ui/card'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { toast } from 'sonner'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { AMBIENTE_FACTURAMA } from '../facturas/api'
import { type ConfigFacturacion, DIAS_SEMANA, type DiaSemana } from './api'
import {
  useActualizarConfigFacturacion,
  useActualizarDiaCorte,
  useConfigFacturacion,
  useDiaCorte,
} from './queries'

function capitalizar(dia: string): string {
  return dia.charAt(0).toUpperCase() + dia.slice(1)
}

export function ConfiguracionPage() {
  const { rol } = useOutletContext<ContextoAcceso>()

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Parámetros globales del sistema.</p>
      <SeccionCortesSemanales />
      <SeccionFacturacion />
    </div>
  )
}

function SeccionCortesSemanales() {
  const { data: diaActual, isLoading, isError, refetch } = useDiaCorte()

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Cortes semanales</CardTitle>
        <CardDescription>
          Día de la semana en que se genera automáticamente el corte semanal de todas las
          empresas: se cierra la semana y se calcula lo reservado, lo consumido y el monto a
          facturar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-full max-w-xs" />
        ) : isError || !diaActual ? (
          <div className="flex flex-col items-start gap-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlert className="size-4" />
              No se pudo cargar la configuración.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <FormDiaCorte diaActual={diaActual} />
        )}
      </CardContent>
    </Card>
  )
}

function FormDiaCorte({ diaActual }: { diaActual: DiaSemana }) {
  const [seleccion, setSeleccion] = useState<DiaSemana>(diaActual)
  const [confirmando, setConfirmando] = useState(false)
  const actualizar = useActualizarDiaCorte()

  const sinCambios = seleccion === diaActual

  function guardar() {
    actualizar.mutate(seleccion, {
      onSuccess: () => {
        toast.success(`Día de corte actualizado a ${seleccion}.`)
        setConfirmando(false)
      },
      onError: () => toast.error('No se pudo guardar el cambio. Intenta de nuevo.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field className="max-w-xs">
        <FieldLabel htmlFor="dia_corte">Día de corte semanal</FieldLabel>
        <Select
          value={seleccion}
          onValueChange={(valor) => setSeleccion(valor as DiaSemana)}
        >
          <SelectTrigger id="dia_corte" className="w-full" aria-label="Día de corte semanal">
            <SelectValue>{(valor) => capitalizar(valor as string)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DIAS_SEMANA.map((dia) => (
              <SelectItem key={dia} value={dia}>
                {capitalizar(dia)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div>
        <Button
          onClick={() => setConfirmando(true)}
          disabled={sinCambios}
          loading={actualizar.isPending}
        >
          Guardar
        </Button>
      </div>

      <AlertDialog
        open={confirmando}
        onOpenChange={(abierto) => {
          if (!abierto) setConfirmando(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar el día de corte a {seleccion}?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cortes automáticos se ejecutarán cada {seleccion}. Los cortes ya generados no
              cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={guardar} loading={actualizar.isPending}>
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const METODOS_PAGO: Array<{ valor: string; label: string }> = [
  { valor: 'PPD', label: 'Pago en parcialidades o diferido (PPD)' },
  { valor: 'PUE', label: 'Pago en una exhibición (PUE)' },
]
const FORMAS_PAGO: Array<{ valor: string; label: string }> = [
  { valor: '99', label: '99 — Por definir' },
  { valor: '01', label: '01 — Efectivo' },
  { valor: '03', label: '03 — Transferencia electrónica' },
  { valor: '04', label: '04 — Tarjeta de crédito' },
]

function SeccionFacturacion() {
  const { data: config, isLoading, isError, refetch } = useConfigFacturacion()

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Facturación</CardTitle>
        <CardDescription>
          Parámetros del timbrado CFDI. Cambiarlos afecta las próximas facturas que se emitan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full max-w-md" />
        ) : isError || !config ? (
          <div className="flex flex-col items-start gap-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlert className="size-4" />
              No se pudo cargar la configuración.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <FormFacturacion config={config} />
        )}
      </CardContent>
    </Card>
  )
}

function FormFacturacion({ config }: { config: ConfigFacturacion }) {
  const [valores, setValores] = useState<ConfigFacturacion>(config)
  const [confirmando, setConfirmando] = useState(false)
  const actualizar = useActualizarConfigFacturacion()

  const sinCambios = (Object.keys(config) as Array<keyof ConfigFacturacion>).every(
    (k) => valores[k] === config[k],
  )
  const set = (k: keyof ConfigFacturacion, v: string) => setValores((prev) => ({ ...prev, [k]: v }))

  function guardar() {
    actualizar.mutate(valores, {
      onSuccess: () => {
        toast.success('Configuración de facturación actualizada.')
        setConfirmando(false)
      },
      onError: () => toast.error('No se pudo guardar. Intenta de nuevo.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="serie">Serie por default</FieldLabel>
          <Input
            id="serie"
            value={valores.serie_facturas_default}
            onChange={(e) => set('serie_facturas_default', e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lugar">Lugar de expedición (CP emisor)</FieldLabel>
          <Input
            id="lugar"
            inputMode="numeric"
            value={valores.lugar_expedicion}
            onChange={(e) => set('lugar_expedicion', e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="prodserv">Clave ProdServ SAT</FieldLabel>
          <Input
            id="prodserv"
            value={valores.clave_prod_serv_sat}
            onChange={(e) => set('clave_prod_serv_sat', e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="unidad">Clave de unidad SAT</FieldLabel>
          <Input
            id="unidad"
            value={valores.clave_unidad_sat}
            onChange={(e) => set('clave_unidad_sat', e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="metodo">Método de pago</FieldLabel>
          <Select
            value={valores.metodo_pago_default}
            onValueChange={(v) => set('metodo_pago_default', v ?? '')}
          >
            <SelectTrigger id="metodo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map((m) => (
                <SelectItem key={m.valor} value={m.valor}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="forma">Forma de pago</FieldLabel>
          <Select
            value={valores.forma_pago_default}
            onValueChange={(v) => set('forma_pago_default', v ?? '')}
          >
            <SelectTrigger id="forma" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS_PAGO.map((f) => (
                <SelectItem key={f.valor} value={f.valor}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
        <span className="text-muted-foreground">Ambiente de timbrado (según el entorno)</span>
        {AMBIENTE_FACTURAMA === 'prod' ? (
          <Badge className="bg-warning text-warning-foreground">PRODUCCIÓN</Badge>
        ) : (
          <Badge variant="secondary">Sandbox</Badge>
        )}
      </div>

      <div>
        <Button
          onClick={() => setConfirmando(true)}
          disabled={sinCambios}
          loading={actualizar.isPending}
        >
          Guardar
        </Button>
      </div>

      <AlertDialog
        open={confirmando}
        onOpenChange={(abierto) => {
          if (!abierto) setConfirmando(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar la configuración de facturación?</AlertDialogTitle>
            <AlertDialogDescription>
              Estos valores se usan al timbrar los CFDI. Un dato incorrecto puede provocar rechazos
              del SAT. Las facturas ya emitidas no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={guardar} loading={actualizar.isPending}>
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
