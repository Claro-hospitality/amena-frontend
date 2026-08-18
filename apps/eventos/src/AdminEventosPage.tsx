import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { AdminLayout, RequireAdminAuth } from './AdminLayout'
import { listAdminEventos } from './data/admin-eventos-store'
import type { Evento } from './data/eventos'
import { cn } from './lib/utils'

type Filtro = 'Todos' | 'Publicados' | 'Borradores' | 'Pasados'

const FILTROS: Filtro[] = ['Todos', 'Publicados', 'Borradores', 'Pasados']

export function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  useEffect(() => {
    listAdminEventos().then((data) => {
      setEventos(data)
      setCargando(false)
    })
  }, [])

  const publicados = eventos.filter((e) => e.estado === 'Publicado').length
  const borradores = eventos.length - publicados

  const filtrados = useMemo(() => {
    const hoy = new Date()
    return eventos.filter((e) => {
      const fecha = new Date(e.anio, e.mes, e.dia)
      if (filtro === 'Publicados' && e.estado !== 'Publicado') return false
      if (filtro === 'Borradores' && e.estado !== 'Borrador') return false
      if (filtro === 'Pasados' && fecha >= hoy) return false
      if (busqueda && !e.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [eventos, filtro, busqueda])

  return (
    <RequireAdminAuth>
      <AdminLayout
        title="Eventos"
        subtitle={`${publicados} publicados · ${borradores} borrador${borradores === 1 ? '' : 'es'}`}
        actions={
          <Link
            to="/admin/eventos/nuevo"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-naranja-600"
          >
            Nuevo evento
          </Link>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 sm:w-72">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar evento…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            {FILTROS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  filtro === f
                    ? 'border-primary bg-naranja-50 text-naranja-700'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Fecha y hora</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Cupo</th>
                <th className="px-4 py-3">Reservas</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.slug} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link to={`/admin/eventos/${e.slug}/editar`} className="font-medium hover:underline">
                      {e.titulo}
                    </Link>
                    <p className="text-xs text-muted-foreground">{e.categoria}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{e.fechaLarga.replace(', 2026', ' 2026')}</p>
                    <p className="text-xs text-muted-foreground">{e.horario}</p>
                  </td>
                  <td className="px-4 py-3">{e.precioLabel.split(' / ')[0]}</td>
                  <td className="px-4 py-3">
                    {e.cupoTotal - e.cupoDisponible} / {e.cupoTotal}
                  </td>
                  <td className="px-4 py-3">{e.cupoTotal - e.cupoDisponible}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        e.estado === 'Publicado'
                          ? 'bg-salvia-100 text-salvia-700'
                          : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {cargando ? 'Cargando eventos…' : 'No hay eventos que coincidan con este filtro.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  )
}
