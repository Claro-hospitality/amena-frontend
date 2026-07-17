import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  agregarPlatilloADia,
  copiarSemanaAnterior,
  listarMenuSemana,
  quitarMenuDia,
} from './api'

const claveSemana = (lunesISO: string) => ['menu-semana', lunesISO] as const

export function useMenuSemana(lunesISO: string) {
  return useQuery({
    queryKey: claveSemana(lunesISO),
    queryFn: () => listarMenuSemana(lunesISO),
  })
}

export function useAgregarPlatillo(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fecha, platilloId }: { fecha: string; platilloId: string }) =>
      agregarPlatilloADia(fecha, platilloId),
    onSuccess: () => qc.invalidateQueries({ queryKey: claveSemana(lunesISO) }),
  })
}

export function useQuitarMenuDia(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quitarMenuDia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: claveSemana(lunesISO) }),
  })
}

export function useCopiarSemana(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => copiarSemanaAnterior(lunesISO),
    onSuccess: () => qc.invalidateQueries({ queryKey: claveSemana(lunesISO) }),
  })
}
