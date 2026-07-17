import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { CameraOff, ShieldAlert, VideoOff } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { GuiaEncuadre } from './GuiaEncuadre'

type EstadoCamara = 'iniciando' | 'activa' | 'denegada' | 'sin-camara' | 'insegura' | 'error'

/** La cámara solo funciona en contexto seguro (HTTPS o localhost). */
function contextoInseguro(): boolean {
  return !window.isSecureContext || !navigator.mediaDevices?.getUserMedia
}

/**
 * Cámara trasera con lectura continua de QR (zxing). `activo` pausa el reporte de lecturas
 * (p. ej. mientras se muestra un resultado) sin apagar la cámara.
 */
export function CamaraQR({
  activo,
  onDetectar,
}: {
  activo: boolean
  onDetectar: (texto: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [estado, setEstado] = useState<EstadoCamara>(() =>
    contextoInseguro() ? 'insegura' : 'iniciando'
  )
  const [intento, setIntento] = useState(0)

  // Refs para no reiniciar la cámara cuando cambian estas props (sincronizadas tras el render).
  const onDetectarRef = useRef(onDetectar)
  const activoRef = useRef(activo)
  useEffect(() => {
    onDetectarRef.current = onDetectar
    activoRef.current = activo
  })

  const reintentar = () => {
    setEstado(contextoInseguro() ? 'insegura' : 'iniciando')
    setIntento((n) => n + 1)
  }

  useEffect(() => {
    // Sin contexto seguro (no HTTPS ni localhost) getUserMedia no existe: se explica el estado
    // 'insegura' desde el init/handler, no aquí (evita setState síncrono en el efecto).
    if (contextoInseguro()) return

    const reader = new BrowserQRCodeReader()
    let controls: { stop: () => void } | null = null
    let cancelado = false

    // Se difiere el arranque un tick: así el cleanup síncrono de StrictMode (o un
    // re-montaje rápido de ruta) cancela este arranque ANTES de tocar la cámara, y solo
    // un `decodeFromConstraints` corre a la vez sobre el mismo <video> (evita el race del
    // srcObject / "play() interrupted").
    const arranque = setTimeout(() => {
      reader
        .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current!, (result) => {
          if (result && activoRef.current) onDetectarRef.current(result.getText())
        })
        .then((c) => {
          if (cancelado) c.stop()
          else {
            controls = c
            setEstado('activa')
          }
        })
        .catch((e: unknown) => {
          if (cancelado) return
          const nombre = (e as { name?: string })?.name
          if (nombre === 'NotAllowedError') setEstado('denegada')
          else if (nombre === 'NotFoundError') setEstado('sin-camara')
          else setEstado('error')
        })
    }, 0)

    return () => {
      cancelado = true
      clearTimeout(arranque)
      controls?.stop()
    }
  }, [intento])

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

const TEXTOS: Record<
  'denegada' | 'sin-camara' | 'insegura' | 'error',
  { titulo: string; detalle: string }
> = {
  denegada: {
    titulo: 'Cámara bloqueada',
    detalle:
      'Toca el ícono de cámara o el candado en la barra de direcciones del navegador, permite el acceso a la cámara y vuelve a intentar.',
  },
  'sin-camara': {
    titulo: 'No se encontró cámara',
    detalle: 'Conecta o habilita una cámara en el dispositivo y vuelve a intentar.',
  },
  insegura: {
    titulo: 'La cámara necesita una conexión segura',
    detalle:
      'Por seguridad, el navegador solo permite la cámara en HTTPS o en localhost. Abre esta página por HTTPS (o desde la tablet del restaurante), o pide al equipo técnico habilitar el acceso para esta dirección.',
  },
  error: {
    titulo: 'No se pudo iniciar la cámara',
    detalle: 'Revisa que ninguna otra app esté usando la cámara y vuelve a intentar.',
  },
}

function ProblemaCamara({
  estado,
  onReintentar,
}: {
  estado: 'denegada' | 'sin-camara' | 'insegura' | 'error'
  onReintentar: () => void
}) {
  const { titulo, detalle } = TEXTOS[estado]
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
