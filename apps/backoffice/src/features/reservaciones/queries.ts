import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CLAVE_EVENTOS } from '../eventos/queries'
import {
  contarBoletosValidados,
  contarReservacionesActivas,
  listarReservacionesPagina,
  obtenerReservacionPorFolio,
  validarBoleto,
  type FiltrosReservaciones,
} from './api'

export const CLAVE_RESERVACIONES = ['reservaciones'] as const

/**
 * Página del listado. Todas las claves cuelgan de `CLAVE_RESERVACIONES` para que validar un
 * boleto invalide de un golpe la página, el conteo del encabezado y el del escáner.
 */
export function useReservacionesPagina(
  filtros: FiltrosReservaciones,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: [
      ...CLAVE_RESERVACIONES,
      'pagina',
      filtros.filtro,
      filtros.busqueda.trim(),
      page,
      pageSize,
    ],
    queryFn: () => listarReservacionesPagina(filtros, page, pageSize),
    placeholderData: keepPreviousData,
  })
}

/** Activas (no canceladas) para el encabezado. */
export function useReservacionesActivas() {
  return useQuery({
    queryKey: [...CLAVE_RESERVACIONES, 'activas'],
    queryFn: contarReservacionesActivas,
  })
}

/** Boletos validados de un evento, para la barra de avance del escáner. */
export function useBoletosValidados(eventoId: string | undefined) {
  return useQuery({
    queryKey: [...CLAVE_RESERVACIONES, 'validados', eventoId],
    queryFn: () => contarBoletosValidados(eventoId!),
    enabled: Boolean(eventoId),
  })
}

export function useReservacion(folio: string | undefined) {
  return useQuery({
    queryKey: [...CLAVE_RESERVACIONES, 'folio', folio],
    queryFn: () => obtenerReservacionPorFolio(folio!),
    enabled: Boolean(folio),
  })
}

export function useValidarBoleto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (folio: string) => validarBoleto(folio),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVE_RESERVACIONES })
      // El resumen cuenta boletos validados, así que también queda viejo.
      qc.invalidateQueries({ queryKey: CLAVE_EVENTOS })
    },
  })
}
