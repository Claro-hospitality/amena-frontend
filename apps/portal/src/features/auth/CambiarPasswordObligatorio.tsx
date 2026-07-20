import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { cambiarPassword } from '@amena/supabase/auth'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@amena/ui/components/ui/card'
import { Input } from '@amena/ui/components/ui/input'

/**
 * Pantalla de cambio de contraseña OBLIGATORIO. Se muestra cuando la sesión trae
 * `must_change_password` (usuario dado de alta con contraseña temporal). Al
 * guardar, el listener de sesión limpia el flag y RutaProtegida deja pasar.
 */
export function CambiarPasswordObligatorio() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await cambiarPassword(password)
      toast.success('Contraseña actualizada')
      // No se navega: el cambio de sesión (USER_UPDATED) limpia must_change_password
      // y RutaProtegida vuelve a renderizar el portal.
    } catch {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <LogotipoAmena className="mx-auto h-7 w-auto text-primary" />
          <CardTitle className="text-base font-medium text-muted-foreground">
            Cambia tu contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Por seguridad, define una contraseña nueva antes de continuar.
          </p>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Nueva contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmar" className="text-sm font-medium">
                Confirmar contraseña
              </label>
              <Input
                id="confirmar"
                type="password"
                autoComplete="new-password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
