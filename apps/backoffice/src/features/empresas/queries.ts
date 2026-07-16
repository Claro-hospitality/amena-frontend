import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  listarEmpresas,
  type DatosEmpresa,
} from './api'

const CLAVE_EMPRESAS = ['empresas'] as const

export function useEmpresas() {
  return useQuery({ queryKey: CLAVE_EMPRESAS, queryFn: listarEmpresas })
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
    mutationFn: ({ id, datos }: { id: string; datos: DatosEmpresa }) => actualizarEmpresa(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}

export function useCambiarEstadoEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoEmpresa(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}
