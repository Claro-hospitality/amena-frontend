import { Navigate } from 'react-router-dom'
import { rutaInicial } from './validarAccesoPortal'

/** Ruta índice ("/"): redirige al inicio (el contenido se despacha por tipo dentro de /inicio). */
export function InicioPorTipo() {
  return <Navigate to={rutaInicial()} replace />
}
