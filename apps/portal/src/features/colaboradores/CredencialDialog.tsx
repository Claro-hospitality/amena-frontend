import { useRef } from 'react'
import { Download } from 'lucide-react'
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

/** Escapa texto para insertarlo con seguridad en el HTML del documento de impresión. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Wordmark de Amena (mismo SVG que LogotipoAmena) para inyectarlo en el documento aislado del
// PDF, donde no hay acceso a los componentes de la app. `fill="currentColor"` toma el color del
// contenedor (naranja de marca).
const LOGO_AMENA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 66.86" fill="currentColor" role="img" aria-label="Amena" style="height:46px;width:auto"><path d="M187.7,9.21h-7.95c-.23,0-.42.19-.42.42v28.11c0,.55-.35,1.01-.88,1.16-.53.15-1.07-.07-1.35-.54l-18.14-28.94c-.08-.13-.21-.21-.36-.21h-8.3c-.23,0-.42.19-.42.42v47.03c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42v-27.82c0-.55.35-1.01.88-1.16.11-.03.22-.04.33-.04.41,0,.8.21,1.02.58l18.14,29.22c.08.13.21.21.36.21h8.3c.23,0,.42-.19.42-.42V9.64c0-.23-.19-.42-.42-.42Z"/><path d="M82.6,36.52l-10.69-27.04c-.06-.16-.22-.27-.39-.27h-7.11c-1.53,0-1.53,1.45-1.53,1.69v45.77c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42v-19.34c0-.52.32-1,.81-1.15.65-.2,1.27.09,1.5.7l5.3,10.55c.71,1.8,1.91,2.46,3.11,2.62h2.62c1.21-.2,2.47-1.07,3.18-2.87l5.47-10.9c.19-.48.61-.76,1.1-.76.1,0,.19.01.29.03.55.12.92.64.92,1.2v19.93c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42V10.15c0-.52-.42-.94-.94-.94h-8.22l-10.79,27.31c-.18.46-.62.76-1.12.76s-.93-.3-1.12-.76Z"/><path d="M143.07,9.21h-31.9v7.38l.05.39v12.48h-.05v7.38l.05.39v12.48h-.05v7.38h31.9c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42h-21.86c-.66,0-1.2-.54-1.2-1.2v-10.47c0-.66.54-1.2,1.2-1.2h19.95c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42h-19.95c-.66,0-1.2-.54-1.2-1.2v-10.47c0-.66.54-1.2,1.2-1.2h21.86c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42Z"/><path d="M44.14,11.53c-.05-.18-.43-1.87-1.59-1.87h-11.61c-2.04,0-1.98,1.69-2.04,1.87l-13.61,45.46c-.04.13-.01.27.07.37.08.11.2.17.34.17h7.88c.19,0,.35-.12.4-.3l2.05-6.83c.15-.51.62-.86,1.15-.86h18.7c.53,0,1,.35,1.15.86l2.05,6.83c.05.18.22.3.4.3h7.88c.13,0,.26-.06.34-.17s.1-.24.07-.37l-13.61-45.46ZM43.9,41.12c-.23.31-.58.48-.96.48h-12.84c-.38,0-.73-.18-.96-.48-.23-.31-.3-.69-.19-1.06l6.42-22.52c.16-.52.61-.86,1.15-.86s.99.34,1.15.86l6.42,22.52c.11.37.04.75-.19,1.06Z"/><path d="M221.1,11.53c-.05-.18-.43-1.87-1.59-1.87h-11.61c-2.04,0-1.98,1.69-2.04,1.87l-13.61,45.46c-.04.13-.01.27.07.37.08.11.2.17.34.17h7.88c.19,0,.35-.12.4-.3l2.05-6.83c.15-.51.62-.86,1.15-.86h18.7c.53,0,1,.35,1.15.86l2.05,6.83c.05.18.22.3.4.3h7.88c.13,0,.26-.06.34-.17s.1-.24.07-.37l-13.61-45.46ZM220.86,41.12c-.23.31-.58.48-.96.48h-12.84c-.38,0-.73-.18-.96-.48-.23-.31-.3-.69-.19-1.06l6.42-22.52c.16-.52.61-.86,1.15-.86s.99.34,1.15.86l6.42,22.52c.11.37.04.75-.19,1.06Z"/></svg>`

export function CredencialDialog({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  /**
   * Descarga la credencial como PDF de UNA sola página: abre una ventana aislada con una
   * tarjeta (logo de Amena + QR grande + nombre + empresa) y lanza el diálogo de impresión →
   * "Guardar como PDF". Se usa una ventana aparte (no `window.print()` de la página) para evitar
   * el bug de `position: fixed`, que repetía el mismo código en varias páginas.
   */
  function descargarPDF() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const imagenQR = canvas.toDataURL('image/png')
    const ventana = window.open('', '_blank')
    if (!ventana) return

    const nombre = escaparHtml(colaborador.nombre)
    const empresa = colaborador.empresa?.nombre ? escaparHtml(colaborador.empresa.nombre) : ''

    ventana.document.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Credencial - ${nombre}</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; }
      html, body { height: 100%; margin: 0; }
      body { background: #fcfaf5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .hoja {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20mm;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .tarjeta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        width: 100%;
        max-width: 560px;
        padding: 44px 40px;
        background: #ffffff;
        border: 1px solid #e9e1cd;
        border-radius: 28px;
        text-align: center;
      }
      .logo { color: #f68d2e; line-height: 0; }
      .qr {
        width: min(62vw, 58vh);
        max-width: 440px;
        height: auto;
        padding: 16px;
        background: #ffffff;
        border: 1px solid #f0ead9;
        border-radius: 20px;
      }
      .nombre { font-size: 30px; font-weight: 700; color: #2b2925; margin: 0; }
      .empresa { font-size: 18px; color: #6b675e; margin: 6px 0 0; }
      .pie { font-size: 13px; color: #a99873; margin: 0; max-width: 380px; }
    </style>
  </head>
  <body onload="window.focus(); window.print();">
    <div class="hoja">
      <div class="tarjeta">
        <span class="logo">${LOGO_AMENA_SVG}</span>
        <img class="qr" src="${imagenQR}" alt="Código QR de ${nombre}" />
        <div>
          <p class="nombre">${nombre}</p>
          ${empresa ? `<p class="empresa">${empresa}</p>` : ''}
        </div>
        <p class="pie">Presenta este código en el comedor para registrar tu comida.</p>
      </div>
    </div>
  </body>
</html>`)
    ventana.document.close()
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credencial de {colaborador.nombre}</DialogTitle>
        </DialogHeader>

        <CredencialImprimible colaborador={colaborador} />

        {/* Canvas oculto en alta resolución: fuente de la imagen del PDF. */}
        {colaborador.qr_token && (
          <div ref={canvasRef} className="hidden" aria-hidden>
            <QRCodeCanvas value={colaborador.qr_token} size={512} />
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button onClick={descargarPDF} disabled={!colaborador.qr_token}>
            <Download className="size-4" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
