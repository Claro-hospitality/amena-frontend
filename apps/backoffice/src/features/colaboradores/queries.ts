import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { altaUsuarioPortal, listarColaboradores, listarUsuariosEmpresa, type DatosAlta } from './api'

export function useColaboradores() {
  return useQuery({ queryKey: ['colaboradores', 'backoffice'], queryFn: listarColaboradores })
}

/** Todos los usuarios del portal (admins + colaboradores) de una empresa. */
export function useUsuariosEmpresa(empresaId: number) {
  return useQuery({
    queryKey: ['usuarios', 'empresa', empresaId],
    queryFn: () => listarUsuariosEmpresa(empresaId),
  })
}

export function useAltaUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosAlta) => altaUsuarioPortal(datos),
    onSuccess: () => {
      // Refresca el listado de usuarios de la empresa y el resumen (cuenta de activos).
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}
