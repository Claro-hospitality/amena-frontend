import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarColaborador,
  cambiarEstadoColaborador,
  crearColaborador,
  listarColaboradores,
  obtenerMiEmpresaId,
  type DatosColaborador,
} from './api'

const CLAVE_COLABORADORES = ['colaboradores'] as const

export function useColaboradores() {
  return useQuery({ queryKey: CLAVE_COLABORADORES, queryFn: listarColaboradores })
}

export function useMiEmpresaId() {
  return useQuery({ queryKey: ['mi-empresa-id'], queryFn: obtenerMiEmpresaId })
}

export function useCrearColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosColaborador & { empresa_id: string }) => crearColaborador(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

export function useActualizarColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosColaborador }) =>
      actualizarColaborador(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

export function useCambiarEstadoColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoColaborador(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
