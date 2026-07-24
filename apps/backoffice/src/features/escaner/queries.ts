import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  buscarComensales,
  contarConsumosHoy,
  estadoOperativoDia,
  listarConsumosHoy,
  registrarConsumo,
  registrarConsumoManual,
} from './api'

export const CLAVE_CONTADOR = ['contador-hoy'] as const
export const CLAVE_LISTA = ['consumos-hoy'] as const
export const CLAVE_ESTADO = ['estado-operativo'] as const

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

/** Estado operativo del día (banners). Se refresca de vez en cuando por si cargan menú/cuotas. */
export function useEstadoOperativo() {
  return useQuery({ queryKey: CLAVE_ESTADO, queryFn: estadoOperativoDia, refetchInterval: 60_000 })
}

/** Búsqueda de comensales para el registro manual (solo con 2+ caracteres). */
export function useBuscarComensales(q: string) {
  const term = q.trim()
  return useQuery({
    queryKey: ['buscar-comensales', term],
    queryFn: () => buscarComensales(term),
    enabled: term.length >= 2,
    staleTime: 10_000,
  })
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

export function useRegistrarManual() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ comensalId, registradoPor }: { comensalId: number; registradoPor: string }) =>
      registrarConsumoManual(comensalId, registradoPor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVE_CONTADOR })
      qc.invalidateQueries({ queryKey: CLAVE_LISTA })
    },
  })
}
