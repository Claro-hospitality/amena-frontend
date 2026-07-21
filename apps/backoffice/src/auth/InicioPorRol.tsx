import { Navigate, useOutletContext } from 'react-router-dom'
import { rutaInicialPorRol, type ContextoAcceso } from './validarAccesoPortal'

/** Ruta índice ("/"): redirige a la home que corresponde al rol. */
export function InicioPorRol() {
  const { rol } = useOutletContext<ContextoAcceso>()
  return <Navigate to={rutaInicialPorRol(rol)} replace />
}
