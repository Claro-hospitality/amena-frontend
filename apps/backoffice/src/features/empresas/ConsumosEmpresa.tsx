import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { DataTable } from '@amena/ui/components/data-table'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import {
  aISO,
  deISO,
  diasHabiles,
  etiquetaDiaCorta,
  lunesDeSemana,
  rangoSemanaLegible,
} from '@amena/utils'
import type { ConsumoRow } from '../consumos/api'
import { useConsumos } from '../consumos/queries'
import type { ReservaSemana } from './api'
import { useReservasSemanaEmpresa } from './queries'

function moverLunes(lunesISO: string, delta: number): string {
  const l = deISO(lunesISO)
  l.setDate(l.getDate() + delta * 7)
  return aISO(l)
}

/** Chip de estado de una reserva en la grilla. */
function CeldaReserva({ reserva }: { reserva: ReservaSemana | undefined }) {
  if (!reserva) return <span className="text-muted-foreground">—</span>
  return (
    <span className="flex items-center justify-center gap-1">
      {reserva.consumido ? (
        <Badge className="border-transparent bg-success text-success-foreground">Consumió</Badge>
      ) : (
        <Badge variant="outline">Reservado</Badge>
      )}
      {reserva.origen === 'extra' && (
        <Badge className="border-transparent bg-warning text-warning-foreground">Extra</Badge>
      )}
    </span>
  )
}

/** Reservas de la semana (grilla comensal × L–V con estado consumido). */
function ReservasSemana({ empresaId }: { empresaId: number }) {
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const { data: reservas, isLoading } = useReservasSemanaEmpresa(empresaId, lunesISO)
  const dias = useMemo(() => diasHabiles(deISO(lunesISO)), [lunesISO])

  // Pivot: comensal → (fechaISO → reserva)
  const comensales = useMemo(() => {
    const map = new Map<number, { nombre: string; porFecha: Map<string, ReservaSemana> }>()
    for (const r of reservas ?? []) {
      if (!map.has(r.comensal_id)) map.set(r.comensal_id, { nombre: r.nombre, porFecha: new Map() })
      map.get(r.comensal_id)!.porFecha.set(r.fecha, r)
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [reservas])

  const totalReservados = reservas?.length ?? 0
  const totalConsumidos = (reservas ?? []).filter((r) => r.consumido).length

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Reservas de la semana</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setLunesISO((p) => moverLunes(p, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center text-sm capitalize">
            {rangoSemanaLegible(deISO(lunesISO))}
          </span>
          <Button variant="outline" size="icon" onClick={() => setLunesISO((p) => moverLunes(p, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : comensales.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Sin reservas esta semana.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalReservados} {totalReservados === 1 ? 'reservado' : 'reservados'} ·{' '}
            {totalConsumidos} {totalConsumidos === 1 ? 'consumido' : 'consumidos'}
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium">Colaborador</th>
                  {dias.map((d) => (
                    <th key={aISO(d)} className="px-3 py-2 text-center font-medium capitalize">
                      {etiquetaDiaCorta(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comensales.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{c.nombre}</td>
                    {dias.map((d) => (
                      <td key={aISO(d)} className="px-3 py-2 text-center">
                        <CeldaReserva reserva={c.porFecha.get(aISO(d))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

const COLUMNAS_CONSUMO: ColumnDef<ConsumoRow>[] = [
  {
    id: 'cuando',
    header: 'Cuándo',
    cell: ({ row }) => {
      const f = new Date(row.original.created_at)
      return (
        <span className="font-mono text-xs tabular-nums">
          {row.original.fecha} · {f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
  },
  {
    id: 'comensal',
    header: 'Comensal',
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span className="font-medium">{row.original.comensal_nombre}</span>
        {row.original.es_invitado && <Badge variant="secondary">Invitado</Badge>}
      </span>
    ),
  },
  {
    id: 'origen',
    header: 'Origen',
    cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.origen}</Badge>,
  },
]

/** Historial de consumos de la empresa (últimos 30 días). */
function HistorialConsumos({ empresaId }: { empresaId: number }) {
  const [page, setPage] = useState(0)
  const rango = useMemo(() => {
    const hasta = new Date()
    const desde = new Date()
    desde.setDate(desde.getDate() - 30)
    return { desde: aISO(desde), hasta: aISO(hasta) }
  }, [])
  const { data, isLoading } = useConsumos({ desde: rango.desde, hasta: rango.hasta, empresaId }, page)

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Historial de consumos · últimos 30 días</h3>
      {isLoading && !data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <DataTable
          columns={COLUMNAS_CONSUMO}
          data={data?.rows ?? []}
          emptyMessage="Sin consumos en los últimos 30 días."
        />
      )}
      {(data?.total ?? 0) > 50 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page * 50 + 1}–{Math.min((page + 1) * 50, data?.total ?? 0)} de {data?.total ?? 0}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(page + 1) * 50 >= (data?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </section>
  )
}

/** Tab "Consumos" del detalle de empresa: reservas de la semana + historial de consumos. */
export function ConsumosEmpresa({ empresaId }: { empresaId: number }) {
  return (
    <div className="flex flex-col gap-6">
      <ReservasSemana empresaId={empresaId} />
      <HistorialConsumos empresaId={empresaId} />
    </div>
  )
}
