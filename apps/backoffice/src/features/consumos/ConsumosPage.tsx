import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@amena/ui/components/ui/toggle-group'
import { deISO, etiquetaDiaCorta, formatearMoneda, horaCorta } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import type { ConsumoRow } from './api'
import {
  nombreComensal,
  presetsRango,
  resumenConsumos,
  topComensales,
  type RangoPreset,
} from './logica'
import { useConsumos } from './queries'

const CHART_CONFIG: ChartConfig = {
  comidas: { label: 'Comidas', color: 'var(--primary)' },
}

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
    cell: ({ row }) => <span className="font-medium">{nombreComensal(row.original)}</span>,
  },
  {
    id: 'empresa',
    header: 'Empresa',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.empresa?.nombre ?? '—'}</span>
    ),
  },
  {
    id: 'precio',
    header: 'Precio',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatearMoneda(row.original.empresa?.precio_comida ?? 0)}
      </span>
    ),
  },
]

export function ConsumosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const presets = useMemo(() => presetsRango(new Date()), [])
  const [preset, setPreset] = useState<RangoPreset>(presets[0])
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading, isError, refetch } = useConsumos(preset.desde, preset.hasta)

  const rows = useMemo(() => data ?? [], [data])
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((c) =>
      `${nombreComensal(c)} ${c.empresa?.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }, [rows, busqueda])

  const resumen = useMemo(() => resumenConsumos(rows), [rows])
  const top = useMemo(() => topComensales(rows, 10), [rows])

  // Consumos es solo para roles de oficina (super_admin/finanzas/consulta): la RLS deja a
  // mesero/capitán ver únicamente los de hoy (operan el escáner, no este reporte).
  if (rol !== 'super_admin' && rol !== 'finanzas' && rol !== 'consulta') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros de rango */}
      <ToggleGroup
        aria-label="Rango de fechas"
        value={[preset.clave]}
        onValueChange={(vals) => {
          const clave = (vals as string[]).at(-1)
          const elegido = presets.find((p) => p.clave === clave)
          if (elegido) setPreset(elegido)
        }}
      >
        {presets.map((p) => (
          <ToggleGroupItem
            key={p.clave}
            value={p.clave}
            aria-label={p.etiqueta}
            className="aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90 aria-pressed:hover:text-primary-foreground"
          >
            {p.etiqueta}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isLoading ? (
        <ConsumosSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : (
        <>
          {/* Métricas del rango */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Metrica etiqueta="Comidas" valor={String(resumen.total)} />
            <Metrica etiqueta="Comensales" valor={String(resumen.comensales)} />
            <Metrica etiqueta="Gasto total" valor={formatearMoneda(resumen.gasto)} />
          </div>

          {/* Gráfica: quién comió más */}
          <Card className="shadow-none">
            <CardContent className="flex flex-col gap-3 p-5">
              <h2 className="text-sm font-semibold tracking-tight">Quién comió más</h2>
              {top.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sin consumos en el rango seleccionado.
                </p>
              ) : (
                <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                  <BarChart
                    accessibilityLayer
                    data={top}
                    layout="vertical"
                    margin={{ left: 12, right: 16 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="comidas" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={120}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="comidas" fill="var(--color-comidas)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Detalle */}
          {rows.length === 0 ? (
            <ConsumosVacio />
          ) : (
            <DataTable
              columns={columnas}
              data={filtrados}
              emptyMessage="Ningún consumo coincide con la búsqueda."
              toolbar={
                <Input
                  placeholder="Buscar por comensal o empresa…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="max-w-sm"
                  aria-label="Buscar consumo"
                />
              }
            />
          )}
        </>
      )}
    </div>
  )
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="font-mono text-2xl font-semibold tabular-nums">{valor}</span>
        <span className="text-xs text-muted-foreground">{etiqueta}</span>
      </CardContent>
    </Card>
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
        <EmptyTitle>Sin consumos en el rango</EmptyTitle>
        <EmptyDescription>Elige otro rango de fechas para ver los consumos.</EmptyDescription>
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
