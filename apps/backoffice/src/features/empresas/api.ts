import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Empresa = Database['public']['Tables']['empresas']['Row']
export type CicloFacturacion = Database['public']['Enums']['ciclo_facturacion']

/** Datos editables de una empresa (lo que envía el formulario). */
export interface DatosEmpresa {
  nombre_comercial: string
  razon_social: string | null
  rfc: string | null
  precio_comida: number
  ciclo_facturacion: CicloFacturacion
}

/** Lista todas las empresas (activas e inactivas), ordenadas por nombre comercial. RLS filtra por rol. */
export async function listarEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').order('nombre_comercial')
  if (error) throw error
  return data
}

export async function crearEmpresa(datos: DatosEmpresa): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').insert(datos).select().single()
  if (error) throw error
  return data
}

export async function actualizarEmpresa(id: string, datos: DatosEmpresa): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').update(datos).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Baja/alta lógica — nunca se borra la fila (conserva historial para facturación). */
export async function cambiarEstadoEmpresa(id: string, activo: boolean): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
