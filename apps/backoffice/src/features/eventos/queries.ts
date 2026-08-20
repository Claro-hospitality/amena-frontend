import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  guardarEvento,
  listarEventos,
  obtenerEventoPorSlug,
  obtenerResumen,
  type DatosEvento,
} from './api'

export const CLAVE_EVENTOS = ['eventos'] as const
export const CLAVE_RESUMEN_EVENTOS = ['eventos', 'resumen'] as const

export function useEventos() {
  return useQuery({ queryKey: CLAVE_EVENTOS, queryFn: listarEventos })
}

export function useEvento(slug: string | undefined) {
  return useQuery({
    queryKey: [...CLAVE_EVENTOS, 'slug', slug],
    queryFn: () => obtenerEventoPorSlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useResumenEventos() {
  return useQuery({ queryKey: CLAVE_RESUMEN_EVENTOS, queryFn: obtenerResumen })
}

export function useGuardarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ datos, id }: { datos: DatosEvento; id?: string }) => guardarEvento(datos, id),
    // Se invalida por prefijo: cubre el listado, el detalle por slug y el resumen.
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EVENTOS }),
  })
}
