import type { ComponentType } from "react";
import { Check, Plus, TriangleAlert, UserPlus, Utensils } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@amena/ui/components/ui/dialog";
import {
  deISO,
  desglosarMontoConIva,
  formatearMoneda,
  IVA_RATE,
  rangoSemanaLegible,
} from "@amena/utils";
import { SeccionFacturaCorte } from "../facturas/SeccionFacturaCorte";
import type { CorteConEmpresa } from "./api";
import { useDetalleCorte } from "./queries";
import { BadgeEstadoCorte } from "./BadgeEstadoCorte";

type Tono = "success" | "info" | "neutral" | "warning";

const TONO_CHIP: Record<Tono, string> = {
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-warning/10 text-warning",
};
const TONO_BARRA: Record<Tono, string> = {
  success: "bg-success",
  info: "bg-info",
  neutral: "bg-muted-foreground/40",
  warning: "bg-warning",
};

/** Una métrica del desglose de consumo: ícono en color de tono + etiqueta + conteo. */
function Metrica({
  tono,
  icono: Icono,
  etiqueta,
  nota,
  valor,
}: {
  tono: Tono;
  icono: ComponentType<{ className?: string }>;
  etiqueta: string;
  nota?: string;
  valor: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${TONO_CHIP[tono]}`}
        aria-hidden
      >
        <Icono className="size-4" />
      </span>
      <span className="flex-1 text-sm">
        {etiqueta}
        {nota && <span className="text-muted-foreground"> · {nota}</span>}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">{valor}</span>
    </div>
  );
}

/** Detalle completo de un corte (solo lectura) con desglose visual de consumo. */
export function CorteDetalleDialog({
  corte,
  onClose,
}: {
  corte: CorteConEmpresa;
  onClose: () => void;
}) {
  // Desglose real de las consumidas por categoría (RPC). Mientras carga, cae al inferido.
  const { data: desglose } = useDetalleCorte(corte.empresa_id, corte.semana_inicio);
  const reservadosConsumidos = desglose?.reservados ?? Math.min(corte.reservadas, corte.consumidas);
  const extras = desglose?.extras ?? 0;
  const libres = desglose?.libres ?? Math.max(corte.consumidas - corte.reservadas, 0);
  const invitados = desglose?.invitados ?? 0;
  const reservadosSinConsumir = Math.max(corte.reservadas - reservadosConsumidos, 0);

  // El monto_total del corte ya incluye IVA; se desglosa hacia dentro para cuadrar con la factura.
  const montos = desglosarMontoConIva(corte.monto_total);

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle>{corte.empresa?.nombre ?? "Corte"}</DialogTitle>
            <BadgeEstadoCorte estado={corte.estado} />
          </div>
          <DialogDescription>
            Semana {rangoSemanaLegible(deISO(corte.semana_inicio))}
          </DialogDescription>
        </DialogHeader>

        {/* Desglose de consumo */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Consumo de la semana</h3>
            <span className="text-sm text-muted-foreground">
              <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {corte.consumidas}
              </span>{" "}
              consumidas
            </span>
          </div>

          {/* Barra: cómo se compone lo consumido (reservado / extra / libre / invitado). */}
          {corte.consumidas > 0 && (
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {reservadosConsumidos > 0 && (
                <div className={TONO_BARRA.success} style={{ flexGrow: reservadosConsumidos }} />
              )}
              {extras > 0 && <div className={TONO_BARRA.info} style={{ flexGrow: extras }} />}
              {libres > 0 && <div className={TONO_BARRA.neutral} style={{ flexGrow: libres }} />}
              {invitados > 0 && (
                <div className={TONO_BARRA.warning} style={{ flexGrow: invitados }} />
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Metrica
              tono="success"
              icono={Check}
              etiqueta="Reservados consumidos"
              valor={reservadosConsumidos}
            />
            <Metrica tono="info" icono={Plus} etiqueta="Extras" valor={extras} />
            <Metrica tono="neutral" icono={Utensils} etiqueta="Libres" valor={libres} />
            {invitados > 0 && (
              <Metrica tono="warning" icono={UserPlus} etiqueta="Invitados" valor={invitados} />
            )}
            {reservadosSinConsumir > 0 && (
              <Metrica
                tono="warning"
                icono={TriangleAlert}
                etiqueta="Reservados sin consumir"
                nota="se cobran igual"
                valor={reservadosSinConsumir}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>
              Reservados:{" "}
              <span className="font-mono tabular-nums text-foreground">{corte.reservadas}</span>
            </span>
            <span>
              Extras (cuotas):{" "}
              <span className="font-mono tabular-nums text-foreground">{corte.extras}</span>
            </span>
          </div>
        </section>

        {/* Precio unitario (aparte del desglose de montos) */}
        <div className="flex items-center justify-between px-3 text-sm">
          <span className="text-muted-foreground">Precio unitario</span>
          <span className="font-mono tabular-nums">{formatearMoneda(corte.precio_unitario)}</span>
        </div>

        {/* Desglose de montos: subtotal, IVA y total (el monto_total ya incluye IVA). */}
        <dl className="flex flex-col rounded-lg border border-border p-3 text-sm">
          <div className="flex items-center justify-between py-1">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-mono tabular-nums">{formatearMoneda(montos.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between py-1">
            <dt className="text-muted-foreground">IVA ({Math.round(IVA_RATE * 100)}%)</dt>
            <dd className="font-mono tabular-nums">{formatearMoneda(montos.iva)}</dd>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 pb-1">
            <dt className="font-semibold">Monto total</dt>
            <dd className="font-mono font-semibold tabular-nums text-primary">
              {formatearMoneda(corte.monto_total)}
            </dd>
          </div>
        </dl>

        <SeccionFacturaCorte corte={corte} />
      </DialogContent>
    </Dialog>
  );
}
