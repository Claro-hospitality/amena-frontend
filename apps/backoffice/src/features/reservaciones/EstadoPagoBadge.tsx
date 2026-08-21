import { cn } from '@amena/ui/lib/utils'
import type { EstadoPago } from './api'

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        estado === 'pagada' && 'bg-salvia-100 text-salvia-700',
        estado === 'pendiente' && 'bg-naranja-100 text-naranja-700',
        estado === 'cancelada' && 'bg-secondary text-muted-foreground'
      )}
    >
      {estado}
    </span>
  )
}
