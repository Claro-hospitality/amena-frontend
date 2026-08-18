import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { AdminLayout, RequireAdminAuth } from './AdminLayout'
import { listReservaciones, type EstadoPago, type Reservacion } from './data/reservaciones'
import { cn } from './lib/utils'

type Filtro = 'Todas' | 'Pagadas' | 'Pendientes' | 'Canceladas'
const FILTROS: Filtro[] = ['Todas', 'Pagadas', 'Pendientes', 'Canceladas']
const FILTRO_A_ESTADO: Record<Filtro, EstadoPago | null> = {
  Todas: null,
  Pagadas: 'pagada',
  Pendientes: 'pendiente',
  Canceladas: 'cancelada',
}

export function AdminReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [seleccionFolio, setSeleccionFolio] = useState<string | null>(null)

  useEffect(() => {
    listReservaciones().then((data) => {
      setReservaciones(data)
      setSeleccionFolio(data[0]?.folio ?? null)
      setCargando(false)
    })
  }, [])

  const filtradas = useMemo(() => {
    const estado = FILTRO_A_ESTADO[filtro]
    return reservaciones.filter((r) => {
      if (estado && r.estadoPago !== estado) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (!r.nombre.toLowerCase().includes(q) && !r.email.includes(q) && !r.folio.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }, [reservaciones, busqueda, filtro])

  const total = reservaciones.filter((r) => r.estadoPago === 'pagada').reduce((s, r) => s + r.monto, 0)
  const seleccion = reservaciones.find((r) => r.folio === seleccionFolio)

  return (
    <RequireAdminAuth>
      <AdminLayout
        title="Reservaciones"
        subtitle={`${reservaciones.filter((r) => r.estadoPago !== 'cancelada').length} activas · $${total.toLocaleString('es-MX')} cobrados este mes`}
        actions={
          <button
            type="button"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary/60"
          >
            Exportar CSV
          </button>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
            Cata de vinos mexicanos · 15 ago
          </span>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 sm:w-72">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, email o folio…"
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

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Asistente</th>
                  <th className="px-4 py-3">Folio</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Boleto</th>
                  <th className="px-4 py-3 lg:hidden" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {filtradas.map((r) => (
                  <tr
                    key={r.folio}
                    onClick={() => setSeleccionFolio(r.folio)}
                    className={cn(
                      'cursor-pointer border-b border-border last:border-0 hover:bg-secondary/30',
                      seleccionFolio === r.folio && 'bg-secondary/40'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
                          {r.iniciales}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.nombre}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.personas} persona{r.personas === 1 ? '' : 's'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.folio}</td>
                    <td className="px-4 py-3 font-medium">${r.monto.toLocaleString('es-MX')}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={r.estadoPago} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.estadoBoleto}</td>
                    <td className="px-4 py-3 lg:hidden">
                      <Link
                        to={`/admin/reservaciones/${r.folio}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-0.5 text-xs font-semibold text-primary"
                      >
                        Ver detalle
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {cargando ? 'Cargando reservaciones…' : 'No hay reservaciones que coincidan.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {seleccion && (
          <div className="hidden h-fit rounded-2xl border border-border bg-card p-5 lg:block">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reservación
            </span>
            <p className="mt-1 font-mono text-sm">{seleccion.folio}</p>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
                {seleccion.iniciales}
              </span>
              <div>
                <p className="font-medium">{seleccion.nombre}</p>
                <p className="text-xs text-muted-foreground">{seleccion.email}</p>
              </div>
            </div>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <Dato etiqueta="Evento" valor={seleccion.eventoNombre} />
              <Dato etiqueta="Fecha del evento" valor={seleccion.eventoFecha} />
              <Dato etiqueta="Asistentes" valor={`${seleccion.personas} persona${seleccion.personas === 1 ? '' : 's'}`} />
              <Dato etiqueta="Reservada el" valor={seleccion.reservadaEl} />
            </dl>
            <hr className="my-4 border-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Pago confirmado</span>
              <span className="font-semibold">${seleccion.monto.toLocaleString('es-MX')}.00</span>
            </div>
            {seleccion.synergyPayId && (
              <dl className="mt-2 flex flex-col gap-2 text-sm">
                <Dato etiqueta="Synergy Pay ID" valor={seleccion.synergyPayId} />
                <Dato etiqueta="Método" valor={seleccion.metodoPago ?? '—'} />
              </dl>
            )}
            <hr className="my-4 border-border" />
            <p className="text-sm font-medium">
              Boleto {seleccion.estadoBoleto}
              {seleccion.validadaEl && (
                <span className="block text-xs font-normal text-muted-foreground">
                  Escaneado el {seleccion.validadaEl}
                </span>
              )}
            </p>
            {seleccion.estadoPago !== 'cancelada' && (
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-border py-2 text-sm font-semibold text-naranja-700 hover:bg-naranja-50"
              >
                Cancelar reservación
              </button>
            )}
          </div>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  )
}

function EstadoBadge({ estado }: { estado: EstadoPago }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        estado === 'pagada' && 'bg-salvia-100 text-salvia-700',
        estado === 'pendiente' && 'bg-naranja-100 text-naranja-700',
        estado === 'cancelada' && 'bg-secondary text-muted-foreground'
      )}
    >
      {estado}
    </span>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}
