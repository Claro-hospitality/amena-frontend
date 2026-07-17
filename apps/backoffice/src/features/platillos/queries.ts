import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarPlatillo,
  cambiarEstadoPlatillo,
  crearPlatillo,
  listarPlatillos,
  type DatosPlatillo,
} from './api'

const CLAVE_PLATILLOS = ['platillos'] as const

export function usePlatillos() {
  return useQuery({ queryKey: CLAVE_PLATILLOS, queryFn: listarPlatillos })
}

export function useCrearPlatillo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosPlatillo) => crearPlatillo(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_PLATILLOS }),
  })
}

export function useActualizarPlatillo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosPlatillo }) =>
      actualizarPlatillo(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_PLATILLOS }),
  })
}

export function useCambiarEstadoPlatillo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoPlatillo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_PLATILLOS }),
  })
}
