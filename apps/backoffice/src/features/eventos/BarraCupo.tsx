import { Progress } from '@amena/ui/components/ui/progress'
import { cn } from '@amena/ui/lib/utils'
import type { Evento } from './api'
import { cupoAlto, ocupados, porcentajeOcupado } from './logica'

/**
 * Cupo del evento: los lugares tomados sobre el total y una barra con el avance.
 *
 * La barra usa el `Progress` del kit (de ahí salen el rol y los valores accesibles) y se pinta
 * por sus slots: el componente base no expone el indicador para cambiarle el color, y no se
 * modifica en `packages/ui` por un caso de una sola pantalla. Salvia mientras hay lugares
 * holgados, naranja cuando el evento está por llenarse.
 */
export function BarraCupo({ evento }: { evento: Evento }) {
  const pct = porcentajeOcupado(evento)
  const tomados = ocupados(evento)

  return (
    <div className="flex w-28 flex-col gap-1.5">
      <span className="font-mono text-xs text-tinta-700">
        {tomados} / {evento.cupo_total}
      </span>
      <Progress
        value={pct}
        aria-label={`Cupo: ${tomados} de ${evento.cupo_total} lugares`}
        className={cn(
          'gap-0',
          '[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-crema-200',
          cupoAlto(evento)
            ? '[&_[data-slot=progress-indicator]]:bg-primary'
            : '[&_[data-slot=progress-indicator]]:bg-salvia-500'
        )}
      />
    </div>
  )
}
