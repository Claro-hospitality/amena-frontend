import { Badge } from '@amena/ui/components/ui/badge'
import type { EstadoFactura } from './api'

const ESTILO: Record<EstadoFactura, { className?: string; variant?: 'secondary'; label: string }> = {
  borrador: { variant: 'secondary', label: 'Borrador' },
  emitida: { className: 'bg-success text-success-foreground', label: 'Emitida' },
  error: { className: 'bg-destructive text-destructive-foreground', label: 'Error' },
  pagada: { className: 'bg-success text-success-foreground', label: 'Pagada' },
  cancelada: { variant: 'secondary', label: 'Cancelada' },
}

export function BadgeEstadoFactura({ estado }: { estado: EstadoFactura }) {
  const { className, variant, label } = ESTILO[estado]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
