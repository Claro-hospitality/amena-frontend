import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarRol,
  crearUsuario,
  eliminarUsuario,
  establecerEstado,
  listarUsuarios,
  type MotivoAcceso,
  restablecerAcceso,
  type RolBackoffice,
} from './api'

const CLAVE = ['usuarios-backoffice'] as const

export function useUsuarios() {
  return useQuery({ queryKey: CLAVE, queryFn: listarUsuarios })
}

export function useCrearUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: { nombre: string; email: string; rol: RolBackoffice }) =>
      crearUsuario(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE }),
  })
}

export function useRestablecerAcceso() {
  return useMutation({
    mutationFn: ({ email, motivo }: { email: string; motivo: MotivoAcceso }) =>
      restablecerAcceso(email, motivo),
  })
}

export function useCambiarRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, rol }: { userId: string; rol: RolBackoffice }) =>
      cambiarRol(userId, rol),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE }),
  })
}

export function useEstablecerEstado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, activo }: { userId: string; activo: boolean }) =>
      establecerEstado(userId, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE }),
  })
}

export function useEliminarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => eliminarUsuario(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE }),
  })
}
