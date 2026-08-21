import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { Check, Mail } from 'lucide-react'
import { fechaCortaConHora, formatearMoneda, marcaDeTiempo } from '@amena/utils'
import { Button } from '@amena/ui/components/ui/button'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useSetTituloDetalle } from '../../layout/tituloDetalle'
import { puedeVerEventos } from '../eventos/logica'
import { generarQrDataUrl } from './qr'
import { useReservacion } from './queries'

export function ReservacionDetallePage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { folio } = useParams()
  const { data: reservacion, isLoading } = useReservacion(folio)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useSetTituloDetalle(reservacion?.folio ?? 'Reservación')

  useEffect(() => {
    if (!reservacion) return
    let vigente = true
    generarQrDataUrl(reservacion.folio)
      .then((url) => {
        if (vigente) setQrDataUrl(url)
      })
      // Si el QR no se puede generar, el folio en texto es el respaldo — no rompe la pantalla.
      .catch(() => setQrDataUrl(null))
    return () => {
      vigente = false
    }
  }, [reservacion])

  if (!puedeVerEventos(rol)) {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }
  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!reservacion) return <p className="text-muted-foreground">No encontramos esa reservación.</p>

  const evento = reservacion.eventos
  const validado = reservacion.estado_boleto === 'validado'

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-sm font-bold text-naranja-700">
          {reservacion.nombre
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? '')
            .join('')}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{reservacion.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">{reservacion.email}</p>
          {reservacion.telefono && (
            <p className="text-sm text-muted-foreground">{reservacion.telefono}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <dl className="flex flex-col gap-3 text-sm">
          <Dato etiqueta="Evento" valor={evento?.titulo ?? '—'} />
          <Dato
            etiqueta="Fecha del evento"
            valor={evento ? fechaCortaConHora(evento.fecha, evento.hora_inicio) : '—'}
          />
          <Dato
            etiqueta="Asistentes"
            valor={`${reservacion.personas} persona${reservacion.personas === 1 ? '' : 's'}`}
          />
          <Dato etiqueta="Reservada el" valor={marcaDeTiempo(reservacion.reservada_el)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {reservacion.estado_pago === 'pagada'
              ? 'Pago confirmado'
              : `Pago ${reservacion.estado_pago}`}
          </span>
          <span className="font-semibold tabular-nums">
            {formatearMoneda(reservacion.monto)}
          </span>
        </div>
        {reservacion.synergy_pay_id && (
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <Dato etiqueta="Synergy Pay ID" valor={reservacion.synergy_pay_id} />
            <Dato etiqueta="Método" valor={reservacion.metodo_pago ?? '—'} />
            <Dato etiqueta="Fecha del cargo" valor={marcaDeTiempo(reservacion.reservada_el)} />
          </dl>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-tinta-900 p-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR del boleto ${reservacion.folio}`}
                className="size-full rounded bg-crema-50 p-1"
              />
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
                validado ? 'bg-salvia-100 text-salvia-700' : 'bg-secondary text-muted-foreground'
              )}
            >
              {validado && <Check className="size-3" />}
              Boleto {reservacion.estado_boleto}
            </span>
            {reservacion.validada_el && (
              <p className="mt-1 text-xs text-muted-foreground">
                Escaneado el {marcaDeTiempo(reservacion.validada_el)}
              </p>
            )}
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {reservacion.folio}
            </p>
          </div>
        </div>
      </section>

      {/* Ninguna de las dos acciones tiene backend todavía. */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" disabled title="Próximamente">
          <Mail className="size-4" />
          Reenviar boleto por correo
        </Button>
        {reservacion.estado_pago !== 'cancelada' && (
          <Button variant="outline" disabled title="Próximamente">
            Cancelar reservación
          </Button>
        )}
      </div>
    </div>
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
