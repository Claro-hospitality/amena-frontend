import { useState, type FormEvent } from 'react'
import { UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import type { MiPerfil } from './api'
import { useActualizarMiPerfil, useMiPerfil } from './queries'

/** "Mi cuenta" (/mi-cuenta) del portal: ver y editar mis datos (nombre, teléfono). */
export function MiCuentaPage() {
  const { data, isLoading, isError, refetch } = useMiPerfil()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Mi cuenta</h1>
      {isLoading ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-4 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRound className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar tu perfil</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar tus datos.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <FormPerfil perfil={data} />
      )}
    </div>
  )
}

function FormPerfil({ perfil }: { perfil: MiPerfil }) {
  const actualizar = useActualizarMiPerfil()
  const [nombre, setNombre] = useState(perfil.nombre)
  const [telefono, setTelefono] = useState(perfil.telefono ?? '')
  const [error, setError] = useState<string | null>(null)

  const sinCambios =
    nombre.trim() === perfil.nombre && (telefono.trim() || null) === (perfil.telefono ?? null)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setError(null)
    try {
      await actualizar.mutateAsync({ nombre: nombre.trim(), telefono: telefono.trim() || null })
      toast.success('Datos actualizados')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.')
    }
  }

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold">Información de tu cuenta</h2>
          <p className="text-xs text-muted-foreground">
            Actualiza tu nombre y teléfono. El correo no se puede cambiar desde aquí.
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(error)}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
              <Input
                id="telefono"
                type="tel"
                inputMode="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel"
                placeholder="Opcional"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Correo</FieldLabel>
              <Input id="email" type="email" value={perfil.email} disabled readOnly />
              <FieldDescription>Para cambiar tu correo, contacta a tu administrador.</FieldDescription>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={actualizar.isPending} disabled={sinCambios}>
                Guardar cambios
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
