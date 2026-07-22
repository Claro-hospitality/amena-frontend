import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  listarEmpresas,
  type DatosEmpresa,
} from './api'
import { obtenerResumenEmpresa } from './resumenApi'

const CLAVE_EMPRESAS = ['empresas'] as const

export function useEmpresas() {
  return useQuery({ queryKey: CLAVE_EMPRESAS, queryFn: listarEmpresas })
}

/** Resumen operativo (semana en curso + gasto + comensales) para el detalle de empresa. */
export function useResumenEmpresa(empresaId: number) {
  return useQuery({
    queryKey: ['empresa', empresaId, 'resumen'],
    queryFn: () => obtenerResumenEmpresa(empresaId),
  })
}

export function useCrearEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosEmpresa) => crearEmpresa(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}

export function useActualizarEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosEmpresa }) => actualizarEmpresa(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}

export function useCambiarEstadoEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      cambiarEstadoEmpresa(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}
