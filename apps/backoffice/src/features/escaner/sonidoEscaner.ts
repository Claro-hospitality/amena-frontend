/**
 * Sonidos de retroalimentación del escáner, generados con la Web Audio API
 * (sin archivos ni librerías). Buscan un timbre NATURAL tipo campana/marimba,
 * no un beep sintético:
 *  - onda senoidal + un armónico de octava tenue (brillo de campana),
 *  - envolvente de ataque suave y cola que resuena (decaimiento exponencial),
 *  - filtro paso-bajo que redondea el tono.
 * Éxito: dos notas que ascienden y resuenan. Rechazo: dos notas graves que
 * descienden, cálidas. Complementa a la vibración en tablet/móvil.
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

/**
 * Una nota con timbre de campana: fundamental + octava tenue, envolvente
 * percusiva (ataque corto, cola larga que decae) y paso-bajo para suavizar.
 */
function nota(
  ac: AudioContext,
  frecuencia: number,
  inicio: number,
  duracion: number,
  { forma = 'sine' as OscillatorType, volumen = 0.22, brillo = 2800 } = {},
) {
  const t0 = ac.currentTime + inicio

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volumen, t0 + 0.02) // ataque suave
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion) // cola que resuena

  const filtro = ac.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = brillo

  const fundamental = ac.createOscillator()
  fundamental.type = forma
  fundamental.frequency.value = frecuencia
  fundamental.connect(gain)

  // Armónico una octava arriba, tenue: da el brillo de campana sin sonar a beep.
  const armonico = ac.createOscillator()
  armonico.type = 'sine'
  armonico.frequency.value = frecuencia * 2
  const armonicoGain = ac.createGain()
  armonicoGain.gain.value = 0.3
  armonico.connect(armonicoGain).connect(gain)

  gain.connect(filtro).connect(ac.destination)

  const fin = t0 + duracion + 0.05
  fundamental.start(t0)
  armonico.start(t0)
  fundamental.stop(fin)
  armonico.stop(fin)
}

/** Reproduce el sonido de confirmación (éxito) o de rechazo. No falla si no hay audio. */
export function reproducirSonidoEscaner(tipo: TipoSonido) {
  const ac = contexto()
  if (!ac) return
  if (ac.state === 'suspended') void ac.resume()

  if (tipo === 'exito') {
    // Dos notas ascendentes que resuenan (C6 → G6, quinta justa): campana positiva.
    nota(ac, 1046.5, 0, 0.5, { volumen: 0.22, brillo: 3200 })
    nota(ac, 1567.98, 0.11, 0.6, { volumen: 0.2, brillo: 3400 })
  } else {
    // Dos notas graves descendentes (G4 → D#4, más cálidas y con más cuerpo).
    nota(ac, 392, 0, 0.5, { forma: 'triangle', volumen: 0.2, brillo: 1400 })
    nota(ac, 311.13, 0.14, 0.62, { forma: 'triangle', volumen: 0.2, brillo: 1300 })
  }
}
