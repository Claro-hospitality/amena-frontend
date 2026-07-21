import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  altaUsuarioPortal,
  listarColaboradores,
  listarColaboradoresEmpresa,
  type DatosAlta,
} from './api'

const CLAVE_COLABORADORES = ['colaboradores'] as const

export function useColaboradores() {
  return useQuery({ queryKey: [...CLAVE_COLABORADORES, 'backoffice'], queryFn: listarColaboradores })
}

/** Colaboradores (comensales) de una empresa concreta. */
export function useColaboradoresEmpresa(empresaId: number) {
  return useQuery({
    queryKey: [...CLAVE_COLABORADORES, 'empresa', empresaId],
    queryFn: () => listarColaboradoresEmpresa(empresaId),
  })
}

export function useAltaUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosAlta) => altaUsuarioPortal(datos),
    // Un colaborador nuevo aparece en el listado; un admin no (otra tabla), pero
    // invalidar es inocuo. Invalida todo el árbol 'colaboradores' (global y por empresa).
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
