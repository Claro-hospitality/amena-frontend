import { useActionState, useState } from 'react'
import { Copy } from 'lucide-react'
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
import type { CredencialesAlta } from './api'
import { colaboradorSchema } from './colaboradorSchema'
import { useAltaUsuario } from './queries'

type Errores = Partial<Record<keyof typeof colaboradorSchema.shape, string[]>>

const etiquetaEmpresa = (e: Empresa) => e.nombre_comercial ?? e.razon_social ?? 'Empresa sin nombre'
const etiquetaRol = (v: string) => (v === 'admin' ? 'Administrador de empresa' : 'Colaborador')

/**
 * Alta de un usuario del portal (admin o colaborador). Al crearlo se generan sus
 * credenciales (contraseña temporal), que se muestran UNA sola vez. El padre lo
 * monta por apertura (con `key`).
 */
export function ColaboradorFormDialog({
  empresas,
  onClose,
}: {
  empresas: Empresa[]
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
          <Credenciales credenciales={credenciales} onClose={onClose} />
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
                <Button type="submit" disabled={pending}>
                  {pending ? 'Creando…' : 'Crear y generar acceso'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function Credenciales({
  credenciales,
  onClose,
}: {
  credenciales: CredencialesAlta
  onClose: () => void
}) {
  const copiar = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success(`${etiqueta} copiado`)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  // La persona ya tenía cuenta: solo se enlazó el rol, sin credenciales nuevas.
  if (credenciales.yaTeniaCuenta) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Rol asignado</DialogTitle>
          <DialogDescription>
            Ya existía una cuenta con ese correo. Se le asignó el nuevo rol y{' '}
            <strong>usa su contraseña actual</strong> — no se generan credenciales nuevas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <CampoCredencial etiqueta="Correo" valor={credenciales.email} onCopiar={copiar} />
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Acceso creado</DialogTitle>
        <DialogDescription>
          Entrega estas credenciales al usuario. La contraseña temporal{' '}
          <strong>no se vuelve a mostrar</strong>; al primer inicio de sesión deberá cambiarla.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <CampoCredencial etiqueta="Correo" valor={credenciales.email} onCopiar={copiar} />
        {credenciales.tempPassword && (
          <CampoCredencial
            etiqueta="Contraseña temporal"
            valor={credenciales.tempPassword}
            onCopiar={copiar}
          />
        )}
      </div>

      <DialogFooter className="mt-6">
        <Button onClick={onClose}>Listo</Button>
      </DialogFooter>
    </>
  )
}

function CampoCredencial({
  etiqueta,
  valor,
  onCopiar,
}: {
  etiqueta: string
  valor: string
  onCopiar: (texto: string, etiqueta: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{etiqueta}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-mono text-sm">{valor}</code>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Copiar ${etiqueta.toLowerCase()}`}
          onClick={() => onCopiar(valor, etiqueta)}
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  )
}
