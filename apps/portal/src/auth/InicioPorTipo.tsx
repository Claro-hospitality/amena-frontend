import { Navigate, useOutletContext } from 'react-router-dom'
import { rutaInicial, type ContextoAcceso } from './validarAccesoPortal'

/** Ruta índice ("/"): redirige al home según el tipo (colaborador → /mi-qr, admin → /inicio). */
export function InicioPorTipo() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  return <Navigate to={rutaInicial(tipo)} replace />
}
