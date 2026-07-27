import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import type { DatosFiscalesFormData } from '@amena/utils'
import { obtenerMiEmpresaId } from '../../lib/empresaActual'

export type Empresa = Database['public']['Tables']['empresas']['Row']
export type DatosFiscales = Database['public']['Tables']['datos_fiscales']['Row']

/** Datos generales de la empresa del admin: la fila de `empresas` + sus datos fiscales (1:1). */
export interface MiEmpresa {
  empresa: Empresa
  /** Fila fiscal de la empresa; `null` si aún no se ha registrado. */
  datosFiscales: DatosFiscales | null
}

/**
 * Trae los datos generales de la empresa del admin (RLS la restringe a la suya). Incrusta los
 * datos fiscales (1:1); Supabase los devuelve como arreglo → se normaliza a objeto o `null`.
 */
export async function obtenerMiEmpresa(): Promise<MiEmpresa> {
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('empresas')
    .select('*, datos_fiscales(*)')
    .eq('id', empresaId)
    .single()
  if (error) throw error
  const { datos_fiscales, ...empresa } = data as Empresa & {
    datos_fiscales: DatosFiscales[] | DatosFiscales | null
  }
  const datosFiscales = Array.isArray(datos_fiscales)
    ? (datos_fiscales[0] ?? null)
    : (datos_fiscales ?? null)
  return { empresa: empresa as Empresa, datosFiscales }
}

/**
 * Crea o actualiza (upsert) los datos fiscales de la empresa. Las políticas RLS de `datos_fiscales`
 * permiten al admin insertar/editar SOLO la fila de su empresa (`empresa_id in mis_empresas_admin()`).
 */
export async function guardarDatosFiscales(
  empresaId: number,
  datos: DatosFiscalesFormData
): Promise<void> {
  const { error } = await supabase
    .from('datos_fiscales')
    .upsert({ empresa_id: empresaId, ...datos }, { onConflict: 'empresa_id' })
  if (error) throw error
}

/**
 * Actualiza SOLO el nombre comercial de la empresa vía la RPC `actualizar_nombre_comercial`
 * (SECURITY DEFINER): los términos comerciales (precio, ciclo, modo) no son editables por el admin.
 */
export async function actualizarNombreComercial(
  empresaId: number,
  nombre: string | null
): Promise<void> {
  const { error } = await supabase.rpc('actualizar_nombre_comercial', {
    p_empresa_id: empresaId,
    p_nombre: nombre ?? '',
  })
  if (error) throw error
}
