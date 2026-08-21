import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  contarEventosPorEstado,
  guardarEvento,
  listarEventos,
  listarEventosPagina,
  obtenerEventoPorSlug,
  obtenerResumen,
  type DatosEvento,
  type FiltrosEventos,
} from './api'

export const CLAVE_EVENTOS = ['eventos'] as const
export const CLAVE_RESUMEN_EVENTOS = ['eventos', 'resumen'] as const

/** Lista completa, sin paginar. La usan el resumen y el selector del escáner (son decenas). */
export function useEventos() {
  return useQuery({ queryKey: CLAVE_EVENTOS, queryFn: listarEventos })
}

/** Página del catálogo. `keepPreviousData` evita el parpadeo al cambiar de página o de filtro. */
export function useEventosPagina(filtros: FiltrosEventos, page: number, pageSize: number) {
  return useQuery({
    queryKey: [
      ...CLAVE_EVENTOS,
      'pagina',
      filtros.filtro,
      filtros.busqueda.trim(),
      page,
      pageSize,
    ],
    queryFn: () => listarEventosPagina(filtros, page, pageSize),
    placeholderData: keepPreviousData,
  })
}

/** Publicados y borradores del encabezado; cuelga del mismo prefijo para invalidarse al guardar. */
export function useConteoEventos() {
  return useQuery({ queryKey: [...CLAVE_EVENTOS, 'conteo'], queryFn: contarEventosPorEstado })
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
