import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Corte = Database['public']['Tables']['cortes_semanales']['Row']

/**
 * Cortes de la empresa del admin, del más reciente al más antiguo. La RLS del backend
 * restringe automáticamente a su empresa: no se filtra manualmente por empresa_id.
 */
export async function listarMisCortes(): Promise<Corte[]> {
  const { data, error } = await supabase
    .from('cortes_semanales')
    .select('*')
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  return data
}
