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
import { useCopiarSemana } from './queries'

export function CopiarSemanaDialog({
  lunesISO,
  onClose,
}: {
  lunesISO: string
  onClose: () => void
}) {
  const copiar = useCopiarSemana(lunesISO)

  function confirmar() {
    copiar.mutate(undefined, {
      onSuccess: (cuantos) => {
        toast.success(
          cuantos > 0
            ? `Se copiaron ${cuantos} platillos de la semana anterior.`
            : 'La semana anterior no tenía platillos.'
        )
        onClose()
      },
      onError: () => toast.error('No se pudo copiar la semana. Intenta de nuevo.'),
    })
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
          <AlertDialogTitle>¿Copiar la semana anterior?</AlertDialogTitle>
          <AlertDialogDescription>
            Se agregarán a esta semana los mismos platillos que tuvo la semana pasada, día por día.
            Podrás ajustarlos después.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} loading={copiar.isPending}>
            Copiar semana
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
