import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'

/**
 * Sección "Empresa" (solo admin): guard de acceso + passthrough del contexto a las rutas hijas.
 * La navegación entre General y las secciones hijas (colaboradores, cuotas, cortes, facturas) se
 * hace desde las tarjetas de la página General (`/empresa`) y los breadcrumbs del shell — ya no
 * hay barra de tabs.
 */
export function EmpresaLayout() {
  const contexto = useOutletContext<ContextoAcceso>()

  // Defensa en profundidad: un colaborador que teclee /empresa vuelve a su inicio.
  if (contexto.tipo !== 'admin_empresa') return <Navigate to="/inicio" replace />

  return <Outlet context={contexto} />
}
