import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CLAVE_EVENTOS } from '../eventos/queries'
import { listarReservaciones, obtenerReservacionPorFolio, validarBoleto } from './api'

export const CLAVE_RESERVACIONES = ['reservaciones'] as const

export function useReservaciones() {
  return useQuery({ queryKey: CLAVE_RESERVACIONES, queryFn: listarReservaciones })
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
