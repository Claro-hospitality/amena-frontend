import { Badge } from '@amena/ui/components/ui/badge'
import type { Cierre } from './api'

/** Badge de estado del cierre: cerrado = éxito (inmutable), abierto = en curso. */
export function BadgeEstadoCierre({ estado }: { estado: Cierre['estado'] }) {
  return estado === 'cerrado' ? (
    <Badge className="bg-success text-success-foreground">Cerrado</Badge>
  ) : (
    <Badge variant="secondary">Abierto</Badge>
  )
}
