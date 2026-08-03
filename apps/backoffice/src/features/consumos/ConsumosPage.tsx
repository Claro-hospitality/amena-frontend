import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@amena/ui/components/ui/chart'
import { DataTable, type ColumnDef } from '@amena/ui/components/data-table'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { SearchInput } from '@amena/ui/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { deISO, etiquetaDiaCorta, formatearMoneda, horaCorta } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { PAGE_SIZE, type ConsumoRow, type FiltrosConsumos } from './api'
import { badgeOrigen, rangoPorGranularidad, type Granularidad } from './logica'
import { SelectorPeriodo } from './SelectorPeriodo'
import { useConsumos, useEmpresas, useResumenConsumos } from './queries'

const CHART_CONFIG: ChartConfig = {
  comidas: { label: 'Comidas', color: 'var(--secondary-foreground)' },
}

/** Paleta para diferenciar empresas en la gráfica comparativa. */
const PALETA_EMPRESAS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const columnas: ColumnDef<ConsumoRow>[] = [
  {
    id: 'cuando',
    header: 'Cuándo',
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums whitespace-nowrap">
        <span className="capitalize">{etiquetaDiaCorta(deISO(row.original.fecha))}</span>
        {' · '}
        {horaCorta(new Date(row.original.created_at))}
      </span>
    ),
  },
  {
    id: 'comensal',
    header: 'Comensal',
    cell: ({ row }) => <span className="font-medium">{row.original.comensal_nombre}</span>,
  },
  {
    id: 'empresa',
    header: 'Empresa',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.empresa_nombre ?? '—'}</span>
    ),
  },
  {
    id: 'registrado_por',
    header: 'Registrado por',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.mesero_nombre ?? '—'}</span>
    ),
  },
  {
    id: 'origen',
    header: 'Origen',
    cell: ({ row }) => {
      const b = badgeOrigen(row.original.origen)
      return <Badge variant={b.variante}>{b.etiqueta}</Badge>
    },
  },
  {
    id: 'precio',
    header: 'Precio',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatearMoneda(row.original.precio_comida ?? 0)}</span>
    ),
  },
]

