import { useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import type { Colaborador } from './api'
import { colaboradorSchema } from './colaboradorSchema'
import { useActualizarColaborador, useCrearColaborador, useMiEmpresaId } from './queries'

type Errores = Partial<Record<keyof typeof colaboradorSchema.shape, string[]>>
interface EstadoForm {
  errors: Errores
}

/** Dialog de crear/editar colaborador. El padre lo monta con `key` por apertura. */
export function ColaboradorFormDialog({
  colaborador,
  onClose,
}: {
  colaborador?: Colaborador | null
  onClose: () => void
}) {
  const crear = useCrearColaborador()
  const actualizar = useActualizarColaborador()
  const { data: empresaId } = useMiEmpresaId()
  const esEdicion = Boolean(colaborador)

  const [estado, accion, pending] = useActionState<EstadoForm, FormData>(
    async (_prev, fd) => {
      const parsed = colaboradorSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }
      try {
        if (colaborador) {
          await actualizar.mutateAsync({ usuarioId: colaborador.usuario_id, datos: parsed.data })
          toast.success('Colaborador actualizado')
        } else {
          if (!empresaId) {
            toast.error('No se pudo determinar tu empresa. Recarga e intenta de nuevo.')
            return { errors: {} }
          }
          await crear.mutateAsync({ ...parsed.data, empresa_id: empresaId })
          toast.success('Colaborador creado')
        }
        onClose()
        return { errors: {} }
      } catch {
        toast.error('No se pudo guardar el colaborador. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar colaborador' : 'Nuevo colaborador'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Actualiza los datos del colaborador.'
              : 'Al registrarlo se genera su acceso al portal y su credencial QR.'}
          </DialogDescription>
        </DialogHeader>

        <form action={accion}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={colaborador?.nombre}
                aria-invalid={Boolean(estado.errors.nombre)}
                autoFocus
              />
              {estado.errors.nombre && <FieldError>{estado.errors.nombre[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Correo (opcional)</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={colaborador?.email ?? ''}
                aria-invalid={Boolean(estado.errors.email)}
                placeholder="colaborador@empresa.com"
              />
              {estado.errors.email && <FieldError>{estado.errors.email[0]}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
