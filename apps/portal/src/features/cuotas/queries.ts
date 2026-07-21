import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  declararCuotas,
  listarConsumosSemana,
  listarCuotasSemana,
  type ItemDeclaracion,
  type OrigenCuota,
} from './api'

const claveCuotas = (lunesISO: string) => ['cuotas-semana', lunesISO] as const
const claveConsumos = (lunesISO: string) => ['consumos-semana', lunesISO] as const

export function useCuotasSemana(lunesISO: string) {
  return useQuery({ queryKey: claveCuotas(lunesISO), queryFn: () => listarCuotasSemana(lunesISO) })
}

export function useConsumosSemana(lunesISO: string) {
  return useQuery({
    queryKey: claveConsumos(lunesISO),
    queryFn: () => listarConsumosSemana(lunesISO),
  })
}

export function useDeclararCuotas(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      empresaId: number
      declaracion: ItemDeclaracion[]
      origen?: OrigenCuota
    }) => declararCuotas(vars.empresaId, vars.declaracion, vars.origen),
    onSuccess: () => qc.invalidateQueries({ queryKey: claveCuotas(lunesISO) }),
  })
}
