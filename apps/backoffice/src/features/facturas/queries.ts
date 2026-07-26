import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  facturaDeCorte,
  facturarCorte,
  listarFacturas,
  listarFacturasEmpresa,
} from './api'

const CLAVE_FACTURAS = ['facturas'] as const

export function useFacturas() {
  return useQuery({ queryKey: CLAVE_FACTURAS, queryFn: listarFacturas })
}

export function useFacturasEmpresa(empresaId: number) {
  return useQuery({
    queryKey: [...CLAVE_FACTURAS, 'empresa', empresaId],
    queryFn: () => listarFacturasEmpresa(empresaId),
  })
}

export function useFacturaDeCorte(corteId: number) {
  return useQuery({
    queryKey: ['factura-corte', corteId],
    queryFn: () => facturaDeCorte(corteId),
  })
}

/** Emite la factura de un corte; al terminar refresca facturas, la del corte y los cortes. */
export function useFacturarCorte(corteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => facturarCorte(corteId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CLAVE_FACTURAS })
      qc.invalidateQueries({ queryKey: ['factura-corte', corteId] })
      qc.invalidateQueries({ queryKey: ['cortes'] })
    },
  })
}
