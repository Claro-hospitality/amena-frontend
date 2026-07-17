import { useQuery } from '@tanstack/react-query'
import {
  estadoDeHoy,
  menuDelDia,
  menuSemana,
  misConsumos,
  misCuotasSemana,
  obtenerMiColaborador,
} from './api'

export function useMiColaborador() {
  return useQuery({ queryKey: ['mi-colaborador'], queryFn: obtenerMiColaborador })
}

export function useEstadoHoy() {
  return useQuery({ queryKey: ['estado-hoy'], queryFn: estadoDeHoy })
}

export function useMenuDia(fechaISO: string) {
  return useQuery({ queryKey: ['menu-dia', fechaISO], queryFn: () => menuDelDia(fechaISO) })
}

export function useMenuSemana(lunesISO: string) {
  return useQuery({ queryKey: ['menu-semana-colab', lunesISO], queryFn: () => menuSemana(lunesISO) })
}

export function useMisCuotasSemana(lunesISO: string) {
  return useQuery({ queryKey: ['mis-cuotas', lunesISO], queryFn: () => misCuotasSemana(lunesISO) })
}

export function useMisConsumos() {
  return useQuery({ queryKey: ['mis-consumos'], queryFn: () => misConsumos() })
}
