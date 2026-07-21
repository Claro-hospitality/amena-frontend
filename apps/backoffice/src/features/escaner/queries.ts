import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contarConsumosHoy, listarConsumosHoy, registrarConsumo } from './api'

export const CLAVE_CONTADOR = ['contador-hoy'] as const
export const CLAVE_LISTA = ['consumos-hoy'] as const

/** Contador del día. `refetchInterval` es el respaldo si Realtime se cae. */
export function useContadorHoy() {
  return useQuery({
    queryKey: CLAVE_CONTADOR,
    queryFn: contarConsumosHoy,
    refetchInterval: 30_000,
  })
}

export function useConsumosHoy() {
  return useQuery({ queryKey: CLAVE_LISTA, queryFn: listarConsumosHoy })
}

export function useRegistrarConsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ qrToken, registradoPor }: { qrToken: string; registradoPor: string }) =>
      registrarConsumo(qrToken, registradoPor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVE_CONTADOR })
      qc.invalidateQueries({ queryKey: CLAVE_LISTA })
    },
  })
}
