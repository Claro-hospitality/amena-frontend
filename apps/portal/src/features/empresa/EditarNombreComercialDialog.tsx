import { useActionState } from 'react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { nombreComercialSchema } from '@amena/utils'
import { toast } from 'sonner'
import { useActualizarNombreComercial } from './queries'

/** Diálogo mínimo para editar el nombre comercial de la empresa (RPC acotada a esa columna). */
export function EditarNombreComercialDialog({
  empresaId,
  nombreActual,
  open,
  onOpenChange,
}: {
  empresaId: number
  nombreActual: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const actualizar = useActualizarNombreComercial(empresaId)

  const [, accion, pending] = useActionState<null, FormData>(async (_prev, fd) => {
    const parsed = nombreComercialSchema.safeParse(Object.fromEntries(fd))
    if (!parsed.success) return null
    try {
      await actualizar.mutateAsync(parsed.data.nombre_comercial)
      toast.success('Nombre comercial actualizado')
      onOpenChange(false)
    } catch {
      toast.error('No se pudo actualizar el nombre comercial. Intenta de nuevo.')
    }
    return null
  }, null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar nombre comercial</DialogTitle>
          <DialogDescription>
            Es el nombre con el que opera tu empresa en el día a día (no afecta tu razón social
            fiscal).
          </DialogDescription>
        </DialogHeader>

        <form action={accion}>
          <Field>
            <FieldLabel htmlFor="nombre_comercial">Nombre comercial</FieldLabel>
            <Input
              id="nombre_comercial"
              name="nombre_comercial"
              defaultValue={nombreActual ?? ''}
              placeholder="Ej. Constructora Norte"
            />
          </Field>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
