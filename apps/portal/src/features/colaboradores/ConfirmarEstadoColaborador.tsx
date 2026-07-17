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
import type { Colaborador } from './api'
import { useCambiarEstadoColaborador } from './queries'

/** Confirmación de baja/alta lógica, nombrando al colaborador. */
export function ConfirmarEstadoColaborador({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const cambiar = useCambiarEstadoColaborador()
  const desactivando = colaborador.activo

  function confirmar() {
    cambiar.mutate(
      { id: colaborador.id, activo: !colaborador.activo },
      {
        onSuccess: () =>
          toast.success(desactivando ? 'Colaborador desactivado' : 'Colaborador reactivado'),
        onError: () => toast.error('No se pudo cambiar el estado. Intenta de nuevo.'),
      }
    )
    onClose()
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
          <AlertDialogTitle>
            {desactivando
              ? `¿Desactivar a ${colaborador.nombre}?`
              : `¿Reactivar a ${colaborador.nombre}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {desactivando
              ? 'Su QR dejará de funcionar y no podrá consumir.'
              : 'Su QR volverá a funcionar y podrá consumir de nuevo.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            className={
              desactivando
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {desactivando ? 'Desactivar' : 'Reactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
