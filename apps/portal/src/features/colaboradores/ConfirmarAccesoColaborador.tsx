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
import { useEliminarColaborador, useEstablecerEstadoAcceso } from './queries'

/**
 * Confirmación para activar/desactivar el ACCESO (login) del colaborador. Distinto del
 * toggle de comida: aquí se habilita o bloquea el ingreso al portal (reversible).
 */
export function ConfirmarAccesoColaborador({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const cambiar = useEstablecerEstadoAcceso()
  const desactivando = colaborador.accesoActivo

  function confirmar() {
    cambiar.mutate(
      { usuarioId: colaborador.usuario_id, activo: !colaborador.accesoActivo },
      {
        onSuccess: () =>
          toast.success(desactivando ? 'Acceso desactivado' : 'Acceso reactivado'),
        onError: () => toast.error('No se pudo cambiar el acceso. Intenta de nuevo.'),
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
              ? `¿Desactivar el acceso de ${colaborador.nombre}?`
              : `¿Reactivar el acceso de ${colaborador.nombre}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {desactivando
              ? 'No podrá iniciar sesión ni consumir: se apagan también sus comidas y su QR. Podrás reactivarlo o eliminarlo después.'
              : 'Volverá a poder iniciar sesión y a consumir (se reactivan sus comidas y su QR).'}
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
            {desactivando ? 'Desactivar acceso' : 'Reactivar acceso'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Confirmación de borrado lógico del colaborador. Solo debe abrirse cuando el acceso ya
 * está desactivado (lo exige también el backend). Lo oculta de la lista; el historial se
 * conserva en la base de datos.
 */
export function ConfirmarEliminarColaborador({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const eliminar = useEliminarColaborador()

  function confirmar() {
    eliminar.mutate(colaborador.usuario_id, {
      onSuccess: () => toast.success('Colaborador eliminado'),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'No se pudo eliminar. Intenta de nuevo.'),
    })
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
          <AlertDialogTitle>¿Eliminar a {colaborador.nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se ocultará de la lista y se apagará su comida, QR y roles. El historial de
            consumos se conserva. Esta acción no se puede deshacer desde el portal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
