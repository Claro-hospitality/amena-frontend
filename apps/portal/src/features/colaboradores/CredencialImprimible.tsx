import { QRCodeSVG } from 'qrcode.react'
import type { Colaborador } from './api'

/**
 * Credencial imprimible: logo textual Amena + QR (= id del colaborador) + nombre + empresa.
 * Se muestra en pantalla y es lo único visible al imprimir (ver CredencialDialog).
 */
export function CredencialImprimible({ colaborador }: { colaborador: Colaborador }) {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground">
      <p className="text-lg font-semibold text-primary">Amena</p>
      <QRCodeSVG value={colaborador.id} size={220} className="h-auto w-full max-w-[240px]" />
      <div>
        <p className="text-lg font-medium">{colaborador.nombre}</p>
        {colaborador.empresa?.nombre && (
          <p className="text-sm text-muted-foreground">{colaborador.empresa.nombre}</p>
        )}
      </div>
      <p className="font-mono text-[10px] break-all text-muted-foreground">{colaborador.id}</p>
    </div>
  )
}
