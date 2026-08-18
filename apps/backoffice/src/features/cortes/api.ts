import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { invocarFuncion } from '@amena/supabase/funciones'

export type Corte = Database['public']['Tables']['cortes_semanales']['Row']
export type EstadoFactura = Database['public']['Enums']['estado_factura']
export type CorteConEmpresa = Corte & {
  empresa: { nombre: string } | null
  /** Factura del corte (1:1) si existe; `null` si aún no se ha facturado. */
  factura: { estado: EstadoFactura } | null
}

/**
 * Lista todos los cortes visibles para el usuario (super_admin: todos; finanzas: todos —
 * RLS del backend hace el filtrado real), del más reciente al más antiguo. Embebe la factura
 * (1:1) para mostrar su estado en el listado.
 */
export async function listarCortes(): Promise<CorteConEmpresa[]> {
  const { data, error } = await supabase
    .from('cortes_semanales')
    .select('*, empresa:empresas(nombre:nombre_comercial), factura:facturas(estado)')
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  const filas = (data ?? []) as unknown as Array<
    Corte & {
      empresa: { nombre: string } | null
      factura: { estado: EstadoFactura }[] | { estado: EstadoFactura } | null
    }
  >
  // PostgREST puede devolver la relación embebida como arreglo; se normaliza a objeto | null.
  return filas.map((c) => ({
    ...c,
    factura: Array.isArray(c.factura) ? (c.factura[0] ?? null) : (c.factura ?? null),
  }))
}

/** Desglose de los consumos de un corte (RPC `detalle_corte_consumo`): categorías disjuntas. */
export interface DesgloseCorte {
  reservados: number
  extras: number
  libres: number
  invitados: number
  consumidas: number
}

/** Recompone el desglose de consumo de una (empresa, semana) para el diálogo de detalle. */
export async function detalleCorteConsumo(
  empresaId: number,
  semanaInicio: string
): Promise<DesgloseCorte> {
  const { data, error } = await supabase.rpc('detalle_corte_consumo', {
    p_empresa_id: empresaId,
    p_semana_inicio: semanaInicio,
  })
  if (error) throw error
  return data as unknown as DesgloseCorte
}

export interface ResultadoCorte {
  corrio: boolean
  forzado?: boolean
  motivo?: string
  resultado?: {
    semana_inicio: string
    generados: number
    ya_existentes: number
    omitidos: number
    empresas: unknown[]
  }
}

/**
 * Dispara el corte manual (force=true) vía la Edge Function corte-semanal. Ignora el día
 * configurado y genera los cortes de la última semana completa. Solo super_admin (la UI lo
 * oculta a otros roles; el filtrado real de datos lo hace la función con service_role).
 */
export async function ejecutarCorteManual(): Promise<ResultadoCorte> {
  return invocarFuncion<ResultadoCorte>(
    'corte-semanal',
    { force: true },
    'No se pudo ejecutar el corte. Intenta de nuevo.'
  )
}
