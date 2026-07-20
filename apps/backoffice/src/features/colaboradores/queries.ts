import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crearColaborador, listarColaboradores, type DatosColaborador } from './api'

const CLAVE_COLABORADORES = ['colaboradores', 'backoffice'] as const

export function useColaboradores() {
  return useQuery({ queryKey: CLAVE_COLABORADORES, queryFn: listarColaboradores })
}

export function useCrearColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosColaborador) => crearColaborador(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_COLABORADORES }),
  })
}
