import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Corte = Database['public']['Tables']['cortes_semanales']['Row']
export type CorteConEmpresa = Corte & { empresa: { nombre: string } | null }

/**
 * Lista todos los cortes visibles para el usuario (super_admin: todos; finanzas: todos —
 * RLS del backend hace el filtrado real), del más reciente al más antiguo.
 */
export async function listarCortes(): Promise<CorteConEmpresa[]> {
  const { data, error } = await supabase
    .from('cortes_semanales')
    .select('*, empresa:empresas(nombre:nombre_comercial)')
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  return data as unknown as CorteConEmpresa[]
}

export interface ResultadoCorte {
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
 * Dispara el corte manual (force=true) vía la Edge Function corte-semanal. Ignora el día
 * configurado y genera los cortes de la última semana completa. Solo super_admin (la UI lo
 * oculta a otros roles; el filtrado real de datos lo hace la función con service_role).
 */
export async function ejecutarCorteManual(): Promise<ResultadoCorte> {
  const { data, error } = await supabase.functions.invoke('corte-semanal', {
    body: { force: true },
  })
  if (error) throw error
  return data as ResultadoCorte
}
