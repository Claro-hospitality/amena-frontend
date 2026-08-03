import { supabase } from '@amena/supabase'

/** Origen derivado de cada consumo (de la cuota del día, o libre si no hay). */
export type OrigenConsumo = 'reserva' | 'extra' | 'libre'

/**
 * Una fila del historial de consumos, ya enriquecida por el RPC `listar_consumos`:
 * incluye el NOMBRE del mesero que registró (no legible por finanzas/consulta con un join
 * normal), el origen (reservada/extra/libre) y `total_filtrado` (total del filtro, para paginar).
 */
export interface ConsumoRow {
  id: number
  fecha: string
  created_at: string
  comensal_id: number
  comensal_nombre: string
  es_invitado: boolean
  empresa_id: number
  empresa_nombre: string
  precio_comida: number
  registrado_por: string
  mesero_nombre: string
  origen: OrigenConsumo
  total_filtrado: number
}

/** Filtros combinables del historial. El rango es obligatorio; el resto opcional. */
export interface FiltrosConsumos {
  desde: string
  hasta: string
  empresaId?: number | null
  registradoPor?: string | null
  q?: string | null
}

/** Un mesero con su conteo, para el desglose "por mesero" y el filtro de mesero. */
export interface PorMesero {
  registrado_por: string
  nombre: string
  comidas: number
}

/** Un comensal con su conteo, para la gráfica "quién comió más". */
export interface TopComensal {
  comensal_id: number
  nombre: string
  comidas: number
}

/** Una empresa con su conteo, para la gráfica comparativa por empresa. */
export interface PorEmpresa {
  empresa_id: number
  nombre: string
  comidas: number
}

/** Totales del período filtrado (RPC `resumen_consumos`). */
export interface ResumenConsumos {
  total: number
  comensales_unicos: number
  gasto: number
  por_mesero: PorMesero[]
  por_empresa: PorEmpresa[]
  top_comensales: TopComensal[]
}

/** Una empresa para el selector de filtro. */
export interface EmpresaOpcion {
  id: number
  nombre: string
}

const PAGE_SIZE = 50

/**
 * Página del historial vía RPC `listar_consumos` (SECURITY DEFINER: resuelve el nombre del
 * mesero y deriva el origen). Devuelve las filas de la página y el total del filtro.
 */
export async function listarConsumos(
  filtros: FiltrosConsumos,
  page = 0,
  pageSize = PAGE_SIZE
): Promise<{ rows: ConsumoRow[]; total: number }> {
  const { data, error } = await supabase.rpc('listar_consumos', {
    p_desde: filtros.desde,
    p_hasta: filtros.hasta,
    p_empresa_id: filtros.empresaId ?? undefined,
    p_registrado_por: filtros.registradoPor ?? undefined,
    p_q: filtros.q?.trim() ? filtros.q.trim() : undefined,
    p_limit: pageSize,
    p_offset: page * pageSize,
  })
  if (error) throw error
  const rows = (data ?? []) as ConsumoRow[]
  return { rows, total: rows[0]?.total_filtrado ?? 0 }
}

/** Totales del período filtrado vía RPC `resumen_consumos`. */
export async function resumenConsumos(filtros: FiltrosConsumos): Promise<ResumenConsumos> {
  const { data, error } = await supabase.rpc('resumen_consumos', {
    p_desde: filtros.desde,
    p_hasta: filtros.hasta,
    p_empresa_id: filtros.empresaId ?? undefined,
    p_registrado_por: filtros.registradoPor ?? undefined,
    p_q: filtros.q?.trim() ? filtros.q.trim() : undefined,
  })
  if (error) throw error
  return data as unknown as ResumenConsumos
}

/** Empresas para el filtro (legibles por los tres roles de oficina vía RLS). */
export async function listarEmpresas(): Promise<EmpresaOpcion[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, nombre:nombre_comercial')
    .order('nombre_comercial')
  if (error) throw error
  return (data ?? []).map((e) => ({ id: e.id, nombre: e.nombre ?? '—' }))
}

export { PAGE_SIZE }
