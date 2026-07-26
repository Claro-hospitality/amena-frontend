import type { ReactNode } from "react";
import { Check, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@amena/ui/components/ui/dialog";
import { deISO, formatearMoneda, rangoSemanaLegible } from "@amena/utils";
import { SeccionFacturaCorte } from "../facturas/SeccionFacturaCorte";
import type { CorteConEmpresa } from "./api";
import { BadgeEstadoCorte } from "./BadgeEstadoCorte";

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Detalle completo de un corte (solo lectura). */
export function CorteDetalleDialog({
  corte,
  onClose,
}: {
  corte: CorteConEmpresa;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{corte.empresa?.nombre ?? "Corte"}</DialogTitle>
          <DialogDescription>
            Semana {rangoSemanaLegible(deISO(corte.semana_inicio))}
          </DialogDescription>
        </DialogHeader>

        {(() => {
          // Reservadas que nadie consumió: se cobran igual (la reserva es el cobro).
          const sinConsumir = Math.max(corte.reservadas - corte.consumidas, 0);
          return (
            <dl>
              <Dato etiqueta="Reservadas">
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums">
                    {corte.reservadas}
                  </span>
                  {sinConsumir > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                      <TriangleAlert className="size-3.5" />
                      {sinConsumir} sin consumir · se cobran
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      <Check className="size-3.5" />
                      Todas consumidas
                    </span>
                  )}
                </div>
              </Dato>
              <Dato etiqueta="Extras">
                <span className="font-mono tabular-nums">{corte.extras}</span>
              </Dato>
              <Dato etiqueta="Consumidas">
                <span className="font-mono tabular-nums">
                  {corte.consumidas}
                </span>
              </Dato>
              <Dato etiqueta="Precio unitario">
                <span className="font-mono tabular-nums">
                  {formatearMoneda(corte.precio_unitario)}
                </span>
              </Dato>
              <Dato etiqueta="Monto total">
                <span className="font-mono tabular-nums">
                  {formatearMoneda(corte.monto_total)}
                </span>
              </Dato>
              <Dato etiqueta="Estado">
                <BadgeEstadoCorte estado={corte.estado} />
              </Dato>
            </dl>
          );
        })()}

        <SeccionFacturaCorte corte={corte} />
      </DialogContent>
    </Dialog>
  );
}
