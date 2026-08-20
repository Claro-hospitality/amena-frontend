import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { PantallaCargando } from '../components/PantallaCargando'
import { CambioPasswordObligatorio } from '../features/cuenta/CambioPasswordObligatorio'
import { BackofficeShell } from '../layout/BackofficeShell'
import { useAuth } from './useAuth'
import {
  validarAccesoPortal,
  type ContextoAcceso,
  type ResultadoAcceso,
} from './validarAccesoPortal'

type EstadoAcceso = 'validando' | ResultadoAcceso

/**
 * Guardia de las rutas privadas:
 *   - sin sesión → /login
 *   - con sesión → valida acceso (validarAccesoPortal)
 *       - denegado → /sin-acceso
 *       - debe cambiar contraseña → pantalla de cambio obligatorio (sin navegar)
 *       - concedido → monta el shell y pasa el rol a las rutas hijas vía <Outlet>
 *
 * `conShell={false}` aplica la misma validación pero sin el chrome del backoffice, para las
 * pantallas que necesitan el viewport completo (el escáner de boletos y su cámara).
 */
export function RutaProtegida({ conShell = true }: { conShell?: boolean } = {}) {
  const { session, cargando } = useAuth()
  // Guardamos el resultado junto al userId validado: si la sesión cambia (otro
  // usuario), el resultado deja de corresponder y volvemos a "validando".
  const [validado, setValidado] = useState<{ userId: string; acceso: ResultadoAcceso } | null>(
    null
  )
  // Se incrementa tras un cambio de contraseña obligatorio para re-validar (limpiar el flag).
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    if (!session) return
    const userId = session.user.id
    let vigente = true
    validarAccesoPortal().then((resultado) => {
      if (vigente) setValidado({ userId, acceso: resultado })
    })
    return () => {
      vigente = false
    }
  }, [session, recarga])

  if (cargando) return <PantallaCargando />
  if (!session) return <Navigate to="/login" replace />

  // Invitado que aún no define su contraseña: al flujo de acceso desde cualquier ruta.
  if (session.user.user_metadata?.debe_definir_password === true) {
    return <Navigate to="/definir-contrasena" replace />
  }

  const acceso: EstadoAcceso =
    validado && validado.userId === session.user.id ? validado.acceso : 'validando'

  if (acceso === 'validando') return <PantallaCargando />
  if (!acceso.concedido || !acceso.rol) return <Navigate to="/sin-acceso" replace />

  if (acceso.debeCambiarPassword) {
    return <CambioPasswordObligatorio onListo={() => setRecarga((n) => n + 1)} />
  }

  const contexto: ContextoAcceso = { rol: acceso.rol }
  if (!conShell) return <Outlet context={contexto} />
  return (
    <BackofficeShell rol={acceso.rol}>
      <Outlet context={contexto} />
    </BackofficeShell>
  )
}
