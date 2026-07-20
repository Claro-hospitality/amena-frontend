import { QRCodeSVG } from 'qrcode.react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import type { Colaborador } from './api'

/**
 * Credencial imprimible: logotipo de Amena + QR (= id del colaborador) + nombre + empresa.
 * Se muestra en pantalla y es lo único visible al imprimir (ver CredencialDialog).
 */
export function CredencialImprimible({ colaborador }: { colaborador: Colaborador }) {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground">
      <LogotipoAmena className="h-6 w-auto text-primary" />
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
