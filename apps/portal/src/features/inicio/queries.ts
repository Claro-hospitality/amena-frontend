import { useQuery } from '@tanstack/react-query'
import { obtenerClima } from './clima'

/**
 * Clima actual. `retry: false` para no reintentar si el usuario niega la ubicación; se cachea
 * media hora (el clima no cambia tan rápido y evita re-pedir el permiso en cada navegación).
 */
export function useClima() {
  return useQuery({
    queryKey: ['clima'],
    queryFn: obtenerClima,
    retry: false,
    staleTime: 30 * 60 * 1000,
  })
}
