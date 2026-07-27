import { supabase } from '@amena/supabase'

/**
 * ID (int8) de la empresa que administra el usuario logueado, vía la RPC `mis_empresas_admin`.
 *
 * Se usa para ACOTAR EXPLÍCITAMENTE por empresa todas las consultas del portal. La RLS del
 * backend es la barrera de seguridad, pero sus políticas son permisivas (se suman con OR): una
 * cuenta que además tenga rol de backoffice (super_admin/finanzas/consulta) vería datos de todas
 * las empresas desde el portal. Por eso el portal nunca depende solo de la RLS: filtra por esta
 * empresa. Lanza si el usuario no administra ninguna.
 */
export async function obtenerMiEmpresaId(): Promise<number> {
  const { data, error } = await supabase.rpc('mis_empresas_admin')
  if (error) throw error
  const id = data?.[0]
  if (id == null) throw new Error('El usuario no administra ninguna empresa')
  return id
}
