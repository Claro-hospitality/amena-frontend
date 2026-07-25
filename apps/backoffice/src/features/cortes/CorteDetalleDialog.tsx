import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { CorteConEmpresa } from './api'
import { BadgeEstadoCorte } from './BadgeEstadoCorte'

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

/** Detalle completo de un corte (solo lectura). */
export function CorteDetalleDialog({
  corte,
  onClose,
}: {
  corte: CorteConEmpresa
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{corte.empresa?.nombre ?? 'Corte'}</DialogTitle>
          <DialogDescription>
            Semana {rangoSemanaLegible(deISO(corte.semana_inicio))}
          </DialogDescription>
        </DialogHeader>

        <dl>
          <Dato etiqueta="Comprometidas">
            <span className="font-mono tabular-nums">{corte.comprometidas}</span>
          </Dato>
          <Dato etiqueta="Extras">
            <span className="font-mono tabular-nums">{corte.extras}</span>
          </Dato>
          <Dato etiqueta="Consumidas">
            <span className="font-mono tabular-nums">{corte.consumidas}</span>
          </Dato>
          <Dato etiqueta="Precio unitario">
            <span className="font-mono tabular-nums">
              {formatearMoneda(corte.precio_unitario)}
            </span>
          </Dato>
          <Dato etiqueta="Monto total">
            <span className="font-mono tabular-nums">{formatearMoneda(corte.monto_total)}</span>
          </Dato>
          <Dato etiqueta="Estado">
            <BadgeEstadoCorte estado={corte.estado} />
          </Dato>
          <Dato etiqueta="Factura">
            {corte.factura_id ? (
              <span className="font-mono text-xs">{corte.factura_id}</span>
            ) : (
              <span className="text-muted-foreground">Sin factura</span>
            )}
          </Dato>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
