import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'
import { AlertTriangle, Check, ChevronLeft, Keyboard, ScanLine, X } from 'lucide-react'
import { RequireAdminAuth } from './AdminLayout'
import { listReservaciones, validarBoleto, type Reservacion } from './data/reservaciones'
import { listAdminEventos } from './data/admin-eventos-store'
import type { Evento } from './data/eventos'

type Resultado =
  | { tipo: 'valido'; reservacion: Reservacion }
  | { tipo: 'ya-usado'; reservacion: Reservacion; validadaEl: string }
  | { tipo: 'no-encontrado'; folio: string }

type CamaraError = 'permiso-denegado' | 'no-disponible' | null

export function AdminEscanearPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [camaraError, setCamaraError] = useState<CamaraError>(null)
  const [intentoCamara, setIntentoCamara] = useState(0)
  const [capturaManual, setCapturaManual] = useState(false)
  const [folioInput, setFolioInput] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [validadosSesion, setValidadosSesion] = useState(0)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoSlug, setEventoSlug] = useState('')
  const [validadosBase, setValidadosBase] = useState(0)

  const evento = eventos.find((e) => e.slug === eventoSlug)

  useEffect(() => {
    listAdminEventos().then((lista) => {
      setEventos(lista)
      setEventoSlug((prev) => prev || lista[0]?.slug || '')
    })
  }, [])

  useEffect(() => {
    if (!eventoSlug) return
    setValidadosSesion(0)
    listReservaciones().then((data) => {
      setValidadosBase(data.filter((r) => r.eventoSlug === eventoSlug && r.estadoBoleto === 'validado').length)
    })
  }, [eventoSlug])

  useEffect(() => {
    if (resultado) return
    let stream: MediaStream | undefined
    let raf = 0
    let activo = true
    const canvas = document.createElement('canvas')
    const contexto = canvas.getContext('2d', { willReadFrequently: true })

    function tick() {
      if (!activo) return
      const video = videoRef.current
      if (video && contexto && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        contexto.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imagen = contexto.getImageData(0, 0, canvas.width, canvas.height)
        const codigo = jsQR(imagen.data, imagen.width, imagen.height)
        if (codigo?.data) {
          activo = false
          procesarFolio(codigo.data)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamaraError('no-disponible')
      return () => {
        activo = false
      }
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s
        setCamaraError(null)
        if (videoRef.current) {
          videoRef.current.srcObject = s
          raf = requestAnimationFrame(tick)
        }
      })
      .catch((err: unknown) => {
        const nombre = err instanceof DOMException ? err.name : ''
        setCamaraError(
          nombre === 'NotAllowedError' || nombre === 'PermissionDeniedError' ? 'permiso-denegado' : 'no-disponible'
        )
      })

    return () => {
      activo = false
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [resultado, intentoCamara])

  async function procesarFolio(folioDetectado: string) {
    const resultadoValidacion = await validarBoleto(folioDetectado)
    if (resultadoValidacion.tipo === 'no-encontrado') {
      setResultado({ tipo: 'no-encontrado', folio: folioDetectado })
      return
    }
    if (resultadoValidacion.tipo === 'ya-usado') {
      setResultado({
        tipo: 'ya-usado',
        reservacion: resultadoValidacion.reservacion,
        validadaEl: resultadoValidacion.reservacion.validadaEl ?? 'hace un momento',
      })
      return
    }
    setValidadosSesion((prev) => prev + 1)
    setResultado({ tipo: 'valido', reservacion: resultadoValidacion.reservacion })
  }

  async function validarFolio(e: FormEvent) {
    e.preventDefault()
    await procesarFolio(folioInput)
  }

  function reiniciar() {
    setResultado(null)
    setCapturaManual(false)
    setFolioInput('')
  }

  const validados = validadosBase + validadosSesion

  const colorFondo =
    resultado?.tipo === 'valido'
      ? 'bg-salvia-700'
      : resultado?.tipo === 'ya-usado' || resultado?.tipo === 'no-encontrado'
        ? 'bg-red-800'
        : 'bg-tinta-900'

  return (
    <RequireAdminAuth>
      <div className={`flex min-h-dvh flex-col text-crema-50 ${colorFondo}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex size-9 items-center justify-center rounded-full bg-white/10">
            <ChevronLeft className="size-5" />
          </Link>
          <p className="text-sm font-semibold">Escanear boleto</p>
          <span className="size-9" />
        </div>

        {!resultado && (
          <>
            <div className="relative flex-1 overflow-hidden">
              {!camaraError ? (
                <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-4 bg-black/40 px-8 text-center text-sm text-crema-100/70">
                  <p>
                    {camaraError === 'permiso-denegado'
                      ? 'No diste permiso de cámara. Actívalo en los ajustes de tu navegador para este sitio, o usa la captura manual.'
                      : 'No pudimos acceder a la cámara (puede requerir HTTPS o que el sitio se abra como localhost). Usa la captura manual.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIntentoCamara((n) => n + 1)}
                    className="rounded-full border border-crema-50/30 bg-white/10 px-4 py-2 text-xs font-semibold text-crema-50"
                  >
                    Reintentar acceso a la cámara
                  </button>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="size-56 rounded-3xl border-2 border-dashed border-crema-50/70" />
                <div className="rounded-full bg-black/50 px-4 py-2 text-center text-xs">
                  <p className="font-medium">Alinea el QR del boleto dentro del marco</p>
                  <p className="text-crema-100/70">La validación es automática al detectarlo</p>
                </div>
              </div>
            </div>

            {!capturaManual ? (
              <button
                type="button"
                onClick={() => setCapturaManual(true)}
                className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-full border border-crema-50/30 bg-white/10 py-3 text-sm font-semibold"
              >
                <Keyboard className="size-4" />
                Capturar folio a mano
              </button>
            ) : (
              <form onSubmit={validarFolio} className="mx-4 mb-4 flex flex-col gap-2">
                <input
                  autoFocus
                  value={folioInput}
                  onChange={(e) => setFolioInput(e.target.value)}
                  placeholder="AMN-EV-2026-00418"
                  className="h-12 rounded-xl border border-crema-50/30 bg-white/10 px-4 font-mono text-sm text-crema-50 outline-none placeholder:text-crema-100/40"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  <ScanLine className="size-4" />
                  Validar folio
                </button>
              </form>
            )}

            <div className="mx-4 mb-6 flex flex-col gap-2 rounded-2xl bg-white/10 p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-crema-100/70">
                Validando accesos para
              </p>
              <select
                value={eventoSlug}
                onChange={(e) => setEventoSlug(e.target.value)}
                className="rounded-lg border border-crema-50/30 bg-white/10 px-2.5 py-1.5 font-semibold text-crema-50 outline-none"
              >
                {eventos.map((e) => (
                  <option key={e.slug} value={e.slug} className="text-tinta-900">
                    {e.titulo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-crema-100/70">{evento?.fechaBadge}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-salvia-500"
                  style={{ width: `${evento ? (validados / evento.cupoTotal) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-crema-100/70">
                Boletos validados · {validados} / {evento?.cupoTotal ?? '—'}
              </p>
            </div>
          </>
        )}

        {resultado?.tipo === 'valido' && (
          <ResultadoValido reservacion={resultado.reservacion} onSiguiente={reiniciar} />
        )}
        {resultado?.tipo === 'ya-usado' && (
          <ResultadoYaUsado reservacion={resultado.reservacion} validadaEl={resultado.validadaEl} onSiguiente={reiniciar} />
        )}
        {resultado?.tipo === 'no-encontrado' && (
          <ResultadoNoEncontrado folio={resultado.folio} onSiguiente={reiniciar} />
        )}
      </div>
    </RequireAdminAuth>
  )
}

function ResultadoValido({ reservacion, onSiguiente }: { reservacion: Reservacion; onSiguiente: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-salvia-700">
        <Check className="size-8" />
      </span>
      <div>
        <h1 className="text-xl font-bold">Acceso válido</h1>
        <p className="mt-1 text-sm text-crema-100/70">Boleto marcado como usado justo ahora</p>
      </div>
      <div className="w-full rounded-2xl bg-white/10 p-5 text-left text-sm">
        <DatoScan etiqueta="Asistente" valor={reservacion.nombre} />
        <DatoScan etiqueta="Evento" valor={reservacion.eventoNombre} />
        <DatoScan etiqueta="Personas" valor={`${reservacion.personas}`} />
        <DatoScan etiqueta="Folio" valor={reservacion.folio} ultimo />
      </div>
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onSiguiente}
          className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Escanear siguiente
        </button>
      </div>
    </div>
  )
}

function ResultadoYaUsado({
  reservacion,
  validadaEl,
  onSiguiente,
}: {
  reservacion: Reservacion
  validadaEl: string
  onSiguiente: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-red-700">
        <AlertTriangle className="size-8" />
      </span>
      <div>
        <h1 className="text-xl font-bold">Boleto ya utilizado</h1>
        <p className="mt-1 text-sm text-crema-100/70">
          Este QR se validó antes. No permitas el acceso sin confirmar con recepción.
        </p>
      </div>
      <div className="w-full rounded-2xl bg-white/10 p-5 text-left text-sm">
        <DatoScan etiqueta="Asistente" valor={reservacion.nombre} />
        <DatoScan etiqueta="Evento" valor={reservacion.eventoNombre} />
        <DatoScan etiqueta="Validado el" valor={validadaEl} />
        <DatoScan etiqueta="Folio" valor={reservacion.folio} ultimo />
      </div>
      <button
        type="button"
        onClick={onSiguiente}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Escanear otro boleto
      </button>
    </div>
  )
}

function ResultadoNoEncontrado({ folio, onSiguiente }: { folio: string; onSiguiente: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-red-700">
        <X className="size-8" />
      </span>
      <div>
        <h1 className="text-xl font-bold">Folio no encontrado</h1>
        <p className="mt-1 text-sm text-crema-100/70">
          "{folio}" no corresponde a ninguna reservación de este evento.
        </p>
      </div>
      <button
        type="button"
        onClick={onSiguiente}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}

function DatoScan({ etiqueta, valor, ultimo }: { etiqueta: string; valor: string; ultimo?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${ultimo ? '' : 'border-b border-white/10'}`}>
      <span className="text-crema-100/70">{etiqueta}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}
