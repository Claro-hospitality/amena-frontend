import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarConsumos, listarEmpresas, resumenConsumos, type FiltrosConsumos } from './api'

/** Clave estable de los filtros (para las queryKeys). */
function claveFiltros(f: FiltrosConsumos) {
  return [f.desde, f.hasta, f.empresaId ?? null, f.registradoPor ?? null, f.q?.trim() || null]
}

/** Página del historial. `keepPreviousData` evita parpadeos al paginar/filtrar. */
export function useConsumos(filtros: FiltrosConsumos, page: number) {
  return useQuery({
    queryKey: ['consumos', 'lista', ...claveFiltros(filtros), page],
    queryFn: () => listarConsumos(filtros, page),
    placeholderData: keepPreviousData,
  })
}

/** Totales del período filtrado (métricas, por-mesero, top comensales). */
export function useResumenConsumos(filtros: FiltrosConsumos) {
  return useQuery({
    queryKey: ['consumos', 'resumen', ...claveFiltros(filtros)],
    queryFn: () => resumenConsumos(filtros),
    placeholderData: keepPreviousData,
  })
}

/** Empresas para el selector de filtro. */
export function useEmpresas() {
  return useQuery({ queryKey: ['empresas', 'opciones'], queryFn: listarEmpresas })
}
