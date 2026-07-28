import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarMiNombre, obtenerMiPerfil } from './api'

/** Perfil (nombre + rol) del usuario interno actual; para el avatar y "Mi perfil". */
export function useMiPerfil() {
  return useQuery({ queryKey: ['mi-perfil'], queryFn: obtenerMiPerfil })
}

/** Actualiza mi propio nombre; refresca el perfil (avatar + "Mi perfil"). */
export function useActualizarMiNombre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => actualizarMiNombre(nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mi-perfil'] }),
  })
}
