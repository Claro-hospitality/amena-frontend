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
import { Switch } from '@amena/ui/components/ui/switch'
import type { RolPortal, UsuarioEmpresa } from './api'
import { useEstablecerRol } from './queries'

/**
 * Edita los roles (admin/colaborador) de un usuario del portal. Los roles son SOLO
 * de vista: definen qué ve en el portal, no si come. Cada cambio aplica directo vía
 * el RPC (sin confirmación); la capacidad de comer se gestiona aparte (comensal).
 */
export function EditarRolesDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioEmpresa
  onClose: () => void
}) {
  const establecer = useEstablecerRol()
  const [admin, setAdmin] = useState(usuario.esAdmin)
  const [colaborador, setColaborador] = useState(usuario.esColaborador)

  const aplicar = (rol: RolPortal, activo: boolean, revertir: () => void) => {
    establecer.mutate(
      { usuarioId: usuario.id, rol, activo },
      {
        onSuccess: () =>
          toast.success(
            `${rol === 'admin' ? 'Administrador' : 'Colaborador'} ${activo ? 'asignado' : 'quitado'}`
          ),
        onError: () => {
          toast.error('No se pudo cambiar el rol. Intenta de nuevo.')
          revertir()
        },
      }
    )
  }

  const alternarAdmin = (v: boolean) => {
    setAdmin(v)
    aplicar('admin', v, () => setAdmin(!v))
  }

  const alternarColaborador = (v: boolean) => {
    setColaborador(v)
    aplicar('colaborador', v, () => setColaborador(!v))
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
          <DialogTitle>Roles de {usuario.nombre}</DialogTitle>
          <DialogDescription>
            Los roles definen qué ve en el portal. No afectan si puede comer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="rol-admin">Administrador</Label>
              <p className="text-xs text-muted-foreground">Ve el panel de la empresa.</p>
            </div>
            <Switch
              id="rol-admin"
              checked={admin}
              onCheckedChange={alternarAdmin}
              disabled={establecer.isPending}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="rol-colaborador">Colaborador</Label>
              <p className="text-xs text-muted-foreground">
                Ve su credencial, menú e historial.
              </p>
            </div>
            <Switch
              id="rol-colaborador"
              checked={colaborador}
              onCheckedChange={alternarColaborador}
              disabled={establecer.isPending}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
