import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ejecutarCorteManual, listarCierres } from './api'

const CLAVE_CIERRES = ['cierres'] as const

export function useCierres() {
  return useQuery({ queryKey: CLAVE_CIERRES, queryFn: listarCierres })
}

export function useEjecutarCorte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ejecutarCorteManual,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_CIERRES }),
  })
}
