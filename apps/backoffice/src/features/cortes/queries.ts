import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { detalleCorteConsumo, ejecutarCorteManual, listarCortes } from './api'

const CLAVE_CORTES = ['cortes'] as const

export function useCortes() {
  return useQuery({ queryKey: CLAVE_CORTES, queryFn: listarCortes })
}

/** Desglose de consumo (reservados/extras/libres/invitados) de un corte, para el diálogo. */
export function useDetalleCorte(empresaId: number, semanaInicio: string) {
  return useQuery({
    queryKey: ['corte-detalle', empresaId, semanaInicio],
    queryFn: () => detalleCorteConsumo(empresaId, semanaInicio),
  })
}

export function useEjecutarCorte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ejecutarCorteManual,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_CORTES }),
  })
}
