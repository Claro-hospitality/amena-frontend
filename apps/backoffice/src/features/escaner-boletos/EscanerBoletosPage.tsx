import { useMemo, useState, type FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AlertTriangle, Check, ChevronLeft, Keyboard, ScanLine, X } from 'lucide-react'
import { fechaBadge } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { TEXTOS_CAMARA, useLectorQR } from '../../lib/useLectorQR'
import { useEventos } from '../eventos/queries'
import { puedeVerEventos } from '../eventos/logica'
import type { Reservacion } from '../reservaciones/api'
import { marcaDeTiempo } from '@amena/utils'
import { useBoletosValidados, useValidarBoleto } from '../reservaciones/queries'

type Resultado =
  | { tipo: 'valido'; reservacion: Reservacion }
  | { tipo: 'ya-usado'; reservacion: Reservacion; validadaEl: string }
  | { tipo: 'no-encontrado'; folio: string }

/**
 * Escáner de boletos de eventos. Va FUERA del shell del backoffice (ver `conShell` en
 * RutaProtegida): es una pantalla de operación en la puerta, a viewport completo, y el color
 * de fondo es la señal principal para quien está validando — verde pasa, rojo no.
 */
export function EscanerBoletosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const eventos = useEventos()
  const validar = useValidarBoleto()

  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [capturaManual, setCapturaManual] = useState(false)
  const [folioInput, setFolioInput] = useState('')
  // El evento se DERIVA en vez de sincronizarse por efecto: mientras nadie elija, manda el
  // primero de la lista. Guardar la selección en estado y sincronizarla dispararía un render
  // de más en cuanto llegan los datos.
  const [eventoElegido, setEventoElegido] = useState<string | null>(null)

  const listaEventos = useMemo(() => eventos.data ?? [], [eventos.data])
  const eventoSlug = eventoElegido ?? listaEventos[0]?.slug ?? ''
  const evento = listaEventos.find((e) => e.slug === eventoSlug)

  // Lo cuenta la base. Antes se filtraba en memoria el arreglo con TODAS las reservaciones, que
  // ya no existe (y con más de 1000 filas nunca fue confiable).
  const validados = useBoletosValidados(evento?.id).data ?? 0

  async function procesarFolio(folio: string) {
    const r = await validar.mutateAsync(folio)
    if (r.tipo === 'no-encontrado') {
      setResultado({ tipo: 'no-encontrado', folio })
      return
    }
    if (r.tipo === 'ya-usado') {
      setResultado({
        tipo: 'ya-usado',
        reservacion: r.reservacion,
        validadaEl: r.reservacion.validada_el
          ? marcaDeTiempo(r.reservacion.validada_el)
          : 'hace un momento',
      })
      return
    }
    setResultado({ tipo: 'valido', reservacion: r.reservacion })
  }

  // `activo` pausa el reporte de lecturas mientras se muestra un resultado, sin apagar la cámara.
  const { videoRef, estado: estadoCamara, reintentar } = useLectorQR({
    activo: !resultado,
    onDetectar: (texto) => {
      if (!resultado) void procesarFolio(texto)
    },
  })

  if (!puedeVerEventos(rol)) {
    return <p className="p-6 text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  function validarFolioManual(e: FormEvent) {
    e.preventDefault()
    if (folioInput.trim()) void procesarFolio(folioInput.trim())
  }

  function reiniciar() {
    setResultado(null)
    setCapturaManual(false)
    setFolioInput('')
  }

  const camaraFallo =
    estadoCamara === 'denegada' ||
    estadoCamara === 'sin-camara' ||
    estadoCamara === 'insegura' ||
    estadoCamara === 'error'

  const colorFondo =
    resultado?.tipo === 'valido'
      ? 'bg-salvia-700'
      : resultado?.tipo === 'ya-usado' || resultado?.tipo === 'no-encontrado'
        ? 'bg-red-800'
        : 'bg-tinta-900'

  return (
    <div className={`flex min-h-dvh flex-col text-crema-50 ${colorFondo}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to="/eventos"
          aria-label="Volver al resumen de eventos"
          className="flex size-9 items-center justify-center rounded-full bg-white/10"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">Escanear boleto</p>
        <span className="size-9" />
      </div>

      {!resultado && (
        <>
          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`size-full object-cover ${camaraFallo ? 'hidden' : ''}`}
            />
            {camaraFallo && (
              <div className="flex size-full flex-col items-center justify-center gap-4 bg-black/40 px-8 text-center text-sm text-crema-100/70">
                <p>
                  {TEXTOS_CAMARA[estadoCamara].detalle} Mientras tanto, usa la captura manual.
                </p>
                <button
                  type="button"
                  onClick={reintentar}
                  className="rounded-full border border-crema-50/30 bg-white/10 px-4 py-2 text-xs font-semibold text-crema-50"
                >
                  Reintentar acceso a la cámara
                </button>
              </div>
            )}
            {!camaraFallo && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="size-56 rounded-3xl border-2 border-dashed border-crema-50/70" />
                <div className="rounded-full bg-black/50 px-4 py-2 text-center text-xs">
                  <p className="font-medium">Alinea el QR del boleto dentro del marco</p>
                  <p className="text-crema-100/70">La validación es automática al detectarlo</p>
                </div>
              </div>
            )}
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
            <form onSubmit={validarFolioManual} className="mx-4 mb-4 flex flex-col gap-2">
              <label htmlFor="folio-manual" className="sr-only">
                Folio del boleto
              </label>
              <input
                id="folio-manual"
                autoFocus
                value={folioInput}
                onChange={(e) => setFolioInput(e.target.value)}
                placeholder="AMN-EV-2026-00418"
                className="h-12 rounded-xl border border-crema-50/30 bg-white/10 px-4 font-mono text-sm text-crema-50 outline-none placeholder:text-crema-100/40 focus-visible:border-crema-50"
              />
              <button
                type="submit"
                disabled={validar.isPending}
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <ScanLine className="size-4" />
                Validar folio
              </button>
            </form>
          )}

          <div className="mx-4 mb-6 flex flex-col gap-2 rounded-2xl bg-white/10 p-4">
            <label
              htmlFor="evento-escaner"
              className="font-mono text-[10px] font-semibold uppercase tracking-widest text-crema-100/70"
            >
              Contando accesos de
            </label>
            <select
              id="evento-escaner"
              value={eventoSlug}
              onChange={(e) => setEventoElegido(e.target.value)}
              className="rounded-lg border border-crema-50/30 bg-white/10 px-2.5 py-1.5 font-semibold text-crema-50 outline-none"
            >
              {listaEventos.map((e) => (
                <option key={e.slug} value={e.slug} className="text-tinta-900">
                  {e.titulo}
                </option>
              ))}
            </select>
            {evento && (
              <p className="text-xs text-crema-100/70">
                {fechaBadge(evento.fecha, evento.hora_inicio)}
              </p>
            )}
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-salvia-500"
                style={{ width: `${evento ? (validados / evento.cupo_total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-crema-100/70">
              Boletos validados · {validados} / {evento?.cupo_total ?? '—'}
            </p>
          </div>
        </>
      )}

      {resultado?.tipo === 'valido' && (
        <ResultadoValido reservacion={resultado.reservacion} onSiguiente={reiniciar} />
      )}
      {resultado?.tipo === 'ya-usado' && (
        <ResultadoYaUsado
          reservacion={resultado.reservacion}
          validadaEl={resultado.validadaEl}
          onSiguiente={reiniciar}
        />
      )}
      {resultado?.tipo === 'no-encontrado' && (
        <ResultadoNoEncontrado folio={resultado.folio} onSiguiente={reiniciar} />
      )}
    </div>
  )
}

