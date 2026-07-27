import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import { toast } from 'sonner'
import { descargarFacturaZip, type Factura, urlFirmadaFactura } from './api'
import { BadgeEstadoFactura } from './BadgeEstadoFactura'

/** Tarjeta de una factura (solo lectura) para el portal: ver el PDF y descargar el ZIP (PDF+XML). */
export function FacturaCard({ factura }: { factura: Factura }) {
  const [descargando, setDescargando] = useState(false)
  const [cargandoVer, setCargandoVer] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const folioLegible = `${factura.serie}${factura.serie ? '-' : ''}${factura.folio}`

  async function descargar() {
    setDescargando(true)
    try {
      await descargarFacturaZip(factura)
    } catch {
      toast.error('No se pudo descargar la factura.')
    } finally {
      setDescargando(false)
    }
  }

  async function ver() {
    if (!factura.pdf_url) return
    setCargandoVer(true)
    try {
      setPdfUrl(await urlFirmadaFactura(factura.pdf_url))
    } catch {
      toast.error('No se pudo abrir la factura.')
    } finally {
      setCargandoVer(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium">{folioLegible}</span>
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
        <div className="flex flex-wrap gap-2">
          {factura.pdf_url && (
            <Button variant="outline" size="sm" onClick={ver} loading={cargandoVer}>
              <Eye className="size-4" />
              Ver factura
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={descargar} loading={descargando}>
            <Download className="size-4" />
            Descargar
          </Button>
        </div>
      )}

      {/* Vista del PDF en la misma página (no descarga). */}
      <Dialog open={pdfUrl !== null} onOpenChange={(o) => !o && setPdfUrl(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Factura {folioLegible}</DialogTitle>
            <DialogDescription>Vista previa del PDF.</DialogDescription>
          </DialogHeader>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Vista previa de la factura"
              className="h-[70vh] w-full rounded-md border border-border"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
