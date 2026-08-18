import { useState } from 'react'
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

type Estado = 'listo' | 'invalido'

const MIN_LONGITUD = 8

/**
 * Página PÚBLICA (sin guard de sesión) para definir la contraseña desde el enlace del correo
 * de acceso del PORTAL.
 *
 * El token se canjea al ENVIAR el formulario, no al abrir la página. Es deliberado: el token es
 * de un solo uso, así que si se canjeara al montar, lo consumiría el primero que abra la URL —
 * y en dominios corporativos suele ser el escáner de seguridad del correo, que visita los
 * enlaces para analizarlos. La persona llegaba después y su enlace ya estaba quemado. Como
 * efecto secundario, recargar esta página ya no rompe nada.
 */
export function DefinirContrasenaPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const tokenHash = params.get('token_hash')
  // Sin token bien formado no hay nada que intentar; con token, mostramos el formulario
  // directamente (todavía no sabemos si sirve — eso se descubre al guardar).
  const [estado, setEstado] = useState<Estado>(
    tokenHash && params.get('type') === 'recovery' ? 'listo' : 'invalido'
  )
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

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
      // Aquí se consume el token de un solo uso y se abre la sesión.
      await verificarTokenAcceso(tokenHash as string)
    } catch {
      // Auth no distingue "venció" de "ya se usó" ni de "inválido": mismo error para los tres.
      setGuardando(false)
      setEstado('invalido')
      return
    }

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
