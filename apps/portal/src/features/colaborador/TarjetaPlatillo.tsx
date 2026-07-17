import { UtensilsCrossed } from 'lucide-react'
import { AspectRatio } from '@amena/ui/components/ui/aspect-ratio'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import type { PlatilloMenu } from './api'

/** Card de un platillo del menú: foto (o placeholder) + nombre. */
export function TarjetaPlatillo({ platillo }: { platillo: PlatilloMenu['platillo'] }) {
  return (
    <Card className="overflow-hidden py-0">
      <AspectRatio ratio={16 / 9}>
        {platillo.foto_url ? (
          <img src={platillo.foto_url} alt={platillo.nombre} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted">
            <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </AspectRatio>
      <CardContent className="p-3">
        <p className="font-medium">{platillo.nombre}</p>
      </CardContent>
    </Card>
  )
}
