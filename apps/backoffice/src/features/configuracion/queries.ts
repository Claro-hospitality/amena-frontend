import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarDiaCorte, obtenerDiaCorte, type DiaSemana } from './api'

const CLAVE_DIA_CORTE = ['config', 'dia_corte_semanal'] as const

export function useDiaCorte() {
  return useQuery({ queryKey: CLAVE_DIA_CORTE, queryFn: obtenerDiaCorte })
}

export function useActualizarDiaCorte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dia: DiaSemana) => actualizarDiaCorte(dia),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_DIA_CORTE }),
  })
}
