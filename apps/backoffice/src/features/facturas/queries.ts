import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facturaDeCorte, facturarCorte } from './api'

export function useFacturaDeCorte(corteId: number) {
  return useQuery({
    queryKey: ['factura-corte', corteId],
    queryFn: () => facturaDeCorte(corteId),
  })
}

/** Emite la factura de un corte; al terminar refresca la del corte y la lista de cortes. */
export function useFacturarCorte(corteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => facturarCorte(corteId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['factura-corte', corteId] })
      qc.invalidateQueries({ queryKey: ['cortes'] })
    },
  })
}
