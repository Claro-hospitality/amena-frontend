import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'

export type EstadoCamara = 'iniciando' | 'activa' | 'denegada' | 'sin-camara' | 'insegura' | 'error'

/** La cámara solo funciona en contexto seguro (HTTPS o localhost). */
export function contextoInseguro(): boolean {
  return !window.isSecureContext || !navigator.mediaDevices?.getUserMedia
}

/**
 * Cámara trasera con lectura continua de QR (zxing). Devuelve el ref del `<video>`, el estado
 * de la cámara y un `reintentar`, para que cada pantalla ponga su propio chrome encima: el
 * escáner de consumos usa el del backoffice, el de boletos su pantalla completa a color.
 *
 * `activo` pausa el REPORTE de lecturas (p. ej. mientras se muestra un resultado) sin apagar
 * la cámara, así no hay que reencenderla en cada escaneo.
 */
export function useLectorQR({
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
    // Sin contexto seguro (no HTTPS ni localhost) getUserMedia no existe: el estado 'insegura'
    // se fija en el init/handler, no aquí (evita setState síncrono en el efecto).
    if (contextoInseguro()) return

    const reader = new BrowserQRCodeReader()
    let controls: { stop: () => void } | null = null
    let cancelado = false

    // Se difiere el arranque un tick: así el cleanup síncrono de StrictMode (o un re-montaje
    // rápido de ruta) cancela este arranque ANTES de tocar la cámara, y solo un
    // `decodeFromConstraints` corre a la vez sobre el mismo <video> (evita el race del
    // srcObject / "play() interrupted").
    const arranque = setTimeout(() => {
      reader
        .decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (result && activoRef.current) onDetectarRef.current(result.getText())
          }
        )
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

  return { videoRef, estado, reintentar }
}

/** Copy por estado de fallo, compartido por las dos pantallas de escaneo. */
export const TEXTOS_CAMARA: Record<
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
