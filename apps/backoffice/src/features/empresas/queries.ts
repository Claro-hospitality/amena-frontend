import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  guardarDatosFiscales,
  listarDatosFiscales,
  listarEmpresas,
  obtenerDatosFiscales,
  reservasSemanaEmpresa,
  type DatosEmpresa,
  type DatosEmpresaBase,
  type DatosFiscalesEditables,
} from './api'
import { obtenerResumenEmpresa } from './resumenApi'

const CLAVE_EMPRESAS = ['empresas'] as const
const CLAVE_DATOS_FISCALES = ['datos_fiscales'] as const

export function useEmpresas() {
  return useQuery({ queryKey: CLAVE_EMPRESAS, queryFn: listarEmpresas })
}

/** Resumen operativo (semana en curso + gasto + comensales) para el detalle de empresa. */
export function useResumenEmpresa(empresaId: number) {
  return useQuery({
    queryKey: ['empresa', empresaId, 'resumen'],
    queryFn: () => obtenerResumenEmpresa(empresaId),
  })
}

/** Reservas de la semana de una empresa (con estado consumido) para el tab Consumos. */
export function useReservasSemanaEmpresa(empresaId: number, lunesISO: string) {
  return useQuery({
    queryKey: ['empresa', empresaId, 'reservas-semana', lunesISO],
    queryFn: () => reservasSemanaEmpresa(empresaId, lunesISO),
  })
}

export function useCrearEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosEmpresaBase) => crearEmpresa(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}

export function useActualizarEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<DatosEmpresa> }) =>
      actualizarEmpresa(id, datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

export function useCambiarEstadoEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      cambiarEstadoEmpresa(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  })
}

/* ----- Datos fiscales ----- */

/** Todas las filas de datos fiscales visibles (para el estado fiscal por empresa en el listado). */
export function useDatosFiscales() {
  return useQuery({ queryKey: CLAVE_DATOS_FISCALES, queryFn: listarDatosFiscales })
}

/** Los datos fiscales de una empresa concreta (o null si aún no existen). */
export function useDatosFiscalesEmpresa(empresaId: number) {
  return useQuery({
    queryKey: [...CLAVE_DATOS_FISCALES, empresaId],
    queryFn: () => obtenerDatosFiscales(empresaId),
    enabled: Number.isFinite(empresaId),
  })
}

/** Upsert de datos fiscales de una empresa. Invalida la fila y la lista fiscal. */
export function useGuardarDatosFiscales() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ empresaId, datos }: { empresaId: number; datos: DatosFiscalesEditables }) =>
      guardarDatosFiscales(empresaId, datos),
    onSuccess: (_data, { empresaId }) => {
      qc.invalidateQueries({ queryKey: CLAVE_DATOS_FISCALES })
      qc.invalidateQueries({ queryKey: [...CLAVE_DATOS_FISCALES, empresaId] })
    },
  })
}