function ResultadoValido({
  reservacion,
  onSiguiente,
}: {
  reservacion: Reservacion
  onSiguiente: () => void
}) {
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
        <DatoScan etiqueta="Evento" valor={reservacion.eventos?.titulo ?? '—'} />
        <DatoScan etiqueta="Personas" valor={String(reservacion.personas)} />
        <DatoScan etiqueta="Folio" valor={reservacion.folio} ultimo />
      </div>
      <button
        type="button"
        onClick={onSiguiente}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Escanear siguiente
      </button>
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
        <DatoScan etiqueta="Evento" valor={reservacion.eventos?.titulo ?? '—'} />
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

function ResultadoNoEncontrado({
  folio,
  onSiguiente,
}: {
  folio: string
  onSiguiente: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-red-700">
        <X className="size-8" />
      </span>
      <div>
        <h1 className="text-xl font-bold">Folio no encontrado</h1>
        {/* Se valida contra TODAS las reservaciones, no solo las del evento seleccionado:
            el selector de arriba solo alimenta el contador. */}
        <p className="mt-1 text-sm text-crema-100/70">
          «{folio}» no corresponde a ninguna reservación.
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

function DatoScan({
  etiqueta,
  valor,
  ultimo,
}: {
  etiqueta: string
  valor: string
  ultimo?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${ultimo ? '' : 'border-b border-white/10'}`}
    >
      <span className="text-crema-100/70">{etiqueta}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}
