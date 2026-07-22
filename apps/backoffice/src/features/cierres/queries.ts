import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ejecutarCierreManual, listarCierres } from './api'

const CLAVE_CIERRES = ['cierres'] as const

export function useCierres() {
  return useQuery({ queryKey: CLAVE_CIERRES, queryFn: listarCierres })
}

export function useEjecutarCierre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ejecutarCierreManual,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_CIERRES }),
  })
}
