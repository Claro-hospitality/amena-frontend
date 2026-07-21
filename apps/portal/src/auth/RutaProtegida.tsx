import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { PantallaCargando } from '../components/PantallaCargando'
import { CambiarPasswordObligatorio } from '../features/auth/CambiarPasswordObligatorio'
import { PortalShell } from '../layout/PortalShell'
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
 *   - con sesión → valida acceso al portal (validarAccesoPortal)
 *       - denegado → /sin-acceso
 *       - concedido → monta el shell y pasa el tipo a las rutas hijas vía <Outlet>
 */
export function RutaProtegida() {
  const { session, cargando } = useAuth()
  const [validado, setValidado] = useState<{ userId: string; acceso: ResultadoAcceso } | null>(
    null
  )

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
  }, [session])

  if (cargando) return <PantallaCargando />
  if (!session) return <Navigate to="/login" replace />

  // Usuario dado de alta con contraseña temporal: debe cambiarla antes de entrar.
  if (session.user.user_metadata?.must_change_password) {
    return <CambiarPasswordObligatorio />
  }

  const acceso: EstadoAcceso =
    validado && validado.userId === session.user.id ? validado.acceso : 'validando'

  if (acceso === 'validando') return <PantallaCargando />
  if (!acceso.concedido || !acceso.tipo) return <Navigate to="/sin-acceso" replace />

  const contexto: ContextoAcceso = { tipo: acceso.tipo, esComensal: acceso.esComensal }
  return (
    <PortalShell tipo={acceso.tipo} esComensal={acceso.esComensal}>
      <Outlet context={contexto} />
    </PortalShell>
  )
}
