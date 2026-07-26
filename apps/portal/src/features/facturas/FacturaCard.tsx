import { Download } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import { descargarArchivoFactura, type Factura } from './api'
import { BadgeEstadoFactura } from './BadgeEstadoFactura'

/** Tarjeta de una factura (solo lectura + descarga) para el portal empresarial. */
export function FacturaCard({ factura }: { factura: Factura }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium">
            {factura.serie}
            {factura.serie ? '-' : ''}
            {factura.folio}
          </span>
          <span className="text-xs text-muted-foreground">
            {rangoSemanaLegible(deISO(factura.periodo_inicio))}
          </span>
        </div>
        <BadgeEstadoFactura estado={factura.estado} />
      </div>

      <span className="font-mono text-lg font-semibold tabular-nums text-primary">
        {formatearMoneda(factura.total)}
      </span>

      {(factura.pdf_url || factura.xml_url) && (
        <div className="flex gap-2">
          {factura.pdf_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => descargarArchivoFactura(factura.pdf_url!, `factura-${factura.folio}.pdf`)}
            >
              <Download className="size-4" />
              PDF
            </Button>
          )}
          {factura.xml_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => descargarArchivoFactura(factura.xml_url!, `factura-${factura.folio}.xml`)}
            >
              <Download className="size-4" />
              XML
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
