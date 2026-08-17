import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  definirPasswordAcceso,
  solicitarAcceso,
  verificarTokenAcceso,
} from '@amena/supabase/auth'
import { programarRecorrido } from '../recorrido/useRecorridoPortal'
import { Button } from '@amena/ui/components/ui/button'
import { FieldError, FieldGroup } from '@amena/ui/components/ui/field'
import {
  CampoPassword,
  EncabezadoAcceso,
  MarcoAcceso,
  SolicitarEnlaceAcceso,
} from '@amena/ui/components/marco-acceso'

type Estado = 'verificando' | 'listo' | 'invalido'

const MIN_LONGITUD = 8

/**
 * Página PÚBLICA (sin guard de sesión) para definir la contraseña desde el enlace del correo
 * de acceso del PORTAL. Verifica el token (recovery), limpia el query string del historial, y con
 * la sesión activa deja definir la contraseña. Mismo marco de diseño que el login.
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
      // Programa el recorrido guiado para el primer acceso al portal.
      programarRecorrido()
      toast.success('Contraseña definida. ¡Bienvenido!')
      navigate('/', { replace: true })
    } catch {
      setError('No se pudo guardar la contraseña. Intenta de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <MarcoAcceso>
      {estado === 'verificando' && (
        <EncabezadoAcceso titulo="Un momento…" subtitulo="Verificando tu enlace de acceso." />
      )}

      {estado === 'invalido' && (
        <>
          <EncabezadoAcceso
            titulo="Enlace no válido"
            subtitulo="Este enlace venció o ya se usó. Escribe tu correo y te enviamos uno nuevo."
          />
          <SolicitarEnlaceAcceso onEnviar={(email) => solicitarAcceso(email, 'portal')} />
        </>
      )}

      {estado === 'listo' && (
        <form onSubmit={enviar}>
          <EncabezadoAcceso
            titulo="Define tu contraseña"
            subtitulo="Elige una contraseña para entrar a tu cuenta."
          />
          <FieldGroup>
            <CampoPassword
              id="password"
              name="password"
              label="Contraseña"
              autoComplete="new-password"
              autoFocus
              aria-invalid={Boolean(error)}
            />
            <CampoPassword
              id="confirmar"
              name="confirmar"
              label="Confirmar contraseña"
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
            />

            {error && (
              <FieldError role="alert" className="rounded-lg bg-destructive/10 px-3 py-2">
                {error}
              </FieldError>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" loading={guardando}>
              Guardar y entrar
            </Button>
          </FieldGroup>
        </form>
      )}
    </MarcoAcceso>
  )
}
