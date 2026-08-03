import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  reservarCuotas,
  crearInvitado,
  listarConsumosSemana,
  listarCuotasSemana,
  listarInvitadosSemana,
  type ItemReserva,
  type OrigenCuota,
} from './api'

const claveCuotas = (lunesISO: string) => ['cuotas-semana', lunesISO] as const
const claveConsumos = (lunesISO: string) => ['consumos-semana', lunesISO] as const
const claveInvitados = (lunesISO: string) => ['invitados-semana', lunesISO] as const

export function useCuotasSemana(lunesISO: string) {
  return useQuery({ queryKey: claveCuotas(lunesISO), queryFn: () => listarCuotasSemana(lunesISO) })
}

export function useConsumosSemana(lunesISO: string) {
  return useQuery({
    queryKey: claveConsumos(lunesISO),
    queryFn: () => listarConsumosSemana(lunesISO),
  })
}

export function useReservarCuotas(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      empresaId: number
      reserva: ItemReserva[]
      origen?: OrigenCuota
    }) => reservarCuotas(vars.empresaId, vars.reserva, vars.origen),
    onSuccess: () => qc.invalidateQueries({ queryKey: claveCuotas(lunesISO) }),
  })
}

export function useInvitadosSemana(lunesISO: string) {
  return useQuery({ queryKey: claveInvitados(lunesISO), queryFn: () => listarInvitadosSemana(lunesISO) })
}

export function useCrearInvitado(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearInvitado,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: claveInvitados(lunesISO) })
      qc.invalidateQueries({ queryKey: claveCuotas(lunesISO) })
    },
  })
}
