import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarDiaCierre, obtenerDiaCierre, type DiaSemana } from './api'

const CLAVE_DIA_CIERRE = ['config', 'dia_cierre_semanal'] as const

export function useDiaCierre() {
  return useQuery({ queryKey: CLAVE_DIA_CIERRE, queryFn: obtenerDiaCierre })
}

export function useActualizarDiaCierre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dia: DiaSemana) => actualizarDiaCierre(dia),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_DIA_CIERRE }),
  })
}
