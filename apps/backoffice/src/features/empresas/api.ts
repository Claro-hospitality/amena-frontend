import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Empresa = Database['public']['Tables']['empresas']['Row']
export type CicloFacturacion = Database['public']['Enums']['ciclo_facturacion']
export type ModoConsumo = Database['public']['Enums']['modo_consumo']

/** Datos editables de una empresa (lo que envía el formulario). */
export interface DatosEmpresa {
  nombre_comercial: string | null
  razon_social: string
  rfc: string | null
  precio_comida: number
  ciclo_facturacion: CicloFacturacion
  /** Política de consumo: 'declaracion' (default) o 'libre'. */
  modo_consumo: ModoConsumo
  /** Días permitidos para consumo libre en ISO dow (1=lun … 5=vie). */
  dias_permitidos: number[]
  /** Límite de consumos por día en modo libre; null = ilimitado. */
  limite_diario: number | null
}

/** Lista todas las empresas (activas e inactivas), ordenadas por nombre comercial. RLS filtra por rol. */
export async function listarEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').order('nombre_comercial')
  if (error) throw error
  return data
}

/** Datos base que crea el formulario de alta (sin la política de consumo). */
export type DatosEmpresaBase = Omit<
  DatosEmpresa,
  'modo_consumo' | 'dias_permitidos' | 'limite_diario'
>

/** Solo los campos de la política de consumo (sección aparte del detalle). */
export type DatosPoliticaConsumo = Pick<
  DatosEmpresa,
  'modo_consumo' | 'dias_permitidos' | 'limite_diario'
>

export async function crearEmpresa(datos: DatosEmpresaBase): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').insert(datos).select().single()
  if (error) throw error
  return data
}

/** Actualiza uno o varios campos de la empresa (datos base y/o política de consumo). */
export async function actualizarEmpresa(
  id: number,
  datos: Partial<DatosEmpresa>
): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').update(datos).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Baja/alta lógica — nunca se borra la fila (conserva historial para facturación). */
export async function cambiarEstadoEmpresa(id: number, activo: boolean): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
