import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { PantallaCargando } from '../components/PantallaCargando'
import { PortalShell } from '../layout/PortalShell'
import { useAuth } from './useAuth'
import { validarAccesoPortal, type ResultadoAcceso } from './validarAccesoPortal'

type EstadoAcceso = 'validando' | ResultadoAcceso

/**
 * Guardia de las rutas privadas:
 *   - sin sesión → /login
 *   - con sesión → valida acceso al portal (validarAccesoPortal)
 *       - denegado → /sin-acceso
 *       - concedido → monta el shell y renderiza la ruta hija
 */
export function RutaProtegida() {
  const { session, cargando } = useAuth()
  // Guardamos el resultado junto al userId validado: si la sesión cambia (otro
  // usuario), el resultado deja de corresponder y volvemos a "validando".
  const [validado, setValidado] = useState<{ userId: string; acceso: ResultadoAcceso } | null>(
    null
  )

  useEffect(() => {
    if (!session) return
    const userId = session.user.id
    let vigente = true
    validarAccesoPortal(session).then((resultado) => {
      if (vigente) setValidado({ userId, acceso: resultado })
    })
    return () => {
      vigente = false
    }
  }, [session])

  if (cargando) return <PantallaCargando />
  if (!session) return <Navigate to="/login" replace />

  const acceso: EstadoAcceso =
    validado && validado.userId === session.user.id ? validado.acceso : 'validando'

  if (acceso === 'validando') return <PantallaCargando />
  if (!acceso.concedido) return <Navigate to="/sin-acceso" replace />

  // TODO(fase-3-sync): redirección inicial por tipo (admin_empresa → panel de la empresa;
  // colaborador → su QR/consumos) cuando validarAccesoPortal devuelva el tipo real.
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  )
}
