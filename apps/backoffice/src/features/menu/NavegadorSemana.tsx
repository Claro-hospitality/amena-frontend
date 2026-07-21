import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { deISO, rangoSemanaLegible } from '@amena/utils'

export function NavegadorSemana({
  lunesISO,
  onAnterior,
  onSiguiente,
}: {
  lunesISO: string
  onAnterior: () => void
  onSiguiente: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={onAnterior} aria-label="Semana anterior">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium">
        {rangoSemanaLegible(deISO(lunesISO))}
      </span>
      <Button variant="outline" size="icon-sm" onClick={onSiguiente} aria-label="Semana siguiente">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