export function ConsumosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  // Por defecto: la semana actual (granularidad 'semana' + hoy → lunes–domingo de esta semana).
  const [granularidad, setGranularidad] = useState<Granularidad>('semana')
  const [fechaRef, setFechaRef] = useState<Date>(() => new Date())
  const [empresaSel, setEmpresaSel] = useState('')
  const [meseroSel, setMeseroSel] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)

  // Búsqueda de comensal server-side: debounce para no consultar en cada tecla; vuelve a la
  // primera página cuando cambia el término (dentro del timeout, no sincrónico en el efecto).
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(busqueda)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const rango = useMemo(() => rangoPorGranularidad(fechaRef, granularidad), [fechaRef, granularidad])

  const filtros: FiltrosConsumos = useMemo(
    () => ({
      desde: rango.desde,
      hasta: rango.hasta,
      empresaId: empresaSel ? Number(empresaSel) : null,
      registradoPor: meseroSel || null,
      q: q || null,
    }),
    [rango, empresaSel, meseroSel, q]
  )

  // Los cambios de granularidad/fecha/empresa/mesero resetean la página en su propio handler.
  const cambiarGranularidad = (g: Granularidad) => {
    setGranularidad(g)
    setPage(0)
  }
  const cambiarFecha = (d: Date) => {
    setFechaRef(d)
    setPage(0)
  }
  const cambiarEmpresa = (v: string) => {
    setEmpresaSel(v)
    setPage(0)
  }
  const cambiarMesero = (v: string) => {
    setMeseroSel(v)
    setPage(0)
  }

  const lista = useConsumos(filtros, page)
  const resumenQ = useResumenConsumos(filtros)
  const empresasQ = useEmpresas()

  const rows = lista.data?.rows ?? []
  const total = lista.data?.total ?? 0
  const resumen = resumenQ.data
  const meseros = resumen?.por_mesero ?? []
  // Sin filtro de empresa → comparativa por empresa; con empresa elegida → personas de esa empresa.
  const porEmpresaMode = empresaSel === ''
  const datosGrafica = useMemo(
    () =>
      (porEmpresaMode ? (resumen?.por_empresa ?? []) : (resumen?.top_comensales ?? [])).map((x) => ({
        nombre: x.nombre,
        comidas: x.comidas,
      })),
    [resumen, porEmpresaMode]
  )

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const isLoading = lista.isLoading || resumenQ.isLoading
  const isError = lista.isError || resumenQ.isError

  // Consumos es solo para roles de oficina (super_admin/finanzas/consulta): la RLS deja a
  // mesero/capitán ver únicamente los de hoy (operan el escáner, no este reporte).
  if (rol !== 'super_admin' && rol !== 'finanzas' && rol !== 'consulta') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros combinables */}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        {/* Periodo (día/semana/mes) + fecha de referencia: permite ver cualquier día, semana o mes. */}
        <SelectorPeriodo
          granularidad={granularidad}
          fecha={fechaRef}
          onGranularidad={cambiarGranularidad}
          onFecha={cambiarFecha}
        />

        <Field className="w-full max-w-52 gap-1 sm:w-auto">
          <FieldLabel htmlFor="filtro-empresa">Empresa</FieldLabel>
          <Select value={empresaSel} onValueChange={(v) => cambiarEmpresa(v as string)}>
            <SelectTrigger id="filtro-empresa" className="w-full" aria-label="Filtrar por empresa">
              <SelectValue>
                {(v) =>
                  v
                    ? (empresasQ.data?.find((e) => String(e.id) === v)?.nombre ?? 'Empresa')
                    : 'Todas las empresas'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las empresas</SelectItem>
              {(empresasQ.data ?? []).map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className="w-full max-w-52 gap-1 sm:w-auto">
          <FieldLabel htmlFor="filtro-mesero">Mesero</FieldLabel>
          <Select value={meseroSel} onValueChange={(v) => cambiarMesero(v as string)}>
            <SelectTrigger id="filtro-mesero" className="w-full" aria-label="Filtrar por mesero">
              <SelectValue>
                {(v) =>
                  v
                    ? (meseros.find((m) => m.registrado_por === v)?.nombre ?? 'Mesero')
                    : 'Todos los meseros'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los meseros</SelectItem>
              {meseros.map((m) => (
                <SelectItem key={m.registrado_por} value={m.registrado_por}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {isLoading ? (
        <ConsumosSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => { lista.refetch(); resumenQ.refetch() }} />
      ) : (
        <>
          {/* Métricas del período: compactas, en una sola línea. */}
          <Card className="shadow-none">
            <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
              <Metrica etiqueta="Comidas" valor={String(resumen?.total ?? 0)} />
              <Metrica etiqueta="Comensales" valor={String(resumen?.comensales_unicos ?? 0)} />
              <Metrica etiqueta="Gasto total" valor={formatearMoneda(resumen?.gasto ?? 0)} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Gráfica: por empresa (todas) o por persona (empresa elegida) */}
            <Card className="shadow-none">
              <CardContent className="flex flex-col gap-3 p-5">
                <h2 className="text-sm font-semibold tracking-tight">
                  {porEmpresaMode ? 'Consumos por empresa' : 'Quién comió más'}
                </h2>
                {datosGrafica.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin consumos en el período seleccionado.
                  </p>
                ) : (
                  <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                    <BarChart
                      accessibilityLayer
                      data={datosGrafica}
                      layout="vertical"
                      margin={{ left: 12, right: 16 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" dataKey="comidas" allowDecimals={false} />
                      <YAxis type="category" dataKey="nombre" width={120} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="comidas" fill="var(--color-comidas)" radius={4}>
                        {porEmpresaMode &&
                          datosGrafica.map((_, i) => (
                            <Cell key={i} fill={PALETA_EMPRESAS[i % PALETA_EMPRESAS.length]} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Desglose por mesero */}
            <Card className="shadow-none">
              <CardContent className="flex flex-col gap-3 p-5">
                <h2 className="text-sm font-semibold tracking-tight">Por mesero</h2>
                {meseros.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin consumos en el período seleccionado.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {meseros.map((m) => (
                      <li key={m.registrado_por} className="flex items-center justify-between py-2">
                        <span className="truncate">{m.nombre}</span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-sm font-semibold tabular-nums text-secondary-foreground">
                          {m.comidas}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalle paginado. El estado vacío solo se muestra si NO hay búsqueda activa;
              con búsqueda, la tabla se mantiene (con su toolbar) para poder editar el término. */}
          {total === 0 && !busqueda.trim() ? (
            <ConsumosVacio />
          ) : (
            <div className="flex flex-col gap-3">
              <DataTable
                columns={columnas}
                data={rows}
                emptyMessage="Ningún consumo coincide con la búsqueda."
                toolbar={
                  <SearchInput
                    placeholder="Buscar comensal…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="max-w-sm"
                    aria-label="Buscar por nombre de comensal"
                  />
                }
              />
              {total > 0 && (
                <Paginacion
                  page={page}
                  totalPaginas={totalPaginas}
                  total={total}
                  onPrev={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPaginas - 1, p + 1))}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Paginacion({
  page,
  totalPaginas,
  total,
  onPrev,
  onNext,
}: {
  page: number
  totalPaginas: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">
        {total} consumo{total === 1 ? '' : 's'} · página {page + 1} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 0}>
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPaginas - 1}>
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-xl font-semibold tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}

function ConsumosSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

function ConsumosVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UtensilsCrossed className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Sin consumos</EmptyTitle>
        <EmptyDescription>Ajusta los filtros para ver consumos.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudieron cargar los consumos</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}
