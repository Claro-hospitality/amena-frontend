import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarColaborador,
  cambiarEstadoColaborador,
  crearColaborador,
  establecerConsumoLibre,
  listarColaboradores,
  obtenerMiEmpresaId,
  type DatosColaborador,
  type RolAlta,
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
    mutationFn: (datos: DatosColaborador & { empresa_id: number; rol: RolAlta }) =>
      crearColaborador(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

export function useActualizarColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, datos }: { usuarioId: number; datos: DatosColaborador }) =>
      actualizarColaborador(usuarioId, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

export function useCambiarEstadoColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      cambiarEstadoColaborador(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

/**
 * Activa/desactiva el consumo libre de un comensal. `usuarioId` es el id de
 * `usuarios_portal_empresarial` (colaborador.usuario_id), NO el id de comensal.
 */
export function useConsumoLibre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: number; activo: boolean }) =>
      establecerConsumoLibre(usuarioId, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
