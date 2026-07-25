import { useId } from 'react'
import { KeyRound, MoreVertical, Pencil, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
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

/**
 * Menú de acciones secundarias. El **acceso** (`accesoActivo` = usuarios_portal_empresarial.activo)
 * es el interruptor único: al desactivarlo se apaga también la comida del comensal (consumo + QR)
 * y al reactivarlo se encienden, en una sola acción (lo cascadea el backend). **Eliminar**
 * (borrado lógico) solo aparece con el acceso ya desactivado.
 */
export function AccionesColaborador({
  colaborador,
  onEditar,
  onResetear,
  onToggleAcceso,
  onEliminar,
}: {
  colaborador: Colaborador
  onEditar: (colaborador: Colaborador) => void
  onResetear: (colaborador: Colaborador) => void
  onToggleAcceso: (colaborador: Colaborador) => void
  onEliminar: (colaborador: Colaborador) => void
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
        {/* Acceso (login) solo aplica a quien ya tiene cuenta. Al desactivarlo se apaga también su comida. */}
        {colaborador.user_id != null && (
          <DropdownMenuItem onClick={() => onToggleAcceso(colaborador)}>
            {colaborador.accesoActivo ? (
              <ShieldOff className="size-4" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {colaborador.accesoActivo ? 'Desactivar acceso' : 'Activar acceso'}
          </DropdownMenuItem>
        )}
        {/* Borrado lógico: solo tras desactivar el acceso. */}
        {colaborador.user_id != null && !colaborador.accesoActivo && (
          <DropdownMenuItem variant="destructive" onClick={() => onEliminar(colaborador)}>
            <Trash2 className="size-4" />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
