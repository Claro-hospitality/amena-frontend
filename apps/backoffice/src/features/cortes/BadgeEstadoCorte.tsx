import { Badge } from '@amena/ui/components/ui/badge'
import type { Corte } from './api'

/** Badge de estado del corte: cerrado = éxito (inmutable), abierto = en curso. */
export function BadgeEstadoCorte({ estado }: { estado: Corte['estado'] }) {
  return estado === 'cerrado' ? (
    <Badge className="bg-success text-success-foreground">Cerrado</Badge>
  ) : (
    <Badge variant="secondary">Abierto</Badge>
  )
}
