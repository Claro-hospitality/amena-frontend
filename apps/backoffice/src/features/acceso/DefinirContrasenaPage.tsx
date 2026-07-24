import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { definirPasswordAcceso, verificarTokenAcceso } from '@amena/supabase/auth'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Button } from '@amena/ui/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'

type Estado = 'verificando' | 'listo' | 'invalido'

const MIN_LONGITUD = 8

/**
 * Página PÚBLICA (sin guard de sesión) para definir la contraseña desde el enlace del correo
 * de acceso. Verifica el token (recovery), limpia el query string del historial, y con la
 * sesión activa deja definir la contraseña.
 */
export function DefinirContrasenaPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  // Estado inicial derivado del query (sin setState síncrono en el efecto).
  const [estado, setEstado] = useState<Estado>(() => {
    const t = params.get('token_hash')
    return t && params.get('type') === 'recovery' ? 'verificando' : 'invalido'
  })
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const yaVerifico = useRef(false)

  useEffect(() => {
    // Solo verificamos si el token venía bien formado; el token es de un solo uso
    // (yaVerifico evita el doble montaje de StrictMode).
    if (estado !== 'verificando' || yaVerifico.current) return
    yaVerifico.current = true

    verificarTokenAcceso(params.get('token_hash') as string)
      .then(() => {
        // El token no debe quedar en el historial del navegador.
        window.history.replaceState(null, '', '/definir-contrasena')
        setEstado('listo')
      })
      .catch(() => setEstado('invalido'))
  }, [estado, params])

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pass = String(fd.get('password') ?? '')
    const confirmar = String(fd.get('confirmar') ?? '')

    if (pass.length < MIN_LONGITUD) {
      setError(`La contraseña debe tener al menos ${MIN_LONGITUD} caracteres.`)
      return
    }
    if (pass !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      await definirPasswordAcceso(pass)
      toast.success('Contraseña definida. ¡Bienvenido!')
      navigate('/', { replace: true })
    } catch {
      setError('No se pudo guardar la contraseña. Intenta de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex justify-center">
          <LogotipoAmena className="h-8" />
        </div>

        {estado === 'verificando' && (
          <p className="text-center text-sm text-muted-foreground">Verificando el enlace…</p>
        )}

        {estado === 'invalido' && (
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-lg font-semibold">Enlace no válido</h1>
            <p className="text-sm text-muted-foreground">
              Este enlace venció o ya se usó. Pídele a tu administrador que te envíe uno nuevo.
            </p>
          </div>
        )}

        {estado === 'listo' && (
          <form onSubmit={enviar}>
            <div className="mb-4 flex flex-col gap-1 text-center">
              <h1 className="text-lg font-semibold">Define tu contraseña</h1>
              <p className="text-sm text-muted-foreground">
                Elige una contraseña para entrar a tu cuenta.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={Boolean(error)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmar">Confirmar contraseña</FieldLabel>
                <Input
                  id="confirmar"
                  name="confirmar"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(error)}
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
            </FieldGroup>
            <Button type="submit" className="mt-6 w-full" loading={guardando}>
              Guardar y entrar
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
