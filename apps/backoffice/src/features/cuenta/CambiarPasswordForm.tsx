import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { cambiarMiPassword } from './api'

/**
 * Formulario de cambio de contraseña. Reutilizado por "Mi cuenta" (`requiereActual`)
 * y por el cambio obligatorio del primer login (sin contraseña actual).
 */
export function CambiarPasswordForm({
  requiereActual = false,
  onListo,
  textoBoton = 'Guardar',
}: {
  requiereActual?: boolean
  onListo?: () => void
  textoBoton?: string
}) {
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
      await cambiarMiPassword({ nueva, actual: requiereActual ? actual : undefined })
      toast.success('Contraseña actualizada')
      onListo?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        {requiereActual && (
          <Field>
            <FieldLabel htmlFor="password-actual">Contraseña actual</FieldLabel>
            <Input
              id="password-actual"
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="password-nueva">Nueva contraseña</FieldLabel>
          <Input
            id="password-nueva"
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="password-confirmar">Confirmar contraseña</FieldLabel>
          <Input
            id="password-confirmar"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            autoComplete="new-password"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <Button type="submit" loading={enviando}>
          {textoBoton}
        </Button>
      </FieldGroup>
    </form>
  )
}
