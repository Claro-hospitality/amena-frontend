import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Pencil, Power, PowerOff, TriangleAlert } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { DataTable } from '@amena/ui/components/data-table'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { UsuariosEmpresa } from '../colaboradores/UsuariosEmpresa'
import type { CierreConEmpresa } from '../cierres/api'
import { CierreDetalleDialog } from '../cierres/CierreDetalleDialog'
import { crearColumnasCierres } from '../cierres/columns'
import { useCierres } from '../cierres/queries'
import type { Empresa } from './api'
import { ConfirmarEstadoDialog } from './ConfirmarEstadoDialog'
import { EmpresaFormDialog } from './EmpresaFormDialog'
import { useEmpresas, useResumenEmpresa } from './queries'
import type { ResumenEmpresa } from './resumenApi'

type Dialogo = { tipo: 'form' } | { tipo: 'estado' } | null

const nombreEmpresa = (e: Empresa) => e.nombre_comercial ?? e.razon_social ?? 'Empresa'

export function EmpresaDetallePage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { empresaId } = useParams<{ empresaId: string }>()
  const navigate = useNavigate()
  const id = Number(empresaId)

  const { data: empresas, isLoading, isError, refetch } = useEmpresas()
  const empresa = empresas?.find((e) => e.id === id)

  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [detalleCierre, setDetalleCierre] = useState<CierreConEmpresa | null>(null)

  if (rol !== 'super_admin' && rol !== 'finanzas') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  if (Number.isNaN(id) || (empresas && !empresa)) {
    return <EmpresaNoEncontrada />
  }

  if (isLoading || !empresa) {
    return isError ? <EstadoErrorEmpresa onReintentar={() => refetch()} /> : <DetalleSkeleton />
  }

  const puedeGestionar = rol === 'super_admin'

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Encabezado */}
        <header className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit text-muted-foreground"
            onClick={() => navigate('/empresas')}
          >
            <ArrowLeft className="size-4" />
            Empresas
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{nombreEmpresa(empresa)}</h1>
                {empresa.activo ? (
                  <Badge className="bg-success text-success-foreground">Activa</Badge>
                ) : (
                  <Badge variant="secondary">Inactiva</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {empresa.razon_social && <span>{empresa.razon_social}</span>}
                <span aria-hidden>·</span>
                <span className="font-mono tabular-nums">
                  {formatearMoneda(empresa.precio_comida)} / comida
                </span>
                <Badge variant="outline">
                  {empresa.ciclo_facturacion === 'mensual' ? 'Mensual' : 'Semanal'}
                </Badge>
              </div>
            </div>

            {puedeGestionar && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDialogo({ tipo: 'form' })}>
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDialogo({ tipo: 'estado' })}>
                  {empresa.activo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                  {empresa.activo ? 'Desactivar' : 'Reactivar'}
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Métricas */}
        <ResumenSeccion empresaId={id} />

        {/* Usuarios de la empresa (admins + colaboradores) */}
        <UsuariosEmpresa empresa={empresa} puedeGestionar={puedeGestionar} />

        {/* Histórico de cierres semanales */}
        <HistoricoSeccion empresaId={id} onVerDetalle={setDetalleCierre} />
      </div>

      {dialogo?.tipo === 'form' && (
        <EmpresaFormDialog empresa={empresa} onClose={() => setDialogo(null)} />
      )}
      {dialogo?.tipo === 'estado' && (
        <ConfirmarEstadoDialog empresa={empresa} onClose={() => setDialogo(null)} />
      )}
      {detalleCierre && (
        <CierreDetalleDialog cierre={detalleCierre} onClose={() => setDetalleCierre(null)} />
      )}
    </TooltipProvider>
  )
}

/* ----- Métricas (resumen en curso + gasto) ----- */

function ResumenSeccion({ empresaId }: { empresaId: number }) {
  const { data, isLoading, isError, refetch } = useResumenEmpresa(empresaId)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex flex-col items-start gap-3 p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <TriangleAlert className="size-4" />
            No se pudo cargar el resumen de la empresa.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <ResumenCards resumen={data} />
}

function ResumenCards({ resumen }: { resumen: ResumenEmpresa }) {
  const { en_curso } = resumen
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">Semana en curso</span>
            <span className="text-xs text-muted-foreground">
              {rangoSemanaLegible(deISO(resumen.semana_inicio))}
            </span>
          </div>
          <dl className="grid grid-cols-4 gap-2">
            <Metrica etiqueta="Comprometidas" valor={en_curso.comprometidas} />
            <Metrica etiqueta="Consumidas" valor={en_curso.consumidas} />
            <Metrica etiqueta="Faltan" valor={en_curso.faltan} resaltar={en_curso.faltan > 0} />
            <Metrica etiqueta="Extras" valor={en_curso.extras} />
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <span className="text-sm font-medium">Gasto</span>
          <dl className="grid grid-cols-3 gap-2">
            <MetricaDinero etiqueta="En curso" valor={en_curso.gasto} />
            <MetricaDinero
              etiqueta={resumen.ciclo_facturacion === 'mensual' ? 'Este mes' : 'Esta semana'}
              valor={resumen.gasto_periodo}
            />
            <MetricaDinero etiqueta="Histórico" valor={resumen.gasto_historico_total} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function Metrica({
  etiqueta,
  valor,
  resaltar,
}: {
  etiqueta: string
  valor: number
  resaltar?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`font-mono text-2xl font-semibold tabular-nums ${resaltar ? 'text-primary' : ''}`}
      >
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}

function MetricaDinero({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-lg font-semibold tabular-nums">{formatearMoneda(valor)}</span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}

/* ----- Histórico de cierres de la empresa ----- */

function HistoricoSeccion({
  empresaId,
  onVerDetalle,
}: {
  empresaId: number
  onVerDetalle: (cierre: CierreConEmpresa) => void
}) {
  const { data: cierres, isLoading, isError, refetch } = useCierres()

  const columnas = useMemo(
    () =>
      crearColumnasCierres({ onVerDetalle }).filter(
        (col) => !('accessorKey' in col && col.accessorKey === 'empresa')
      ),
    [onVerDetalle]
  )

  const cierresEmpresa = useMemo(
    () => (cierres ?? []).filter((c) => c.empresa_id === empresaId),
    [cierres, empresaId]
  )

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        Cierres semanales
      </h2>
      {isLoading ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-3 p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlert className="size-4" />
              No se pudieron cargar los cierres.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columnas}
          data={cierresEmpresa}
          fillHeight={false}
          emptyMessage="Aún no hay cierres para esta empresa."
        />
      )}
    </section>
  )
}

/* ----- Estados de la página ----- */

function DetalleSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

function EmpresaNoEncontrada() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2 className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Empresa no encontrada</EmptyTitle>
        <EmptyDescription>La empresa que buscas no existe o fue removida.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" render={<Link to="/empresas">Volver a Empresas</Link>} />
      </EmptyContent>
    </Empty>
  )
}

function EstadoErrorEmpresa({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudo cargar la empresa</EmptyTitle>
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
