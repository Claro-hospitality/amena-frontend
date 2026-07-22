import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Label } from '@amena/ui/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@amena/ui/components/ui/radio-group'
import type { RolPortal, UsuarioEmpresa } from './api'
import { useAsignarRolUnico } from './queries'

/**
 * Elige el rol ÚNICO (admin XOR colaborador) de un usuario del portal. El rol define
 * qué ve en el portal, no si come. Se elige un solo rol vía radio-group y se aplica
 * directo (sin confirmación) vía el RPC `asignar_rol_unico`, que activa el elegido y
 * desactiva el otro de forma atómica. La capacidad de comer se gestiona aparte
 * (comensal).
 */
export function EditarRolesDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioEmpresa
  onClose: () => void
}) {
  const asignar = useAsignarRolUnico()
  const [rol, setRol] = useState<RolPortal | null>(usuario.rol)

  const aplicar = (nuevoRol: RolPortal) => {
    const anterior = rol
    setRol(nuevoRol)
    asignar.mutate(
      { usuarioId: usuario.id, rol: nuevoRol },
      {
        onSuccess: () =>
          toast.success(
            `${nuevoRol === 'admin' ? 'Administrador' : 'Colaborador'} asignado a ${usuario.nombre}`
          ),
        onError: () => {
          toast.error('No se pudo cambiar el rol. Intenta de nuevo.')
          setRol(anterior)
        },
      }
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rol de {usuario.nombre}</DialogTitle>
          <DialogDescription>
            Cada persona tiene un solo rol (define qué ve en el portal). No afecta si
            puede comer.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={rol ?? undefined}
          onValueChange={(valor) => aplicar(valor as RolPortal)}
          disabled={asignar.isPending}
          aria-label="Rol"
        >
          <div className="flex items-start gap-3">
            <RadioGroupItem id="rol-admin" value="admin" className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="rol-admin">Administrador</Label>
              <p className="text-xs text-muted-foreground">Ve el panel de la empresa.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RadioGroupItem id="rol-colaborador" value="colaborador" className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="rol-colaborador">Colaborador</Label>
              <p className="text-xs text-muted-foreground">
                Ve su credencial, menú e historial.
              </p>
            </div>
          </div>
        </RadioGroup>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
