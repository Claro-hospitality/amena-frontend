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

export function ResumenReservaDialog({
  comidas,
  colaboradores,
  enviando,
  onConfirmar,
  onClose,
}: {
  comidas: number
  colaboradores: number
  enviando: boolean
  onConfirmar: () => void
  onClose: () => void
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar reserva</AlertDialogTitle>
          <AlertDialogDescription>
            Reservarás <strong>{comidas}</strong> {comidas === 1 ? 'comida' : 'comidas'} para{' '}
            <strong>{colaboradores}</strong>{' '}
            {colaboradores === 1 ? 'colaborador' : 'colaboradores'}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmar} loading={enviando}>
            Reservar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
