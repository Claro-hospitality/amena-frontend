import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Cierre = Database['public']['Tables']['cierres_semanales']['Row']
export type CierreConEmpresa = Cierre & { empresa: { nombre: string } | null }

/**
 * Lista todos los cierres visibles para el usuario (super_admin: todos; finanzas: todos —
 * RLS del backend hace el filtrado real), del más reciente al más antiguo.
 */
export async function listarCierres(): Promise<CierreConEmpresa[]> {
  const { data, error } = await supabase
    .from('cierres_semanales')
    .select('*, empresa:empresas(nombre:nombre_comercial)')
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  return data as unknown as CierreConEmpresa[]
}

export interface ResultadoCierre {
  corrio: boolean
  forzado?: boolean
  motivo?: string
  resultado?: {
    semana_inicio: string
    generados: number
    ya_existentes: number
    empresas: unknown[]
  }
}

/**
 * Dispara el cierre manual (force=true) vía la Edge Function cierre-semanal. Ignora el día
 * configurado y genera los cierres de la última semana completa. Solo super_admin (la UI lo
 * oculta a otros roles; el filtrado real de datos lo hace la función con service_role).
 */
export async function ejecutarCierreManual(): Promise<ResultadoCierre> {
  const { data, error } = await supabase.functions.invoke('cierre-semanal', {
    body: { force: true },
  })
  if (error) throw error
  return data as ResultadoCierre
}
