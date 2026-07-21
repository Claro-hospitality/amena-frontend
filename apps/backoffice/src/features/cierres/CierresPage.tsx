import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardCheck, Play, TriangleAlert } from 'lucide-react'
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@amena/ui/components/ui/native-select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { Spinner } from '@amena/ui/components/ui/spinner'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { deISO, rangoSemanaLegible } from '@amena/utils'
import { toast } from 'sonner'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { DataTable } from '../../components/data-table'
import type { CierreConEmpresa } from './api'
import { CierreDetalleDialog } from './CierreDetalleDialog'
import { crearColumnasCierres } from './columns'
import { useCierres, useEjecutarCorte } from './queries'

export function CierresPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data: cierres, isLoading, isError, refetch } = useCierres()
  const [empresaSel, setEmpresaSel] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [confirmarCorte, setConfirmarCorte] = useState(false)
  const [detalle, setDetalle] = useState<CierreConEmpresa | null>(null)
  const ejecutar = useEjecutarCorte()

  const esSuperAdmin = rol === 'super_admin'

  const empresas = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const c of cierres ?? []) {
      if (c.empresa) mapa.set(String(c.empresa_id), c.empresa.nombre)
    }
    return [...mapa.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [cierres])

  const semanas = useMemo(() => {
    const set = new Set<string>()
    for (const c of cierres ?? []) set.add(c.semana_inicio)
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [cierres])

  const filtrados = useMemo(() => {
    return (cierres ?? []).filter((c) => {
      if (empresaSel && String(c.empresa_id) !== empresaSel) return false
      if (desde && c.semana_inicio < desde) return false
      if (hasta && c.semana_inicio > hasta) return false
      return true
    })
  }, [cierres, empresaSel, desde, hasta])

  const columnas = crearColumnasCierres({ onVerDetalle: (c) => setDetalle(c) })

  if (rol !== 'super_admin' && rol !== 'finanzas') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  async function confirmarCorteAhora() {
    setConfirmarCorte(false)
    try {
      const res = await ejecutar.mutateAsync()
      if (res.corrio && res.resultado) {
        const { generados, ya_existentes } = res.resultado
        toast.success(`Corte ejecutado: ${generados} generados · ${ya_existentes} ya existían.`)
      } else {
        toast.info(res.motivo ?? 'No se generaron cierres.')
      }
    } catch {
      toast.error('No se pudo ejecutar el corte. Intenta de nuevo.')
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {esSuperAdmin && (
          <header className="flex items-center justify-end gap-4">
            <Button onClick={() => setConfirmarCorte(true)} disabled={ejecutar.isPending}>
              {ejecutar.isPending ? <Spinner className="size-4" /> : <Play className="size-4" />}
              Ejecutar corte ahora
            </Button>
          </header>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-full max-w-52 sm:w-auto">
            <FieldLabel htmlFor="filtro-empresa">Empresa</FieldLabel>
            <NativeSelect
              id="filtro-empresa"
              className="w-full"
              value={empresaSel}
              onChange={(e) => setEmpresaSel(e.target.value)}
              aria-label="Filtrar por empresa"
            >
              <NativeSelectOption value="">Todas las empresas</NativeSelectOption>
              {empresas.map((e) => (
                <NativeSelectOption key={e.id} value={e.id}>
                  {e.nombre}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field className="w-full max-w-52 sm:w-auto">
            <FieldLabel htmlFor="filtro-desde">Desde la semana</FieldLabel>
            <NativeSelect
              id="filtro-desde"
              className="w-full"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Filtrar desde la semana"
            >
              <NativeSelectOption value="">Cualquiera</NativeSelectOption>
              {semanas.map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {rangoSemanaLegible(deISO(s))}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field className="w-full max-w-52 sm:w-auto">
            <FieldLabel htmlFor="filtro-hasta">Hasta la semana</FieldLabel>
            <NativeSelect
              id="filtro-hasta"
              className="w-full"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Filtrar hasta la semana"
            >
              <NativeSelectOption value="">Cualquiera</NativeSelectOption>
              {semanas.map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {rangoSemanaLegible(deISO(s))}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>

        {isLoading ? (
          <TablaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : filtrados.length === 0 ? (
          <CierresVacio hayFiltros={Boolean(empresaSel || desde || hasta)} />
        ) : (
          <DataTable columns={columnas} data={filtrados} />
        )}
      </div>

      {detalle && <CierreDetalleDialog cierre={detalle} onClose={() => setDetalle(null)} />}

      <AlertDialog
        open={confirmarCorte}
        onOpenChange={(abierto) => {
          if (!abierto) setConfirmarCorte(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Ejecutar el corte ahora?</AlertDialogTitle>
            <AlertDialogDescription>
              Se generarán los cierres de la última semana completa para todas las empresas
              activas, sin esperar al día configurado. La operación es idempotente: las semanas
              ya cerradas no se recalculan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCorteAhora}>Ejecutar corte</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}

function TablaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudieron cargar los cierres</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}

function CierresVacio({ hayFiltros }: { hayFiltros: boolean }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardCheck className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{hayFiltros ? 'Sin resultados' : 'Aún no hay cierres'}</EmptyTitle>
        <EmptyDescription>
          {hayFiltros
            ? 'Ningún cierre coincide con los filtros seleccionados.'
            : 'Los cierres aparecerán aquí cuando se ejecute el corte semanal.'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
