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
import { ETIQUETA_ROL, type CredencialesAlta, type RolBackoffice } from './api'
import { useCrearUsuario } from './queries'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
interface Errores {
  nombre?: string
  email?: string
  rol?: string
}

/** Alta de un usuario interno. Al crearlo muestra la contraseña temporal UNA sola vez. */
export function UsuarioFormDialog({ onClose }: { onClose: () => void }) {
  const crear = useCrearUsuario()
  const [credenciales, setCredenciales] = useState<CredencialesAlta | null>(null)
  const [errores, setErrores] = useState<Errores>({})

  const [, accion, pending] = useActionState(async (_prev: unknown, fd: FormData) => {
    const nombre = String(fd.get('nombre') ?? '').trim()
    const email = String(fd.get('email') ?? '')
      .trim()
      .toLowerCase()
    const rol = String(fd.get('rol') ?? '') as RolBackoffice
    const errs: Errores = {}
    if (!nombre) errs.nombre = 'El nombre es requerido'
    if (!email) errs.email = 'El correo es requerido'
    else if (!EMAIL_RE.test(email)) errs.email = 'Correo inválido'
    if (!rol) errs.rol = 'Selecciona un rol'
    setErrores(errs)
    if (Object.keys(errs).length > 0) return null
    try {
      setCredenciales(await crear.mutateAsync({ nombre, email, rol }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el usuario.')
    }
    return null
  }, null)

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
              <DialogTitle>Nuevo usuario del backoffice</DialogTitle>
              <DialogDescription>
                Crea su acceso interno. Recibirás una contraseña temporal para entregarle; deberá
                cambiarla al primer inicio de sesión.
              </DialogDescription>
            </DialogHeader>

            <form action={accion}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="rol">Rol</FieldLabel>
                  <Select name="rol">
                    <SelectTrigger id="rol" className="w-full" aria-invalid={Boolean(errores.rol)}>
                      <SelectValue placeholder="Selecciona un rol">
                        {(v) => (v ? ETIQUETA_ROL[v as RolBackoffice] : '')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">{ETIQUETA_ROL.super_admin}</SelectItem>
                      <SelectItem value="finanzas">{ETIQUETA_ROL.finanzas}</SelectItem>
                      <SelectItem value="mesero">{ETIQUETA_ROL.mesero}</SelectItem>
                      <SelectItem value="capitan_meseros">{ETIQUETA_ROL.capitan_meseros}</SelectItem>
                      <SelectItem value="consulta">{ETIQUETA_ROL.consulta}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errores.rol && <FieldError>{errores.rol}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                  <Input id="nombre" name="nombre" autoFocus aria-invalid={Boolean(errores.nombre)} />
                  {errores.nombre && <FieldError>{errores.nombre}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="persona@amena.com"
                    aria-invalid={Boolean(errores.email)}
                  />
                  {errores.email && <FieldError>{errores.email}</FieldError>}
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
