import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { DatosFiscalesForm } from './DatosFiscalesForm'

/**
 * Diálogo para editar los datos de facturación (fiscales) de una empresa desde el
 * detalle. Reutiliza `DatosFiscalesForm` (upsert + validación) y se cierra al guardar.
 * Visible para super_admin y finanzas (Amena gestiona lo fiscal; RLS lo respalda).
 */
export function DatosFiscalesDialog({
  empresaId,
  onClose,
}: {
  empresaId: number
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar datos de facturación</DialogTitle>
          <DialogDescription>
            Actualiza los datos fiscales para facturar a esta empresa.
          </DialogDescription>
        </DialogHeader>
        <DatosFiscalesForm empresaId={empresaId} onGuardado={onClose} />
      </DialogContent>
    </Dialog>
  )
}
