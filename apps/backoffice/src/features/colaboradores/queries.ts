import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { altaUsuarioPortal, listarColaboradores, type DatosAlta } from './api'

const CLAVE_COLABORADORES = ['colaboradores', 'backoffice'] as const

export function useColaboradores() {
  return useQuery({ queryKey: CLAVE_COLABORADORES, queryFn: listarColaboradores })
}

export function useAltaUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosAlta) => altaUsuarioPortal(datos),
    // Un colaborador nuevo aparece en el listado; un admin no (otra tabla), pero
    // invalidar es inocuo.
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
