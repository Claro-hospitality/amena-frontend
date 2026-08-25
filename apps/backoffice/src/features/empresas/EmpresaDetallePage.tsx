import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Building2, FileText, Pencil, Settings, TriangleAlert } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@amena/ui/components/ui/tabs'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useSetTituloDetalle } from '../../layout/tituloDetalle'
import { UsuariosEmpresa } from '../colaboradores/UsuariosEmpresa'
import { ConsumosEmpresa } from './ConsumosEmpresa'
import { DatosFiscalesDialog } from './DatosFiscalesDialog'
import type { CorteConEmpresa } from '../cortes/api'
import { CorteDetalleDialog } from '../cortes/CorteDetalleDialog'
import { crearColumnasCortes } from '../cortes/columns'
import { useCortes } from '../cortes/queries'
import { datosFiscalesCompletos, type Empresa } from './api'
import { useDatosFiscalesEmpresa, useEmpresas, useResumenEmpresa } from './queries'
import type { ResumenEmpresa } from './resumenApi'

const nombreEmpresa = (e: Empresa) => e.nombre_comercial ?? 'Empresa'

export function EmpresaDetallePage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { empresaId } = useParams<{ empresaId: string }>()
  const id = Number(empresaId)

  const navigate = useNavigate()
  const { data: empresas, isLoading, isError, refetch } = useEmpresas()
  const empresa = empresas?.find((e) => e.id === id)

  const [detalleCorte, setDetalleCorte] = useState<CorteConEmpresa | null>(null)

  // El breadcrumb del shell muestra el nombre de la empresa como paso final.
  useSetTituloDetalle(empresa ? nombreEmpresa(empresa) : null)

  if (rol !== 'super_admin' && rol !== 'finanzas' && rol !== 'consulta') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  if (Number.isNaN(id) || (empresas && !empresa)) {
    return <EmpresaNoEncontrada />
  }

  if (isLoading || !empresa) {
    return isError ? <EstadoErrorEmpresa onReintentar={() => refetch()} /> : <DetalleSkeleton />
  }

  const puedeGestionar = rol === 'super_admin'
  // Los datos de facturación los gestiona Amena: super_admin y finanzas (RLS lo respalda).
  const puedeEditarFacturacion = rol === 'super_admin' || rol === 'finanzas'

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 md:min-h-0 md:flex-1">
        {/* Encabezado */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{nombreEmpresa(empresa)}</h1>
                {empresa.activo ? (
                  <Badge className="bg-success text-success-foreground">Activa</Badge>
                ) : (
                  <Badge variant="secondary">Inactiva</Badge>
                )}
                {empresa.modo_consumo === 'libre' && (
                  <Badge className="bg-success text-success-foreground">Consumo libre</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {formatearMoneda(empresa.precio_comida)} / comida
                </span>
                <Badge variant="outline">
                  {empresa.ciclo_facturacion === 'mensual' ? 'Mensual' : 'Semanal'}
                </Badge>
              </div>
            </div>

            {puedeGestionar && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate(`/empresas/${id}/configurar`)}>
                  <Settings className="size-4" />
                  Configurar empresa
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Métricas */}
        <ResumenSeccion empresaId={id} />

        {/* Información de facturación (datos fiscales) */}
        <FacturacionSeccion empresaId={id} puedeEditar={puedeEditarFacturacion} />

        {/* Tabs: cada tabla ocupa el alto restante de la pantalla en desktop */}
        <Tabs defaultValue="usuarios" className="flex min-h-0 flex-1 flex-col gap-4">
          <TabsList>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="consumos">Consumos</TabsTrigger>
            <TabsTrigger value="cortes">Cortes semanales</TabsTrigger>
          </TabsList>
          <TabsContent value="usuarios" className="flex min-h-0 flex-col">
            <UsuariosEmpresa empresa={empresa} puedeGestionar={puedeGestionar} fillHeight />
          </TabsContent>
          <TabsContent value="consumos" className="flex min-h-0 flex-col">
            <ConsumosEmpresa empresaId={id} />
          </TabsContent>
          <TabsContent value="cortes" className="flex min-h-0 flex-col">
            <HistoricoSeccion empresaId={id} onVerDetalle={setDetalleCorte} fillHeight />
          </TabsContent>
        </Tabs>
      </div>

      {detalleCorte && (
        <CorteDetalleDialog corte={detalleCorte} onClose={() => setDetalleCorte(null)} />
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
            <Metrica etiqueta="Reservadas" valor={en_curso.reservadas} />
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

/* ----- Información de facturación (datos fiscales) ----- */

function FacturacionSeccion({
  empresaId,
  puedeEditar,
}: {
  empresaId: number
  /** super_admin y finanzas pueden editar los datos de facturación (RLS lo respalda). */
  puedeEditar: boolean
}) {
  const { data: fiscal, isLoading, isError, refetch } = useDatosFiscalesEmpresa(empresaId)
  const [editando, setEditando] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Información de facturación
        </h2>
        <div className="flex items-center gap-2">
          {datosFiscalesCompletos(fiscal) ? (
            <Badge className="bg-success text-success-foreground">Facturable</Badge>
          ) : (
            <Badge variant="secondary">Sin datos fiscales</Badge>
          )}
          {puedeEditar && fiscal && (
            <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-5">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <TriangleAlert className="size-4" />
                No se pudieron cargar los datos fiscales.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : fiscal ? (
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <DatoFiscal etiqueta="Razón social" valor={fiscal.razon_social} />
              <DatoFiscal etiqueta="RFC" valor={fiscal.rfc} mono />
              <DatoFiscal etiqueta="Código postal fiscal" valor={fiscal.codigo_postal_fiscal} mono />
              <DatoFiscal etiqueta="Régimen fiscal" valor={fiscal.regimen_fiscal} />
              <DatoFiscal etiqueta="Uso de CFDI" valor={fiscal.uso_cfdi} mono />
              <DatoFiscal etiqueta="Correo de facturación" valor={fiscal.email_facturacion} />
            </dl>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-6" />
                </EmptyMedia>
                <EmptyTitle>Sin datos fiscales</EmptyTitle>
                <EmptyDescription>
                  Configura los datos fiscales para poder facturar a esta empresa.
                </EmptyDescription>
              </EmptyHeader>
              {puedeEditar && (
                <EmptyContent>
                  <Button onClick={() => setEditando(true)}>Configurar datos fiscales</Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </CardContent>
      </Card>

      {editando && (
        <DatosFiscalesDialog empresaId={empresaId} onClose={() => setEditando(false)} />
      )}
    </section>
  )
}

function DatoFiscal({
  etiqueta,
  valor,
  mono,
}: {
  etiqueta: string
  valor: string
  mono?: boolean
}) {
  const vacio = !valor || valor.trim() === ''
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className={`text-sm ${vacio ? 'text-muted-foreground italic' : ''} ${mono ? 'font-mono' : ''}`}>
        {vacio ? 'Por completar' : valor}
      </dd>
    </div>
  )
}

/* ----- Histórico de cortes de la empresa ----- */

function HistoricoSeccion({
  empresaId,
  onVerDetalle,
  fillHeight = false,
}: {
  empresaId: number
  onVerDetalle: (corte: CorteConEmpresa) => void
  /** En tab: ocupa el alto restante y la tabla hace scroll interno. */
  fillHeight?: boolean
}) {
  const { data: cortes, isLoading, isError, refetch } = useCortes()

  const columnas = useMemo(
    () =>
      crearColumnasCortes({ onVerDetalle }).filter(
        (col) => !('accessorKey' in col && col.accessorKey === 'empresa')
      ),
    [onVerDetalle]
  )

  const cortesEmpresa = useMemo(
    () => (cortes ?? []).filter((c) => c.empresa_id === empresaId),
    [cortes, empresaId]
  )

  return (
    <section className={`flex flex-col gap-3 ${fillHeight ? 'min-h-0 flex-1' : ''}`}>
      {!fillHeight && (
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Cortes semanales
        </h2>
      )}
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
              No se pudieron cargar los cortes.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columnas}
          data={cortesEmpresa}
          fillHeight={fillHeight}
          emptyMessage="Aún no hay cortes para esta empresa."
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
