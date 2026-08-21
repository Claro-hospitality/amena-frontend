import { cn } from '@amena/ui/lib/utils'
import type { EstadoEvento } from './api'

/**
 * Estado del evento en el listado. Espeja a `EstadoPagoBadge` de reservaciones.
 *
 * "Borrador" va en ámbar y no en gris neutro: es un evento que alguien dejó a medias y que el
 * público NO está viendo, así que conviene que salte a la vista en la tabla.
 */
export function EstadoEventoBadge({ estado }: { estado: EstadoEvento }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold',
        estado === 'Publicado'
          ? 'bg-salvia-100 text-salvia-700'
          : 'bg-warning/15 text-warning-foreground'
      )}
    >
      {estado}
    </span>
  )
}
