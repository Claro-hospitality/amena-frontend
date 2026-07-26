import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ejecutarCorteManual, listarCortes } from './api'

const CLAVE_CORTES = ['cortes'] as const

export function useCortes() {
  return useQuery({ queryKey: CLAVE_CORTES, queryFn: listarCortes })
}

export function useEjecutarCorte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ejecutarCorteManual,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_CORTES }),
  })
}
