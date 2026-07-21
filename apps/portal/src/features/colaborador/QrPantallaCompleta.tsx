import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X } from 'lucide-react'

/**
 * QR a pantalla completa para el escaneo en la fila: fondo claro, QR grande de alto contraste.
 * Best-effort Screen Wake Lock para que la pantalla no se apague mientras se muestra.
 */
export function QrPantallaCompleta({
  valor,
  nombre,
  onCerrar,
}: {
  valor: string
  nombre: string
  onCerrar: () => void
}) {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const wakeLock = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock
    wakeLock?.request('screen').then((l) => { lock = l }).catch(() => {})
    return () => {
      lock?.release().catch(() => {})
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-label={`Código QR de ${nombre}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white p-6"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-black/5 text-black"
      >
        <X className="size-6" />
      </button>

      <QRCodeSVG value={valor} size={320} className="h-auto w-full max-w-[80vw] sm:max-w-sm" />
      <p className="text-2xl font-semibold text-black">{nombre}</p>
      <p className="text-sm text-black/50">Toca la X para cerrar</p>
    </div>
  )
}
