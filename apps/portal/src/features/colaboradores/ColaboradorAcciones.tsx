import { useId } from 'react'
import { KeyRound, MoreVertical, Pencil, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@amena/ui/components/ui/dropdown-menu'
import { Label } from '@amena/ui/components/ui/label'
import { Switch } from '@amena/ui/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { empresaEnModoLibre, type Colaborador } from './api'
import { useConsumoLibre } from './queries'

/**
 * Toggle de consumo libre por comensal. Solo se muestra si la empresa está en modo
 * libre. Llama al RPC con `usuario_id` (id de usuarios_portal_empresarial), no el de
 * comensal.
 */
export function ToggleConsumoLibre({ colaborador }: { colaborador: Colaborador }) {
  const consumoLibre = useConsumoLibre()
  const id = useId()
  if (!empresaEnModoLibre(colaborador)) return null

  const cambiar = (activo: boolean) => {
    consumoLibre.mutate(
      { usuarioId: colaborador.usuario_id, activo },
      {
        onSuccess: () =>
          toast.success(
            activo
              ? `Consumo libre activado para ${colaborador.nombre}`
              : `Consumo libre desactivado para ${colaborador.nombre}`
          ),
        onError: () => toast.error('No se pudo cambiar el consumo libre. Intenta de nuevo.'),
      }
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        size="sm"
        checked={colaborador.consumoLibre}
        disabled={consumoLibre.isPending}
        onCheckedChange={cambiar}
      />
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        Consumo libre
      </Label>
    </div>
  )
}

/** Menú de acciones secundarias (editar / restablecer contraseña / desactivar-reactivar). */
export function AccionesColaborador({
  colaborador,
  onEditar,
  onCambiarEstado,
  onResetear,
}: {
  colaborador: Colaborador
  onEditar: (colaborador: Colaborador) => void
  onCambiarEstado: (colaborador: Colaborador) => void
  onResetear: (colaborador: Colaborador) => void
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
        {/* Solo tiene sentido si la persona ya tiene cuenta de acceso. */}
        {colaborador.user_id != null && (
          <DropdownMenuItem onClick={() => onResetear(colaborador)}>
            <KeyRound className="size-4" />
            Restablecer contraseña
          </DropdownMenuItem>
        )}
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
