import { MoreVertical, Pencil, Power, PowerOff } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@amena/ui/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import type { Colaborador } from './api'

/** Menú de acciones secundarias (editar / desactivar-reactivar) de un colaborador. */
export function AccionesColaborador({
  colaborador,
  onEditar,
  onCambiarEstado,
}: {
  colaborador: Colaborador
  onEditar: (colaborador: Colaborador) => void
  onCambiarEstado: (colaborador: Colaborador) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Acciones de ${colaborador.nombre}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditar(colaborador)}>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCambiarEstado(colaborador)}>
          {colaborador.activo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
          {colaborador.activo ? 'Desactivar' : 'Reactivar'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Botón "Invitar" deshabilitado (V1: la invitación por email aún no se implementa). */
export function BotonInvitar({ colaborador }: { colaborador: Colaborador }) {
  if (colaborador.user_id != null) return null
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span tabIndex={0}>
            <Button variant="outline" size="xs" disabled>
              Invitar
            </Button>
          </span>
        }
      />
      <TooltipContent>Próximamente</TooltipContent>
    </Tooltip>
  )
}
