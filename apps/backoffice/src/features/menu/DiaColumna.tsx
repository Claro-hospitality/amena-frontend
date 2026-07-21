import { X } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { aISO, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { MenuDiaConPlatillo } from './api'
import { platillosDisponibles } from './logica'
import { SelectorPlatillo } from './SelectorPlatillo'
import type { Platillo } from '../platillos/api'

export function DiaColumna({
  fecha,
  asignados,
  activos,
  onAgregar,
  onQuitar,
}: {
  fecha: Date
  asignados: MenuDiaConPlatillo[]
  activos: Platillo[]
  onAgregar: (fechaISO: string, platilloId: number) => void
  onQuitar: (id: number) => void
}) {
  const pasado = esFechaPasada(fecha)
  const fechaISO = aISO(fecha)
  const disponibles = platillosDisponibles(
    activos,
    asignados.map((m) => m.platillo.id)
  )

  return (
    <section
      aria-label={etiquetaDia(fecha)}
      className={`flex flex-col gap-3 rounded-lg border border-border p-3 ${
        pasado ? 'bg-muted/30' : 'bg-card'
      }`}
    >
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium capitalize">{etiquetaDia(fecha)}</h3>
        {pasado && <span className="text-xs text-muted-foreground">Pasado</span>}
      </header>

      <ul className="flex flex-col gap-1.5">
        {asignados.length === 0 && (
          <li className="text-xs text-muted-foreground">Sin platillos</li>
        )}
        {asignados.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm"
          >
            <span className="min-w-0 truncate">{m.platillo.nombre}</span>
            {!pasado && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onQuitar(m.id)}
                      aria-label={`Quitar ${m.platillo.nombre}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Quitar</TooltipContent>
              </Tooltip>
            )}
          </li>
        ))}
      </ul>

      {!pasado && (
        <SelectorPlatillo
          opciones={disponibles}
          onAgregar={(platilloId) => onAgregar(fechaISO, platilloId)}
        />
      )}
    </section>
  )
}
