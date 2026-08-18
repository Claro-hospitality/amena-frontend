import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Check, Mail } from 'lucide-react'
import { AdminLayout, RequireAdminAuth } from './AdminLayout'
import { getReservacionByFolio, type Reservacion } from './data/reservaciones'
import { generarQrDataUrl } from './lib/qr'
import { cn } from './lib/utils'

export function AdminReservacionDetallePage() {
  const { folio } = useParams()
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'no-encontrado'>('cargando')
  const [reservacion, setReservacion] = useState<Reservacion | undefined>(undefined)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!folio) {
      setEstado('no-encontrado')
      return
    }
    let cancelado = false
    getReservacionByFolio(folio).then((r) => {
      if (cancelado) return
      setReservacion(r)
      setEstado(r ? 'listo' : 'no-encontrado')
      if (r) generarQrDataUrl(r.folio).then(setQrDataUrl)
    })
    return () => {
      cancelado = true
    }
  }, [folio])

  if (estado === 'no-encontrado') {
    return <Navigate to="/admin/reservaciones" replace />
  }

  if (!reservacion) {
    return (
      <RequireAdminAuth>
        <AdminLayout title="Reservación" subtitle={folio} backTo="/admin/reservaciones">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </AdminLayout>
      </RequireAdminAuth>
    )
  }

  return (
    <RequireAdminAuth>
      <AdminLayout title="Reservación" subtitle={reservacion.folio} backTo="/admin/reservaciones">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-sm font-bold text-naranja-700">
              {reservacion.iniciales}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{reservacion.nombre}</p>
              <p className="truncate text-sm text-muted-foreground">{reservacion.email}</p>
              {reservacion.telefono && <p className="text-sm text-muted-foreground">{reservacion.telefono}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <dl className="flex flex-col gap-3 text-sm">
              <Dato etiqueta="Evento" valor={reservacion.eventoNombre} />
              <Dato etiqueta="Fecha del evento" valor={reservacion.eventoFecha} />
              <Dato etiqueta="Lugar" valor="Amena · Mutuo Vive, Guadalajara" />
              <Dato etiqueta="Asistentes" valor={`${reservacion.personas} persona${reservacion.personas === 1 ? '' : 's'}`} />
              <Dato etiqueta="Reservada el" valor={reservacion.reservadaEl} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Pago confirmado</span>
              <span className="font-semibold">${reservacion.monto.toLocaleString('es-MX')}.00</span>
            </div>
            {reservacion.synergyPayId && (
              <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                <Dato etiqueta="Synergy Pay ID" valor={reservacion.synergyPayId} />
                <Dato etiqueta="Método" valor={reservacion.metodoPago ?? '—'} />
                <Dato etiqueta="Fecha del cargo" valor={reservacion.reservadaEl} />
              </dl>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-tinta-900 p-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`Código QR del boleto ${reservacion.folio}`} className="size-full rounded bg-crema-50 p-1" />
                ) : (
                  <div className="flex size-full items-center justify-center text-center font-mono text-[9px] font-bold leading-tight text-crema-50">
                    {reservacion.folio}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                    reservacion.estadoBoleto === 'validado'
                      ? 'bg-salvia-100 text-salvia-700'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {reservacion.estadoBoleto === 'validado' && <Check className="size-3" />}
                  Boleto {reservacion.estadoBoleto}
                </span>
                {reservacion.validadaEl && (
                  <p className="mt-1 text-xs text-muted-foreground">Escaneado el {reservacion.validadaEl}</p>
                )}
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{reservacion.folio}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-sm font-semibold hover:bg-secondary/60"
            >
              <Mail className="size-4" />
              Reenviar boleto por correo
            </button>
            {reservacion.estadoPago !== 'cancelada' && (
              <button
                type="button"
                className="rounded-full border border-border py-2.5 text-sm font-semibold text-naranja-700 hover:bg-naranja-50"
              >
                Cancelar reservación
              </button>
            )}
          </div>
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  )
}
