import { useRef } from 'react'
import { Download, Printer } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import type { Colaborador } from './api'
import { CredencialImprimible } from './CredencialImprimible'

// Al imprimir, solo la credencial queda visible (el resto de la página se oculta).
const CSS_IMPRESION = `@media print {
  body { visibility: hidden !important; }
  #credencial-imprimible, #credencial-imprimible * { visibility: visible !important; }
  #credencial-imprimible { position: fixed; inset: 0; margin: auto; height: fit-content; }
}`

export function CredencialDialog({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  function descargarPNG() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const enlace = document.createElement('a')
    enlace.href = canvas.toDataURL('image/png')
    enlace.download = `qr-${colaborador.nombre.replace(/\s+/g, '-').toLowerCase()}.png`
    enlace.click()
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader className="print:hidden">
          <DialogTitle>Credencial de {colaborador.nombre}</DialogTitle>
        </DialogHeader>

        <div id="credencial-imprimible">
          <CredencialImprimible colaborador={colaborador} />
        </div>

        {/* Canvas oculto en alta resolución solo para la descarga PNG */}
        {colaborador.qr_token && (
          <div ref={canvasRef} className="hidden" aria-hidden>
            <QRCodeCanvas value={colaborador.qr_token} size={512} />
          </div>
        )}

        <DialogFooter className="mt-2 print:hidden">
          <Button variant="outline" onClick={descargarPNG}>
            <Download className="size-4" />
            Descargar QR
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir
          </Button>
        </DialogFooter>

        <style>{CSS_IMPRESION}</style>
      </DialogContent>
    </Dialog>
  )
}
