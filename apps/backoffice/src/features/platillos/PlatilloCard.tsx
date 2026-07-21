import { Pencil, Power, PowerOff } from 'lucide-react'
import { AspectRatio } from '@amena/ui/components/ui/aspect-ratio'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { cn } from '@amena/ui/lib/utils'
import type { Platillo } from './api'
import { PlaceholderFoto } from './PlaceholderFoto'

export function PlatilloCard({
  platillo,
  onEditar,
  onCambiarEstado,
}: {
  platillo: Platillo
  onEditar: (platillo: Platillo) => void
  onCambiarEstado: (platillo: Platillo) => void
}) {
  return (
    <Card className={cn('overflow-hidden', !platillo.activo && 'opacity-60')}>
      <AspectRatio ratio={16 / 9}>
        {platillo.foto_url ? (
          <img src={platillo.foto_url} alt={platillo.nombre} className="size-full object-cover" />
        ) : (
          <PlaceholderFoto />
        )}
      </AspectRatio>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{platillo.nombre}</p>
            {platillo.descripcion && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{platillo.descripcion}</p>
            )}
          </div>
          {!platillo.activo && <Badge variant="secondary">Inactivo</Badge>}
        </div>
        <div className="mt-3 flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditar(platillo)}
                  aria-label={`Editar ${platillo.nombre}`}
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCambiarEstado(platillo)}
                  aria-label={`${platillo.activo ? 'Desactivar' : 'Reactivar'} ${platillo.nombre}`}
                >
                  {platillo.activo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                </Button>
              }
            />
            <TooltipContent>{platillo.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
