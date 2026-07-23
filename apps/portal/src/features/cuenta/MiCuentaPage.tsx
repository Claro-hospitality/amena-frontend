import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { cambiarMiPassword } from './api'

/** Pantalla "Mi cuenta" (ruta /mi-cuenta) del portal: cambiar mi propia contraseña. */
export function MiCuentaPage() {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    if (nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await cambiarMiPassword({ nueva, actual })
      toast.success('Contraseña actualizada')
      setActual('')
      setNueva('')
      setConfirmar('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Mi cuenta</h1>
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">Cambiar contraseña</h2>
            <p className="text-xs text-muted-foreground">
              Ingresa tu contraseña actual y define una nueva (mínimo 8 caracteres).
            </p>
          </div>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="actual">Contraseña actual</FieldLabel>
                <Input
                  id="actual"
                  type="password"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nueva">Nueva contraseña</FieldLabel>
                <Input
                  id="nueva"
                  type="password"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="confirmar">Confirmar contraseña</FieldLabel>
                <Input
                  id="confirmar"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  autoComplete="new-password"
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Guardando…' : 'Actualizar contraseña'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
