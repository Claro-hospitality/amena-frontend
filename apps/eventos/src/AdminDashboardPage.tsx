import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ScanLine, Ticket, TrendingUp } from 'lucide-react'
import { AdminLayout, RequireAdminAuth } from './AdminLayout'
import { listAdminEventos } from './data/admin-eventos-store'
import type { Evento } from './data/eventos'
import { supabase } from './lib/supabase'
import { cn } from './lib/utils'

type ReservacionReciente = {
  folio: string
  nombre: string
  personas: number
  monto: number
  estadoPago: string
  eventoTitulo: string
}

type DashboardStats = {
  eventosProximos: number
  reservacionesActivas: number
  reservacionesSemana: number
  ingresosMes: number
  boletosValidados: number
  boletosTotales: number
  recientes: ReservacionReciente[]
}

function hoy() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function AdminDashboardPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    listAdminEventos().then((all) => setEventos(all.slice(0, 4)))
    supabase.rpc('dashboard_stats').then(({ data }) => setStats(data as DashboardStats))
  }, [])

  const pctValidados = stats && stats.boletosTotales ? Math.round((stats.boletosValidados / stats.boletosTotales) * 100) : 0

  const statBlocks = stats
    ? [
        { label: 'Eventos próximos', value: String(stats.eventosProximos), hint: 'publicados', icon: CalendarDays },
        { label: 'Reservaciones activas', value: String(stats.reservacionesActivas), hint: `+${stats.reservacionesSemana} esta semana`, icon: Ticket },
        { label: 'Ingresos del mes', value: `$${stats.ingresosMes.toLocaleString('es-MX')}`, hint: 'pagadas este mes', icon: TrendingUp },
        { label: 'Boletos validados', value: `${stats.boletosValidados} / ${stats.boletosTotales}`, hint: `${pctValidados}% de asistencia`, icon: ScanLine },
      ]
    : []

  return (
    <RequireAdminAuth>
      <AdminLayout
        title="Dashboard"
        subtitle={hoy()[0].toUpperCase() + hoy().slice(1)}
        actions={
          <Link
            to="/admin/eventos/nuevo"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-naranja-600"
          >
            Nuevo evento
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statBlocks.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Próximos eventos</h2>
              <Link to="/admin/eventos" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {eventos.map((e) => (
                <div key={e.slug} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">{e.fechaBadge}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {e.cupoTotal - e.cupoDisponible} / {e.cupoTotal}
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
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Reservaciones recientes</h2>
              <Link to="/admin/reservaciones" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {(stats?.recientes ?? []).map((r) => (
                <div key={r.folio} className="flex items-center gap-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
                    {iniciales(r.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.eventoTitulo} · {r.personas}</p>
                  </div>
                  <span className="shrink-0 font-medium">${r.monto.toLocaleString('es-MX')}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                      r.estadoPago === 'pagada' ? 'bg-salvia-100 text-salvia-700' : 'bg-naranja-100 text-naranja-700'
                    )}
                  >
                    {r.estadoPago}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  )
}
