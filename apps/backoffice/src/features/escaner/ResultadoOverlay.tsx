import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { reproducirSonidoEscaner } from './sonidoEscaner'

export type Resultado =
  | { tipo: 'exito'; nombre: string; empresa: string | null; hora: string }
  | { tipo: 'rechazo'; motivo: string; nombre: string | null }

/**
 * Resultado a pantalla completa, legible a 1 metro. Vibra, se auto-descarta a los ~4 s
 * y también se descarta por toque en cualquier parte.
 */
export function ResultadoOverlay({
  resultado,
  onCerrar,
  autoMs = 4000,
}: {
  resultado: Resultado
  onCerrar: () => void
  autoMs?: number
}) {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(resultado.tipo === 'exito' ? 120 : [80, 60, 80])
    }
    reproducirSonidoEscaner(resultado.tipo)
    const t = setTimeout(onCerrar, autoMs)
    return () => clearTimeout(t)
  }, [resultado, onCerrar, autoMs])

  const exito = resultado.tipo === 'exito'

  return (
    <button
      type="button"
      onClick={onCerrar}
      aria-label="Descartar y seguir escaneando"
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 p-8 text-center ${
        exito
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      }`}
    >
      <span className="flex size-28 items-center justify-center rounded-full bg-white/20">
        {exito ? <Check className="size-16" /> : <X className="size-16" />}
      </span>

      {resultado.tipo === 'exito' ? (
        <>
          <p className="text-5xl font-bold leading-tight md:text-6xl">{resultado.nombre}</p>
          {resultado.empresa && <p className="text-2xl opacity-90">{resultado.empresa}</p>}
          <p className="text-3xl font-semibold tabular-nums">{resultado.hora}</p>
        </>
      ) : (
        <>
          <p className="text-5xl font-bold leading-tight md:text-6xl">{resultado.motivo}</p>
          {resultado.nombre && <p className="text-2xl opacity-90">{resultado.nombre}</p>}
        </>
      )}

      <p className="text-sm opacity-80">Toca para continuar</p>
    </button>
  )
}
