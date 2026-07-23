import { Plus } from 'lucide-react'
import { diaDelMes, esFechaPasada, esFinDeSemana, etiquetaDia } from '@amena/utils'
import { cn } from '@amena/ui/lib/utils'
import type { MenuDiaConPlatillo } from './api'

/** Cuántos platillos se ven en la celda antes de colapsar en "+N más". */
const MAX_VISIBLE = 2

/**
 * Una celda del calendario mensual. Los días hábiles del mes son interactivos
 * (abren el diálogo del día); fines de semana y días de otros meses se atenúan.
 */
export function DiaCeldaMes({
  fecha,
  esDelMes,
  asignados,
  onAbrir,
}: {
  fecha: Date
  esDelMes: boolean
  asignados: MenuDiaConPlatillo[]
  onAbrir: (fecha: Date) => void
}) {
  const numero = diaDelMes(fecha)

  // Días de otros meses: solo el número, muy tenue, sin interacción.
  if (!esDelMes) {
    return (
      <div className="min-h-28 rounded-lg border border-transparent p-2 text-xs text-muted-foreground/40">
        {numero}
      </div>
    )
  }

  // Fines de semana: no hay servicio de comidas.
  if (esFinDeSemana(fecha)) {
    return (
      <div className="flex min-h-28 flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-2">
        <span className="text-sm font-medium text-muted-foreground">{numero}</span>
        <span className="text-[11px] text-muted-foreground/70">Sin servicio</span>
      </div>
    )
  }

  const pasado = esFechaPasada(fecha)
  const visibles = asignados.slice(0, MAX_VISIBLE)
  const restantes = asignados.length - visibles.length

  return (
    <button
      type="button"
      onClick={() => onAbrir(fecha)}
      aria-label={`Editar menú de ${etiquetaDia(fecha)}`}
      className={cn(
        'group flex min-h-28 flex-col gap-1.5 rounded-lg border border-border p-2 text-left transition-colors',
        'hover:border-primary/50 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        pasado ? 'bg-muted/30' : 'bg-card'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{numero}</span>
        <Plus className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {asignados.length === 0 ? (
        <span className="text-[11px] text-muted-foreground">Sin platillos</span>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {visibles.map((m) => (
            <li
              key={m.id}
              className="truncate rounded bg-muted px-1.5 py-0.5 text-[11px] leading-tight"
              title={m.platillo.nombre}
            >
              {m.platillo.nombre}
            </li>
          ))}
          {restantes > 0 && (
            <li className="px-1 pt-0.5 text-[11px] font-medium text-primary">+{restantes} más</li>
          )}
        </ul>
      )}
    </button>
  )
}
