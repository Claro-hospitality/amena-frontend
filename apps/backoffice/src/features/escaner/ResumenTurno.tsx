import { useMemo } from 'react'
import { useConsumosHoy } from './queries'

/** Una métrica del resumen: número grande + etiqueta. */
function Metrica({ etiqueta, valor, destacado }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-3 ${
        destacado ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <span className="text-2xl font-bold tabular-nums sm:text-3xl" aria-live="polite">
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}

/**
 * Resumen vivo del turno: total servido hoy, tus escaneos y, si hay consumos en modo libre,
 * cuántos van. Lee la misma query que la lista (se mantiene al día por Realtime).
 */
export function ResumenTurno({ miUid }: { miUid: string }) {
  const { data } = useConsumosHoy()
  const consumos = useMemo(() => data ?? [], [data])
  const total = consumos.length
  const mios = consumos.filter((c) => c.registrado_por === miUid).length
  const libres = consumos.filter((c) => c.origen === 'libre').length

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Metrica etiqueta="Servidas hoy" valor={total} destacado />
      <Metrica etiqueta="Tus escaneos" valor={mios} />
      {libres > 0 && <Metrica etiqueta="Consumos libres" valor={libres} />}
    </div>
  )
}
