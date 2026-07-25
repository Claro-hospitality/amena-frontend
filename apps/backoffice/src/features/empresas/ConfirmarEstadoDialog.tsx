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
import type { Empresa } from './api'
import { useCambiarEstadoEmpresa } from './queries'

/** Confirmación de baja/alta lógica, nombrando la empresa afectada. */
export function ConfirmarEstadoDialog({
  empresa,
  onClose,
}: {
  empresa: Empresa
  onClose: () => void
}) {
  const cambiar = useCambiarEstadoEmpresa()
  const desactivando = empresa.activo

  function confirmar() {
    cambiar.mutate(
      { id: empresa.id, activo: !empresa.activo },
      {
        onSuccess: () => {
          toast.success(desactivando ? 'Empresa desactivada' : 'Empresa reactivada')
          onClose()
        },
        onError: () => toast.error('No se pudo cambiar el estado. Intenta de nuevo.'),
      }
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
          <AlertDialogTitle>
            {desactivando
              ? `¿Desactivar ${empresa.nombre_comercial ?? empresa.razon_social}?`
              : `¿Reactivar ${empresa.nombre_comercial ?? empresa.razon_social}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {desactivando
              ? 'Sus colaboradores no podrán consumir mientras esté desactivada.'
              : 'Volverá a estar disponible y sus colaboradores podrán consumir de nuevo.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            loading={cambiar.isPending}
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
