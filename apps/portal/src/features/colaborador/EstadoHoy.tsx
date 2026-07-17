import { CircleCheck, CircleSlash } from 'lucide-react'
import type { EstadoHoy as EstadoHoyData } from './api'
import { calcularEstadoHoy } from './logica'

/** Tarjeta del estado de la comida de hoy. */
export function EstadoHoy({ estado }: { estado: EstadoHoyData }) {
  const r = calcularEstadoHoy(estado)

  if (r.tipo === 'sin-comida') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-muted-foreground">
        <CircleSlash className="size-6 shrink-0" aria-hidden />
        <p className="font-medium">Sin comida asignada hoy</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground">
      <CircleCheck className="size-6 shrink-0" aria-hidden />
      <p className="font-medium">
        {r.tipo === 'consumido' ? `Ya comiste hoy a las ${r.hora}` : 'Tienes comida hoy'}
      </p>
    </div>
  )
}
