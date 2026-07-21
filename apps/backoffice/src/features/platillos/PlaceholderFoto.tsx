import { UtensilsCrossed } from 'lucide-react'

/** Marcador de posición para platillos sin foto (tokens del tema, nunca imagen rota). */
export function PlaceholderFoto() {
  return (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
      <UtensilsCrossed className="size-8" aria-hidden />
    </div>
  )
}
