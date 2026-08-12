import { useRef } from 'react'
import { CheckCircle2, Download } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { deISO, etiquetaDia } from '@amena/utils'
import type { InvitadoSemana } from './api'
import { descargarPasePDF } from './pasePdf'

/** Muestra el pase de un invitado (QR + descargar PDF). Si ya consumió, lo indica. */
export function PaseInvitadoDialog({
  invitado,
  empresaNombre,
  onClose,
}: {
  invitado: InvitadoSemana
  empresaNombre?: string
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const consumido = invitado.estado === 'usado'
  const nombreCompleto = `${invitado.nombre}${invitado.apellido ? ` ${invitado.apellido}` : ''}`

  function descargar() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    descargarPasePDF({
      nombre: invitado.nombre,
      apellido: invitado.apellido,
      fecha: invitado.fecha,
      empresaNombre,
      imagenQR: canvas.toDataURL('image/png'),
    })
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pase de invitado</DialogTitle>
          <DialogDescription>
            {nombreCompleto} · <span className="capitalize">{etiquetaDia(deISO(invitado.fecha))}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {consumido && (
            <Badge className="gap-1.5 border-transparent bg-success text-success-foreground">
              <CheckCircle2 className="size-4" />
              Ya consumido
            </Badge>
          )}

          <div className="rounded-2xl border border-border bg-card p-4">
            <QRCodeCanvas value={invitado.qr_token} size={220} className={consumido ? 'opacity-40' : undefined} />
          </div>
          {consumido && (
            <p className="text-center text-sm text-muted-foreground">
              Este pase ya fue consumido; el QR ya no es válido.
            </p>
          )}

          {/* Canvas oculto en alta resolución para el PDF. */}
          <div ref={canvasRef} className="hidden" aria-hidden>
            <QRCodeCanvas value={invitado.qr_token} size={512} />
          </div>

          <DialogFooter className="w-full">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={descargar}>
              <Download className="size-4" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
