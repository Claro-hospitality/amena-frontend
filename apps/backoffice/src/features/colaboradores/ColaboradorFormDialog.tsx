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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import type { Empresa } from '../empresas/api'
import { colaboradorSchema } from './colaboradorSchema'
import { useCrearColaborador } from './queries'

type Errores = Partial<Record<keyof typeof colaboradorSchema.shape, string[]>>

const etiquetaEmpresa = (e: Empresa) => e.nombre_comercial ?? e.razon_social ?? 'Empresa sin nombre'

/**
 * Alta de un colaborador desde el backoffice: se elige la empresa (cualquiera),
 * nombre y correo (opcional). El padre lo monta por apertura (con `key`).
 */
export function ColaboradorFormDialog({
  empresas,
  onClose,
}: {
  empresas: Empresa[]
  onClose: () => void
}) {
  const crear = useCrearColaborador()

  const [estado, accion, pending] = useActionState<{ errors: Errores }, FormData>(
    async (_prev, fd) => {
      const parsed = colaboradorSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors }
      }
      try {
        await crear.mutateAsync(parsed.data)
        toast.success('Colaborador creado')
        onClose()
        return { errors: {} }
      } catch {
        toast.error('No se pudo crear el colaborador. Intenta de nuevo.')
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
          <DialogTitle>Nuevo colaborador</DialogTitle>
          <DialogDescription>Registra un colaborador y asígnalo a una empresa.</DialogDescription>
        </DialogHeader>

        <form action={accion}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="empresa_id">Empresa</FieldLabel>
              <Select name="empresa_id">
                <SelectTrigger
                  id="empresa_id"
                  className="w-full"
                  aria-invalid={Boolean(estado.errors.empresa_id)}
                >
                  <SelectValue placeholder="Selecciona una empresa">
                    {(id) => {
                      const e = empresas.find((x) => x.id === id)
                      return e ? etiquetaEmpresa(e) : ''
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {etiquetaEmpresa(e)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {estado.errors.empresa_id && <FieldError>{estado.errors.empresa_id[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                name="nombre"
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
                autoComplete="email"
                placeholder="colaborador@empresa.com"
                aria-invalid={Boolean(estado.errors.email)}
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
