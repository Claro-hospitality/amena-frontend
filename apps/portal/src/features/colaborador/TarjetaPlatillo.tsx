import { UtensilsCrossed } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@amena/ui/components/ui/dialog'
import type { PlatilloMenu } from './api'

/**
 * Card de un platillo del menú: foto con tamaño estandarizado (relación 4/3, recorte uniforme)
 * + nombre y descripción recortada. Toda la tarjeta es un botón que abre un diálogo para ver la
 * foto en grande (sin recorte) y leer la descripción completa. Todas las tarjetas quedan del
 * mismo alto sin importar las dimensiones de la foto original.
 */
export function TarjetaPlatillo({ platillo }: { platillo: PlatilloMenu['platillo'] }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`Ver ${platillo.nombre}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left outline-none transition-colors hover:border-salvia-500/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          {platillo.foto_url ? (
            <img
              src={platillo.foto_url}
              alt={platillo.nombre}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <div className="p-3.5">
          <p className="font-semibold leading-snug">{platillo.nombre}</p>
          {platillo.descripcion && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{platillo.descripcion}</p>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <div className="overflow-hidden rounded-xl bg-muted">
          {platillo.foto_url ? (
            <img
              src={platillo.foto_url}
              alt={platillo.nombre}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center">
              <UtensilsCrossed className="size-12 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <DialogHeader>
          <DialogTitle>{platillo.nombre}</DialogTitle>
          <DialogDescription className="whitespace-pre-line text-sm text-muted-foreground">
            {platillo.descripcion?.trim() || 'Sin descripción disponible.'}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
