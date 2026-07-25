import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { ordinalComida } from '@amena/utils'
import { reproducirSonidoEscaner } from './sonidoEscaner'

export type Resultado =
  | {
      tipo: 'exito'
      nombre: string
      empresa: string | null
      hora: string
      /** En modo libre: cuántas comidas lleva hoy (para "Nª comida de hoy"). */
      consumosHoy?: number
      modo?: 'reserva' | 'libre'
    }
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
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center duration-300 ease-out animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none sm:gap-6 sm:p-8 ${
        exito
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      }`}
    >
      {/* Ícono con "pop" natural; en éxito un anillo se expande una vez detrás. */}
      <span className="relative flex size-24 shrink-0 items-center justify-center sm:size-28">
        {exito && (
          <span className="absolute inset-0 rounded-full bg-white/25 animate-ping motion-reduce:animate-none" />
        )}
        <span
          className="relative flex size-full items-center justify-center rounded-full bg-white/20 duration-500 ease-out animate-in zoom-in-50 motion-reduce:animate-none"
          style={{ animationDelay: '80ms' }}
        >
          {exito ? <Check className="size-14 sm:size-16" /> : <X className="size-14 sm:size-16" />}
        </span>
      </span>

      <div
        className="flex flex-col items-center gap-2 duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:gap-3"
        style={{ animationDelay: '150ms' }}
      >
        {resultado.tipo === 'exito' ? (
          <>
            <p className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              {resultado.nombre}
            </p>
            {resultado.empresa && (
              <p className="text-xl opacity-90 sm:text-2xl">{resultado.empresa}</p>
            )}
            {resultado.modo === 'libre' && resultado.consumosHoy != null && (
              <p className="text-2xl font-semibold sm:text-3xl">
                {ordinalComida(resultado.consumosHoy)} comida de hoy
              </p>
            )}
            <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{resultado.hora}</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              {resultado.motivo}
            </p>
            {resultado.nombre && (
              <p className="text-xl opacity-90 sm:text-2xl">{resultado.nombre}</p>
            )}
          </>
        )}
      </div>

      <p
        className="text-sm opacity-80 duration-500 ease-out animate-in fade-in-0 motion-reduce:animate-none"
        style={{ animationDelay: '400ms' }}
      >
        Toca para continuar
      </p>
    </button>
  )
}
