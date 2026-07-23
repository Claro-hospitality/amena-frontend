import { useQuery } from '@tanstack/react-query'
import { listarConsumos } from './api'

/** Consumos en el rango [desde, hasta] ('YYYY-MM-DD'). Se re-consulta al cambiar el rango. */
export function useConsumos(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['consumos', desde, hasta],
    queryFn: () => listarConsumos(desde, hasta),
  })
}
