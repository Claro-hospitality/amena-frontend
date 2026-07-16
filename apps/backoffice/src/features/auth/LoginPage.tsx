import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@amena/ui/components/ui/card'
import { Input } from '@amena/ui/components/ui/input'
import { useAuth } from '../../auth/useAuth'

export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email, password)
      navigate('/inicio', { replace: true })
    } catch {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-primary">Amena</p>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Backoffice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Correo
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@amena.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
