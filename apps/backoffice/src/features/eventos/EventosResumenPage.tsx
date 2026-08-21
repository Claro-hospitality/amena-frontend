import { Link, useOutletContext } from 'react-router-dom'
import { CalendarDays, Plus, ScanLine, Ticket, TrendingUp, TriangleAlert } from 'lucide-react'
import { fechaBadge, formatearMoneda } from '@amena/utils'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { iniciales } from '../reservaciones/logica'
import { ocupados, puedeVerEventos } from './logica'
import { useEventos, useResumenEventos } from './queries'

export function EventosResumenPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const resumen = useResumenEventos()
  const eventos = useEventos()

  if (!puedeVerEventos(rol)) {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const cargando = resumen.isLoading || eventos.isLoading
  const conError = resumen.isError || eventos.isError

  if (cargando) return <ResumenSkeleton />
  if (conError) {
    return (
      <EstadoError
        onReintentar={() => {
          resumen.refetch()
          eventos.refetch()
        }}
      />
    )
  }

  const stats = resumen.data
  const proximos = (eventos.data ?? []).slice(0, 4)
  const pctValidados =
    stats && stats.boletosTotales
      ? Math.round((stats.boletosValidados / stats.boletosTotales) * 100)
      : 0

  const tarjetas = stats
    ? [
        {
          label: 'Eventos próximos',
          valor: String(stats.eventosProximos),
          nota: 'publicados',
          icon: CalendarDays,
        },
        {
          label: 'Reservaciones activas',
          valor: String(stats.reservacionesActivas),
          nota: `+${stats.reservacionesSemana} esta semana`,
          icon: Ticket,
        },
        {
          label: 'Ingresos del mes',
          valor: formatearMoneda(stats.ingresosMes),
          nota: 'pagadas este mes',
          icon: TrendingUp,
        },
        {
          label: 'Boletos validados',
          valor: `${stats.boletosValidados} / ${stats.boletosTotales}`,
          nota: `${pctValidados}% de asistencia`,
          icon: ScanLine,
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-end">
        <Button nativeButton={false} render={<Link to="/eventos/catalogo/nuevo" />}>
          <Plus className="size-4" />
          Nuevo evento
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t.label}</span>
              <t.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{t.valor}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.nota}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Próximos eventos</h2>
            <Link to="/eventos/catalogo" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {proximos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay eventos.</p>
            ) : (
              proximos.map((e) => (
                <div key={e.slug} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {fechaBadge(e.fecha, e.hora_inicio)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {ocupados(e)} / {e.cupo_total}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                      e.estado === 'Publicado'
                        ? 'bg-salvia-100 text-salvia-700'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {e.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Reservaciones recientes</h2>
            <Link to="/eventos/reservaciones" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(stats?.recientes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay reservaciones.</p>
            ) : (
              (stats?.recientes ?? []).map((r) => (
                <div key={r.folio} className="flex items-center gap-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
                    {iniciales(r.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.eventoTitulo} · {r.personas}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatearMoneda(r.monto)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                      r.estadoPago === 'pagada'
                        ? 'bg-salvia-100 text-salvia-700'
                        : 'bg-naranja-100 text-naranja-700'
                    )}
                  >
                    {r.estadoPago}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ResumenSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
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
        <EmptyTitle>No se pudo cargar el resumen</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos de eventos.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}
