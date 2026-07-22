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
import { Button } from '@amena/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@amena/ui/components/ui/card'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
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
import { DIAS_SEMANA, type DiaSemana } from './api'
import { useActualizarDiaCorte, useDiaCorte } from './queries'

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
          empresas: se cierra la semana y se calcula lo comprometido, lo consumido y el monto a
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
      onSuccess: () => toast.success(`Día de corte actualizado a ${seleccion}.`),
      onError: () => toast.error('No se pudo guardar el cambio. Intenta de nuevo.'),
    })
    setConfirmando(false)
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
          disabled={sinCambios || actualizar.isPending}
        >
          {actualizar.isPending ? 'Guardando…' : 'Guardar'}
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
              Los cortes automáticos se ejecutarán cada {seleccion}. Los cierres ya generados no
              cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={guardar}>Guardar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
