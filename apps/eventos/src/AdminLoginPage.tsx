import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import { getAdminSession, loginAdmin } from './lib/admin-auth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [yaAutenticado, setYaAutenticado] = useState(false)

  useEffect(() => {
    getAdminSession().then((session) => setYaAutenticado(Boolean(session)))
  }, [])

  if (yaAutenticado) {
    return <Navigate to="/admin" replace />
  }

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const { error } = await loginAdmin(email, password)
    setEnviando(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-8 bg-tinta-900 p-8 text-crema-50 lg:justify-between lg:p-12">
        <p className="text-2xl font-bold text-primary">amena</p>
        <div>
          <h1 className="text-xl font-bold lg:text-2xl">Portal administrativo</h1>
          <p className="mt-2 max-w-sm text-sm text-crema-100/80 lg:hidden">
            Gestiona eventos, reservaciones y valida boletos en la entrada.
          </p>
          <p className="mt-2 hidden max-w-sm text-sm text-crema-100/80 lg:block">
            Gestiona los eventos del restaurante, revisa reservaciones y valida los boletos en la
            entrada.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={entrar} className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold">Inicia sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">Acceso restringido al equipo de Amena.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-naranja-200 bg-naranja-50 p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-naranja-700" />
              <p className="text-sm text-naranja-700">{error}</p>
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Correo</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-border bg-card px-3.5 text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Contraseña</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border border-border bg-card px-3.5 text-sm outline-none"
            />
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="size-4 accent-primary" />
              Mantener sesión
            </label>
            <span className="text-muted-foreground">¿Olvidaste tu contraseña?</span>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-naranja-600 disabled:opacity-60"
          >
            {enviando ? 'Entrando…' : 'Entrar al portal'}
            <ArrowRight className="size-4" />
          </button>

          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-salvia-600" />
            <p>
              Autenticación con Supabase Auth · rol admin. Las sesiones caducan a las 12 horas.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
