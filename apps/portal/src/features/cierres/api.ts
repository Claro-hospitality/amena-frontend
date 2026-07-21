import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Cierre = Database['public']['Tables']['cierres_semanales']['Row']

/**
 * Cierres de la empresa del admin, del más reciente al más antiguo. La RLS del backend
 * restringe automáticamente a su empresa: no se filtra manualmente por empresa_id.
 */
export async function listarMisCierres(): Promise<Cierre[]> {
  const { data, error } = await supabase
    .from('cierres_semanales')
    .select('*')
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  return data
}
