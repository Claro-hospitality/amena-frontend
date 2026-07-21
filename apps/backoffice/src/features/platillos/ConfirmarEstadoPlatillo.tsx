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
import type { Platillo } from './api'
import { useCambiarEstadoPlatillo } from './queries'

export function ConfirmarEstadoPlatillo({
  platillo,
  onClose,
}: {
  platillo: Platillo
  onClose: () => void
}) {
  const cambiar = useCambiarEstadoPlatillo()
  const desactivando = platillo.activo

  function confirmar() {
    cambiar.mutate(
      { id: platillo.id, activo: !platillo.activo },
      {
        onSuccess: () =>
          toast.success(desactivando ? 'Platillo desactivado' : 'Platillo reactivado'),
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
            {desactivando ? `¿Desactivar ${platillo.nombre}?` : `¿Reactivar ${platillo.nombre}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {desactivando
              ? 'No aparecerá al armar menús nuevos (los menús pasados no cambian).'
              : 'Volverá a estar disponible para armar menús.'}
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
