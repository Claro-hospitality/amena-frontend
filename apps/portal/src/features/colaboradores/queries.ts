import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarColaborador,
  cambiarEstadoColaborador,
  crearColaborador,
  eliminarColaborador,
  establecerConsumoLibre,
  establecerEstadoAcceso,
  listarColaboradores,
  obtenerMiEmpresaId,
  resetearPasswordColaborador,
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

/** Restablece la contraseña de un colaborador; devuelve la temporal (una sola vez). */
export function useResetearPasswordColaborador() {
  return useMutation({
    mutationFn: (usuarioId: number) => resetearPasswordColaborador(usuarioId),
  })
}

/** Activa/desactiva el ACCESO (login) del colaborador. `usuarioId` = colaborador.usuario_id. */
export function useEstablecerEstadoAcceso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: number; activo: boolean }) =>
      establecerEstadoAcceso(usuarioId, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}

/** Borrado lógico del colaborador (requiere acceso desactivado). `usuarioId` = colaborador.usuario_id. */
export function useEliminarColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (usuarioId: number) => eliminarColaborador(usuarioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
