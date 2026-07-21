/**
 * Sonidos de retroalimentación del escáner, generados con la Web Audio API
 * (sin archivos ni librerías): tono ascendente y brillante para la confirmación,
 * zumbido grave para el rechazo. Complementa a la vibración en tablet/móvil.
 *
 * El AudioContext se crea de forma perezosa y se reanuda al vuelo: para cuando
 * se escanea un QR el mesero ya interactuó con la página (arrancó la cámara),
 * así que el audio queda desbloqueado por la política de autoplay.
 */

type TipoSonido = 'exito' | 'rechazo'

let ctx: AudioContext | null = null

function contexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

/** Un tono con envolvente suave (evita clicks) que se agenda respecto a `currentTime`. */
function tono(
  ac: AudioContext,
  frecuencia: number,
  inicio: number,
  duracion: number,
  forma: OscillatorType = 'sine',
  volumen = 0.2,
) {
  const t0 = ac.currentTime + inicio
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = forma
  osc.frequency.value = frecuencia
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volumen, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duracion + 0.02)
}

/** Reproduce el sonido de confirmación (éxito) o de rechazo. No falla si no hay audio. */
export function reproducirSonidoEscaner(tipo: TipoSonido) {
  const ac = contexto()
  if (!ac) return
  if (ac.state === 'suspended') void ac.resume()

  if (tipo === 'exito') {
    // Dos notas ascendentes (A5 → E6): confirmación positiva y clara.
    tono(ac, 880, 0, 0.12)
    tono(ac, 1318.5, 0.1, 0.16)
  } else {
    // Zumbido grave descendente (square): lectura sin corte / rechazo.
    tono(ac, 220, 0, 0.18, 'square', 0.16)
    tono(ac, 155, 0.15, 0.24, 'square', 0.16)
  }
}
