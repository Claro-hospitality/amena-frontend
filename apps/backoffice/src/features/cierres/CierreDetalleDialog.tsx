import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { CierreConEmpresa } from './api'
import { BadgeEstadoCierre } from './BadgeEstadoCierre'

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

/** Detalle completo de un cierre (solo lectura). */
export function CierreDetalleDialog({
  cierre,
  onClose,
}: {
  cierre: CierreConEmpresa
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
          <DialogTitle>{cierre.empresa?.nombre ?? 'Cierre'}</DialogTitle>
          <DialogDescription>
            Semana {rangoSemanaLegible(deISO(cierre.semana_inicio))}
          </DialogDescription>
        </DialogHeader>

        <dl>
          <Dato etiqueta="Comprometidas">
            <span className="font-mono tabular-nums">{cierre.comprometidas}</span>
          </Dato>
          <Dato etiqueta="Extras">
            <span className="font-mono tabular-nums">{cierre.extras}</span>
          </Dato>
          <Dato etiqueta="Consumidas">
            <span className="font-mono tabular-nums">{cierre.consumidas}</span>
          </Dato>
          <Dato etiqueta="Precio unitario">
            <span className="font-mono tabular-nums">
              {formatearMoneda(cierre.precio_unitario)}
            </span>
          </Dato>
          <Dato etiqueta="Monto total">
            <span className="font-mono tabular-nums">{formatearMoneda(cierre.monto_total)}</span>
          </Dato>
          <Dato etiqueta="Estado">
            <BadgeEstadoCierre estado={cierre.estado} />
          </Dato>
          <Dato etiqueta="Factura">
            {cierre.factura_id ? (
              <span className="font-mono text-xs">{cierre.factura_id}</span>
            ) : (
              <span className="text-muted-foreground">Sin factura</span>
            )}
          </Dato>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
