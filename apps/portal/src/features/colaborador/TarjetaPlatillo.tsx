import { UtensilsCrossed } from 'lucide-react'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import type { PlatilloMenu } from './api'

/**
 * Card de un platillo del menú: foto con tamaño estandarizado (relación 4/3, recorte
 * uniforme) + nombre y descripción. Todas las tarjetas quedan del mismo alto sin importar
 * las dimensiones de la foto original.
 */
export function TarjetaPlatillo({ platillo }: { platillo: PlatilloMenu['platillo'] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {platillo.foto_url ? (
          <img
            src={platillo.foto_url}
            alt={platillo.nombre}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>
      <CardContent className="p-3.5">
        <p className="font-semibold leading-snug">{platillo.nombre}</p>
        {platillo.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{platillo.descripcion}</p>
        )}
      </CardContent>
    </Card>
  )
}
