import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { CredencialesAcceso } from '@amena/ui/components/ui/credenciales-acceso'
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
import type { CredencialesAlta } from './api'
import { colaboradorSchema } from './colaboradorSchema'
import { useAltaUsuario } from './queries'

// El panel de credenciales es compartido con el portal (packages/ui). Se re-exporta con el
// nombre local `Credenciales` para no romper importadores/tests existentes.
export { CredencialesAcceso as Credenciales } from '@amena/ui/components/ui/credenciales-acceso'

type Errores = Partial<Record<keyof typeof colaboradorSchema.shape, string[]>>

const etiquetaEmpresa = (e: Empresa) => e.nombre_comercial ?? 'Empresa sin nombre'
const etiquetaRol = (v: string) => (v === 'admin' ? 'Administrador de empresa' : 'Colaborador')

/**
 * Alta de un usuario del portal (admin o colaborador). Al crearlo se generan sus
 * credenciales (contraseña temporal), que se muestran UNA sola vez. El padre lo
 * monta por apertura (con `key`).
 */
export function ColaboradorFormDialog({
  empresas = [],
  empresaFija,
  onClose,
}: {
  /** Catálogo para elegir empresa. Ignorado si se pasa `empresaFija`. */
  empresas?: Empresa[]
  /** Si viene, la empresa queda fija (no elegible): alta desde el detalle de esa empresa. */
  empresaFija?: Empresa
  onClose: () => void
}) {
  const alta = useAltaUsuario()
  const [credenciales, setCredenciales] = useState<CredencialesAlta | null>(null)

  const [estado, accion, pending] = useActionState<{ errors: Errores }, FormData>(
    async (_prev, fd) => {
      const parsed = colaboradorSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors }
      }
      try {
        const creds = await alta.mutateAsync(parsed.data)
        setCredenciales(creds)
        return { errors: {} }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'No se pudo dar de alta al usuario.')
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
        {credenciales ? (
          <CredencialesAcceso credenciales={credenciales} onClose={onClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nuevo usuario del portal</DialogTitle>
              <DialogDescription>
                Crea su acceso al portal. Recibirás una contraseña temporal para entregarle; al
                primer inicio de sesión se le pedirá cambiarla.
              </DialogDescription>
            </DialogHeader>

            <form action={accion}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="rol">Rol</FieldLabel>
                  <Select name="rol">
                    <SelectTrigger id="rol" className="w-full" aria-invalid={Boolean(estado.errors.rol)}>
                      <SelectValue placeholder="Selecciona un rol">
                        {(v) => (v ? etiquetaRol(v as string) : '')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="admin">Administrador de empresa</SelectItem>
                    </SelectContent>
                  </Select>
                  {estado.errors.rol && <FieldError>{estado.errors.rol[0]}</FieldError>}
                </Field>

                {empresaFija ? (
                  <Field>
                    <FieldLabel htmlFor="empresa_fija">Empresa</FieldLabel>
                    <Input id="empresa_fija" value={etiquetaEmpresa(empresaFija)} disabled readOnly />
                    <input type="hidden" name="empresa_id" value={String(empresaFija.id)} />
                  </Field>
                ) : (
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
                            const e = empresas.find((x) => String(x.id) === id)
                            return e ? etiquetaEmpresa(e) : ''
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {etiquetaEmpresa(e)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {estado.errors.empresa_id && (
                      <FieldError>{estado.errors.empresa_id[0]}</FieldError>
                    )}
                  </Field>
                )}

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
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="persona@empresa.com"
                    aria-invalid={Boolean(estado.errors.email)}
                  />
                  {estado.errors.email && <FieldError>{estado.errors.email[0]}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="telefono">Teléfono (opcional)</FieldLabel>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="off"
                    placeholder="55 1234 5678"
                    aria-invalid={Boolean(estado.errors.telefono)}
                  />
                  {estado.errors.telefono && <FieldError>{estado.errors.telefono[0]}</FieldError>}
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" loading={pending}>
                  Crear y generar acceso
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
