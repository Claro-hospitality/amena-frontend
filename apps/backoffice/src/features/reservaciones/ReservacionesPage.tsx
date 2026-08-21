import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Download, Ticket, TriangleAlert } from 'lucide-react'
import { fechaCortaConHora, formatearMoneda, marcaDeTiempo } from '@amena/utils'
import { Button } from '@amena/ui/components/ui/button'
import { DataTable } from '@amena/ui/components/data-table'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { SearchInput } from '@amena/ui/components/ui/search-input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { puedeVerEventos } from '../eventos/logica'
import { TAMANO_PAGINA, type Reservacion } from './api'
import { crearColumnasReservaciones } from './columns'
import { iniciales, type FiltroReservacion, FILTROS_RESERVACION } from './logica'
import { useReservacionesActivas, useReservacionesPagina } from './queries'

export function ReservacionesPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<FiltroReservacion>('Todas')
  const [folioSel, setFolioSel] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(TAMANO_PAGINA)

  // Búsqueda contra la base: debounce para no consultar en cada tecla, y de regreso a la primera
  // página cuando cambia el término (si no, se queda en una página que ya no existe).
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(busqueda)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const filtros = useMemo(() => ({ filtro, busqueda: q }), [filtro, q])
  const { data, isLoading, isError, refetch } = useReservacionesPagina(filtros, page, pageSize)
  const activas = useReservacionesActivas()
  const columnas = useMemo(
    () => crearColumnasReservaciones({ onSeleccionar: (r) => setFolioSel(r.folio) }),
    []
  )

  if (!puedeVerEventos(rol)) {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const filas = data?.filas ?? []
  const total = data?.total ?? 0
  const sinNada = total === 0 && !q.trim() && filtro === 'Todas'
  // El panel lateral se surte de la página visible: la seleccionada por el usuario si está en
  // ella, y si no la primera fila.
  const seleccion = filas.find((r) => r.folio === folioSel) ?? filas[0] ?? null

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {activas.data ?? 0} activa{activas.data === 1 ? '' : 's'}
        </p>
        {/* Sin exportación todavía. */}
        <Button variant="outline" disabled title="Próximamente">
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </header>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : sinNada ? (
        <ReservacionesVacio />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <DataTable
            columns={columnas}
            data={filas}
            emptyMessage="Ninguna reservación coincide con el filtro."
            rowClassName={(r) => (r.folio === seleccion?.folio ? 'bg-secondary/40' : undefined)}
            paginacionServidor={{
              pageIndex: page,
              pageSize,
              total,
              onChange: ({ pageIndex, pageSize: tamano }) => {
                setPage(pageIndex)
                setPageSize(tamano)
              },
            }}
            toolbar={
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre, email o folio…"
                  aria-label="Buscar reservaciones"
                  className="w-full sm:max-w-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {FILTROS_RESERVACION.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setFiltro(f)
                        setPage(0)
                      }}
                      aria-pressed={filtro === f}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm font-medium',
                        filtro === f
                          ? 'border-primary bg-naranja-50 text-naranja-700'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary/60'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            }
          />

          {seleccion && <PanelDetalle reservacion={seleccion} />}
        </div>
      )}
    </div>
  )
}

/** Panel lateral de desktop; en móvil se navega a /eventos/reservaciones/:folio. */
function PanelDetalle({ reservacion: r }: { reservacion: Reservacion }) {
  const evento = r.eventos
  return (
    <aside className="hidden h-fit rounded-2xl border border-border bg-card p-5 lg:block">
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Reservación
      </span>
      <p className="mt-1 font-mono text-sm">{r.folio}</p>

      <div className="mt-3 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
          {iniciales(r.nombre)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{r.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>

      <dl className="mt-4 flex flex-col gap-2.5 text-sm">
        <Dato etiqueta="Evento" valor={evento?.titulo ?? '—'} />
        <Dato
          etiqueta="Fecha del evento"
          valor={evento ? fechaCortaConHora(evento.fecha, evento.hora_inicio) : '—'}
        />
        <Dato
          etiqueta="Asistentes"
          valor={`${r.personas} persona${r.personas === 1 ? '' : 's'}`}
        />
        <Dato etiqueta="Reservada el" valor={marcaDeTiempo(r.reservada_el)} />
      </dl>

      <hr className="my-4 border-border" />
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {r.estado_pago === 'pagada' ? 'Pago confirmado' : `Pago ${r.estado_pago}`}
        </span>
        <span className="font-semibold tabular-nums">{formatearMoneda(r.monto)}</span>
      </div>
      {r.synergy_pay_id && (
        <dl className="mt-2 flex flex-col gap-2 text-sm">
          <Dato etiqueta="Synergy Pay ID" valor={r.synergy_pay_id} />
          <Dato etiqueta="Método" valor={r.metodo_pago ?? '—'} />
        </dl>
      )}

      <hr className="my-4 border-border" />
      <p className="text-sm font-medium">
        Boleto {r.estado_boleto}
        {r.validada_el && (
          <span className="block text-xs font-normal text-muted-foreground">
            Escaneado el {marcaDeTiempo(r.validada_el)}
          </span>
        )}
      </p>

      {/* Sin cancelación todavía: devolver el cupo y el cobro necesita backend propio. */}
      {r.estado_pago !== 'cancelada' && (
        <Button variant="outline" disabled title="Próximamente" className="mt-4 w-full">
          Cancelar reservación
        </Button>
      )}
    </aside>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{etiqueta}</dt>
      <dd className="min-w-0 text-right font-medium">{valor}</dd>
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
        <EmptyTitle>No se pudieron cargar las reservaciones</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}

function ReservacionesVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ticket className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay reservaciones</EmptyTitle>
        <EmptyDescription>
          Cuando alguien reserve en amena.social, aparecerá aquí.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
