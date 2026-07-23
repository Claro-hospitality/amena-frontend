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
import { CredencialesAcceso } from '@amena/ui/components/ui/credenciales-acceso'
import { Dialog, DialogContent } from '@amena/ui/components/ui/dialog'
import type { Colaborador, CredencialesAlta } from './api'
import { useResetearPasswordColaborador } from './queries'

/**
 * Restablece la contraseña de un colaborador: confirma la acción y, al hacerlo, muestra la
 * contraseña temporal UNA sola vez (reutiliza el panel de credenciales del alta).
 */
export function RestablecerPasswordColaborador({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const resetear = useResetearPasswordColaborador()
  const [creds, setCreds] = useState<CredencialesAlta | null>(null)

  const confirmar = () => {
    resetear.mutate(colaborador.usuario_id, {
      onSuccess: (c) => setCreds(c),
      onError: () => toast.error('No se pudo restablecer la contraseña. Intenta de nuevo.'),
    })
  }

  // Tras restablecer: se entrega la contraseña temporal (no se vuelve a mostrar).
  if (creds) {
    return (
      <Dialog
        open
        onOpenChange={(abierto) => {
          if (!abierto) onClose()
        }}
      >
        <DialogContent>
          <CredencialesAcceso credenciales={creds} onClose={onClose} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AlertDialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer la contraseña de {colaborador.nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se generará una contraseña temporal que verás una sola vez para entregársela; al
            iniciar sesión deberá cambiarla. Su contraseña actual dejará de funcionar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} loading={resetear.isPending}>
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
