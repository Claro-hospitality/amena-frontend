import { useQuery } from '@tanstack/react-query'
import { obtenerMiPerfil } from './api'

/** Perfil (nombre + rol) del usuario interno actual; para el avatar y "Mi perfil". */
export function useMiPerfil() {
  return useQuery({ queryKey: ['mi-perfil'], queryFn: obtenerMiPerfil })
}
