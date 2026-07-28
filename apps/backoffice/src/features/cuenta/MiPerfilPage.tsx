import { useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@amena/ui/components/ui/avatar'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { useAuth } from '../../auth/useAuth'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { CambiarPasswordForm } from './CambiarPasswordForm'
import { useActualizarMiNombre, useMiPerfil } from './queries'

const ETIQUETA_ROL: Record<RolBackoffice, string> = {
  super_admin: 'Super administrador',
  finanzas: 'Finanzas',
  mesero: 'Mesero',
  capitan_meseros: 'Capitán de meseros',
  consulta: 'Consulta',
}

function iniciales(texto: string): string {
  const limpio = texto.trim()
  if (!limpio) return '?'
  const palabras = limpio.split(/\s+/)
  return (palabras.length > 1 ? palabras[0][0] + palabras[1][0] : limpio.slice(0, 2)).toUpperCase()
}

/** Pantalla "Mi perfil" (ruta /mi-perfil): datos del usuario + restablecer contraseña. */
export function MiPerfilPage() {
  const { session } = useAuth()
  const { data: perfil, isLoading } = useMiPerfil()
  const email = session?.user.email ?? ''
  const [editando, setEditando] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {/* Información del usuario */}
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{iniciales(perfil?.nombre || email)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <span className="truncate font-medium">{perfil?.nombre || '—'}</span>
                )}
                {perfil && <Badge variant="secondary">{ETIQUETA_ROL[perfil.rol]}</Badge>}
              </div>
            </div>
            {perfil && !editando && (
              <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            )}
          </div>

          {editando && perfil ? (
            <EditarNombreForm nombreActual={perfil.nombre} onListo={() => setEditando(false)} />
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="min-w-0 truncate">{perfil?.nombre || '—'}</dd>
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="min-w-0 truncate">{email || '—'}</dd>
              <dt className="text-muted-foreground">Rol</dt>
              <dd>{perfil ? ETIQUETA_ROL[perfil.rol] : '—'}</dd>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Restablecer contraseña */}
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">Restablecer contraseña</h2>
            <p className="text-xs text-muted-foreground">
              Ingresa tu contraseña actual y define una nueva (mínimo 8 caracteres).
            </p>
          </div>
          <CambiarPasswordForm requiereActual textoBoton="Actualizar contraseña" />
        </CardContent>
      </Card>
    </div>
  )
}

/** Formulario para editar mi propio nombre (dentro de la tarjeta de información). */
function EditarNombreForm({ nombreActual, onListo }: { nombreActual: string; onListo: () => void }) {
  const actualizar = useActualizarMiNombre()
  const [nombre, setNombre] = useState(nombreActual)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setError(null)
    try {
      await actualizar.mutateAsync(nombre.trim())
      toast.success('Nombre actualizado')
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            autoFocus
            aria-invalid={Boolean(error)}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onListo} disabled={actualizar.isPending}>
            Cancelar
          </Button>
          <Button type="submit" loading={actualizar.isPending} disabled={nombre.trim() === nombreActual}>
            Guardar
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
