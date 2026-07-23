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
import { Textarea } from '@amena/ui/components/ui/textarea'
import { subirFotoPlatillo, type Platillo } from './api'
import { FotoUploader } from './FotoUploader'
import { validarImagen } from './foto'
import { platilloSchema } from './platilloSchema'
import { useActualizarPlatillo, useCrearPlatillo } from './queries'

type Errores = Partial<Record<keyof typeof platilloSchema.shape, string[]>>
interface EstadoForm {
  errors: Errores
}

export function PlatilloFormDialog({
  platillo,
  onClose,
}: {
  platillo?: Platillo | null
  onClose: () => void
}) {
  const crear = useCrearPlatillo()
  const actualizar = useActualizarPlatillo()
  const esEdicion = Boolean(platillo)

  const [estado, accion, pending] = useActionState<EstadoForm, FormData>(
    async (_prev, fd) => {
      const parsed = platilloSchema.safeParse({
        nombre: fd.get('nombre'),
        descripcion: fd.get('descripcion'),
      })
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

      try {
        const quitar = fd.get('quitar_foto') === '1'
        const foto = fd.get('foto') as File | null
        let foto_url: string | null
        if (quitar) {
          foto_url = null
        } else if (foto && foto.size > 0) {
          const err = validarImagen(foto)
          if (err) {
            toast.error(err)
            return { errors: {} }
          }
          foto_url = await subirFotoPlatillo(foto)
        } else {
          foto_url = platillo?.foto_url ?? null
        }

        const datos = { ...parsed.data, foto_url }
        if (platillo) {
          await actualizar.mutateAsync({ id: platillo.id, datos })
          toast.success('Platillo actualizado')
        } else {
          await crear.mutateAsync(datos)
          toast.success('Platillo creado')
        }
        onClose()
        return { errors: {} }
      } catch {
        toast.error('No se pudo guardar el platillo. Intenta de nuevo.')
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
          <DialogTitle>{esEdicion ? 'Editar platillo' : 'Nuevo platillo'}</DialogTitle>
          <DialogDescription>
            {esEdicion ? 'Actualiza los datos del platillo.' : 'Agrega un platillo al catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <form action={accion}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={platillo?.nombre}
                aria-invalid={Boolean(estado.errors.nombre)}
                autoFocus
              />
              {estado.errors.nombre && <FieldError>{estado.errors.nombre[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="descripcion">Descripción (opcional)</FieldLabel>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={platillo?.descripcion ?? ''}
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel>Foto (opcional)</FieldLabel>
              <FotoUploader fotoActual={platillo?.foto_url ?? null} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
