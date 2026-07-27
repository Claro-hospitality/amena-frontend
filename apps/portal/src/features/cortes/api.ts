import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { obtenerMiEmpresaId } from '../../lib/empresaActual'

export type Corte = Database['public']['Tables']['cortes_semanales']['Row']

/**
 * Cortes de la empresa del admin, del más reciente al más antiguo. Se acota explícitamente por
 * `empresa_id` (no basta la RLS: una cuenta con rol de backoffice vería todas las empresas).
 */
export async function listarMisCortes(): Promise<Corte[]> {
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('cortes_semanales')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('semana_inicio', { ascending: false })
  if (error) throw error
  return data
}
