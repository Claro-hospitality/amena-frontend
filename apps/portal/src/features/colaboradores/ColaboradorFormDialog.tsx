import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { CredencialesAcceso } from '@amena/ui/components/ui/credenciales-acceso'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@amena/ui/components/ui/sheet'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import type { Colaborador, CredencialesAlta } from './api'
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
  // Tras crear, se muestran las credenciales de acceso (una sola vez) en vez de cerrar.
  const [credenciales, setCredenciales] = useState<CredencialesAlta | null>(null)

  const [estado, accion, pending] = useActionState<EstadoForm, FormData>(
    async (_prev, fd) => {
      const parsed = colaboradorSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }
      try {
        // El rol solo aplica al crear; en edición no se toca (y no es columna editable).
        const { rol, ...datos } = parsed.data
        if (colaborador) {
          await actualizar.mutateAsync({ usuarioId: colaborador.usuario_id, datos })
          toast.success('Colaborador actualizado')
          onClose()
        } else {
          if (!empresaId) {
            toast.error('No se pudo determinar tu empresa. Recarga e intenta de nuevo.')
            return { errors: {} }
          }
          const creds = await crear.mutateAsync({ ...datos, rol, empresa_id: empresaId })
          toast.success(rol === 'admin' ? 'Administrador creado' : 'Colaborador creado')
          setCredenciales(creds) // mantiene el dialog abierto para entregar el acceso
        }
        return { errors: {} }
      } catch (e) {
        // El backend puede rechazar (p. ej. 403 fuera de tu empresa): se muestra su mensaje.
        toast.error(e instanceof Error ? e.message : 'No se pudo guardar el colaborador.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <Sheet
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <SheetContent side="right">
        {credenciales ? (
          <div className="overflow-y-auto p-6">
            <CredencialesAcceso credenciales={credenciales} onClose={onClose} />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{esEdicion ? 'Editar colaborador' : 'Nueva persona del portal'}</SheetTitle>
              <SheetDescription>
                {esEdicion
                  ? 'Actualiza los datos del colaborador.'
                  : 'Se crea su acceso al portal con una contraseña temporal. Los colaboradores además reciben su credencial QR.'}
              </SheetDescription>
            </SheetHeader>

            <form action={accion} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6">
                <FieldGroup>
                {!esEdicion && (
                  <Field>
                    <FieldLabel htmlFor="rol">Rol</FieldLabel>
                    <Select name="rol" defaultValue="colaborador">
                      <SelectTrigger id="rol" className="w-full">
                        <SelectValue placeholder="Selecciona un rol">
                          {(v) => (v === 'admin' ? 'Administrador de empresa' : 'Colaborador')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="admin">Administrador de empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

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
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
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
              </div>

              <SheetFooter className="flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Guardando…' : 'Guardar'}
                </Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
