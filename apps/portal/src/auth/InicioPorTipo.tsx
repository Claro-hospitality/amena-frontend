import { Navigate, useOutletContext } from 'react-router-dom'
import { rutaInicialPorTipo, type ContextoAcceso } from './validarAccesoPortal'

/** Ruta índice ("/"): redirige a la home que corresponde al tipo de usuario. */
export function InicioPorTipo() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  return <Navigate to={rutaInicialPorTipo(tipo)} replace />
}
