import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarConfigFacturacion,
  actualizarDiaCorte,
  type ConfigFacturacion,
  obtenerConfigFacturacion,
  obtenerDiaCorte,
  type DiaSemana,
} from './api'

const CLAVE_DIA_CORTE = ['config', 'dia_corte_semanal'] as const
const CLAVE_FACTURACION = ['config', 'facturacion'] as const

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

export function useConfigFacturacion() {
  return useQuery({ queryKey: CLAVE_FACTURACION, queryFn: obtenerConfigFacturacion })
}

export function useActualizarConfigFacturacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cfg: ConfigFacturacion) => actualizarConfigFacturacion(cfg),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_FACTURACION }),
  })
}
