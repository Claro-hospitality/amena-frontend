import { X } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@amena/ui/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { aISO, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { MenuDiaConPlatillo } from './api'
import { platillosDisponibles } from './logica'
import { SelectorPlatillo } from './SelectorPlatillo'
import type { Platillo } from '../platillos/api'

/**
 * Panel lateral (derecha) con el menú de un día: lista completa de platillos con opción
 * de quitar y un selector para agregar. Los días pasados son de solo lectura.
 */
export function DiaMenuPanel({
  fecha,
  asignados,
  activos,
  onAgregar,
  onQuitar,
  onClose,
}: {
  fecha: Date
  asignados: MenuDiaConPlatillo[]
  activos: Platillo[]
  onAgregar: (fechaISO: string, platilloId: number) => void
  onQuitar: (id: number) => void
  onClose: () => void
}) {
  const pasado = esFechaPasada(fecha)
  const fechaISO = aISO(fecha)
  const disponibles = platillosDisponibles(
    activos,
    asignados.map((m) => m.platillo.id)
  )

  return (
    <Sheet
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <SheetContent
        side="right"
        // Deslizamiento completo desde la derecha al abrir/cerrar (más notorio que el sutil del kit).
        className="w-full gap-0 duration-300 ease-out data-[side=right]:data-starting-style:translate-x-full data-[side=right]:data-ending-style:translate-x-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle className="capitalize">{etiquetaDia(fecha)}</SheetTitle>
          <SheetDescription>
            {pasado ? 'Día pasado — solo lectura.' : 'Platillos del menú de este día.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <ul className="flex flex-col gap-1.5">
            {asignados.length === 0 && (
              <li className="rounded-md bg-muted/40 px-3 py-6 text-center text-sm text-muted-foreground">
                Este día aún no tiene platillos.
              </li>
            )}
            {asignados.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
