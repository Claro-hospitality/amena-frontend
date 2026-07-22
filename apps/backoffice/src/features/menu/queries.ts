import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  agregarPlatilloADia,
  copiarSemanaAnterior,
  listarMenuRango,
  listarMenuSemana,
  quitarMenuDia,
} from './api'

const CLAVE_MENU = ['menu'] as const

export function useMenuSemana(lunesISO: string, habilitado = true) {
  return useQuery({
    queryKey: [...CLAVE_MENU, 'semana', lunesISO],
    queryFn: () => listarMenuSemana(lunesISO),
    enabled: habilitado,
  })
}

/** Menú de un rango (para la vista por mes: varias semanas). */
export function useMenuRango(desdeISO: string, hastaISO: string, habilitado = true) {
  return useQuery({
    queryKey: [...CLAVE_MENU, 'rango', desdeISO, hastaISO],
    queryFn: () => listarMenuRango(desdeISO, hastaISO),
    enabled: habilitado,
  })
}

export function useAgregarPlatillo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fecha, platilloId }: { fecha: string; platilloId: number }) =>
      agregarPlatilloADia(fecha, platilloId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MENU }),
  })
}

export function useQuitarMenuDia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => quitarMenuDia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MENU }),
  })
}

export function useCopiarSemana(lunesISO: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => copiarSemanaAnterior(lunesISO),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MENU }),
  })
}
