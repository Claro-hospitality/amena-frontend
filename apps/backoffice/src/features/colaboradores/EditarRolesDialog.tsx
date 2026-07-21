import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
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
 * Edita los roles (admin/colaborador) de un usuario del portal. Aplica cada cambio
 * al vuelo vía el RPC. Quitar "colaborador" pide confirmación porque desactiva su
 * credencial/QR (deja de consumir; su historial se conserva).
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
  const [confirmarQuitar, setConfirmarQuitar] = useState(false)

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
    if (!v) {
      setConfirmarQuitar(true) // quitar colaborador → confirmar (desactiva su comensal/QR)
      return
    }
    setColaborador(true)
    aplicar('colaborador', true, () => setColaborador(false))
  }

  const confirmarQuitarColaborador = () => {
    setConfirmarQuitar(false)
    setColaborador(false)
    aplicar('colaborador', false, () => setColaborador(true))
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(abierto) => {
          if (!abierto) onClose()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Roles de {usuario.nombre}</DialogTitle>
            <DialogDescription>Activa o desactiva sus roles en la empresa.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="rol-admin">Administrador</Label>
                <p className="text-xs text-muted-foreground">
                  Gestiona la empresa y sus usuarios en el portal.
                </p>
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
                  Puede consumir (genera su QR). Quitarlo desactiva su credencial; su historial se
                  conserva.
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

      <AlertDialog
        open={confirmarQuitar}
        onOpenChange={(abierto) => {
          if (!abierto) setConfirmarQuitar(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar el rol colaborador de {usuario.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desactivará su credencial (QR) y dejará de poder consumir. Su historial de
              consumos y cuotas se conserva; puedes reactivarlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarQuitarColaborador}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
