import { CameraOff, ShieldAlert, VideoOff } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { TEXTOS_CAMARA, useLectorQR } from '../../lib/useLectorQR'
import { GuiaEncuadre } from './GuiaEncuadre'

/**
 * Cámara trasera con lectura continua de QR, con el chrome del backoffice. La mecánica de
 * cámara vive en `useLectorQR` (compartida con el escáner de boletos de eventos, que pinta su
 * propia pantalla completa a color). `activo` pausa el reporte de lecturas sin apagar la cámara.
 */
export function CamaraQR({
  activo,
  onDetectar,
}: {
  activo: boolean
  onDetectar: (texto: string) => void
}) {
  const { videoRef, estado, reintentar } = useLectorQR({ activo, onDetectar })

  return (
    <div className="relative size-full overflow-hidden bg-black">
      <video ref={videoRef} className="size-full object-cover" playsInline muted />
      {estado === 'activa' && <GuiaEncuadre />}
      {(estado === 'denegada' ||
        estado === 'sin-camara' ||
        estado === 'insegura' ||
        estado === 'error') && <ProblemaCamara estado={estado} onReintentar={reintentar} />}
    </div>
  )
}

function ProblemaCamara({
  estado,
  onReintentar,
}: {
  estado: 'denegada' | 'sin-camara' | 'insegura' | 'error'
  onReintentar: () => void
}) {
  const { titulo, detalle } = TEXTOS_CAMARA[estado]
  const Icono = estado === 'denegada' ? CameraOff : estado === 'insegura' ? ShieldAlert : VideoOff
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icono className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{detalle}</p>
      <Button onClick={onReintentar}>Reintentar</Button>
    </div>
  )
}
