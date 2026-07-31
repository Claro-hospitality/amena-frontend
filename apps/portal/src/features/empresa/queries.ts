import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DatosFiscalesFormData } from '@amena/utils'
import {
  actualizarNombreComercial,
  guardarDatosFiscales,
  obtenerMiEmpresa,
} from './api'

const CLAVE_MI_EMPRESA = ['mi-empresa'] as const

export function useMiEmpresa(opciones?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CLAVE_MI_EMPRESA,
    queryFn: obtenerMiEmpresa,
    enabled: opciones?.enabled ?? true,
  })
}

export function useGuardarDatosFiscales(empresaId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosFiscalesFormData) => guardarDatosFiscales(empresaId, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MI_EMPRESA }),
  })
}

export function useActualizarNombreComercial(empresaId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string | null) => actualizarNombreComercial(empresaId, nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MI_EMPRESA }),
  })
}
