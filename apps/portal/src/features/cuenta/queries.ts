import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarMiPerfil, obtenerMiPerfil } from './api'

const CLAVE_MI_PERFIL = ['mi-perfil'] as const

export function useMiPerfil() {
  return useQuery({ queryKey: CLAVE_MI_PERFIL, queryFn: obtenerMiPerfil })
}

export function useActualizarMiPerfil() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: actualizarMiPerfil,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_MI_PERFIL }),
  })
}
