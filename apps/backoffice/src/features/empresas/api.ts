import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Empresa = Database['public']['Tables']['empresas']['Row']
export type CicloFacturacion = Database['public']['Enums']['ciclo_facturacion']
export type ModoConsumo = Database['public']['Enums']['modo_consumo']

/** Una reserva (cuota) de la semana de una empresa + si ya se consumió. */
export interface ReservaSemana {
  comensal_id: number
  nombre: string
  fecha: string
  origen: 'reserva' | 'extra'
  consumido: boolean
}

/** Reservas de la semana [lunes..+6] de una empresa, con estado consumido (RPC). */
export async function reservasSemanaEmpresa(
  empresaId: number,
  lunesISO: string
): Promise<ReservaSemana[]> {
  const { data, error } = await supabase.rpc('reservas_semana_empresa', {
    p_empresa_id: empresaId,
    p_lunes: lunesISO,
  })
  if (error) throw error
  return (data ?? []) as ReservaSemana[]
}

/** Fila de datos fiscales (1:1 con empresa). */
export type DatosFiscales = Database['public']['Tables']['datos_fiscales']['Row']

/** Datos editables de una empresa (lo que envía el formulario comercial). */
export interface DatosEmpresa {
  nombre_comercial: string | null
  precio_comida: number
  ciclo_facturacion: CicloFacturacion
  /** Política de consumo: 'reserva' (default) o 'libre'. */
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

/* ----- Datos fiscales (tabla aparte, 1:1 con empresa) ----- */

/** Campos editables de datos fiscales (lo que envía el formulario fiscal). */
export interface DatosFiscalesEditables {
  razon_social: string
  rfc: string
  codigo_postal_fiscal: string
  regimen_fiscal: string
  uso_cfdi: string
  email_facturacion: string
}

/** Devuelve la fila de datos fiscales de una empresa, o `null` si aún no existe. */
export async function obtenerDatosFiscales(empresaId: number): Promise<DatosFiscales | null> {
  const { data, error } = await supabase
    .from('datos_fiscales')
    .select('*')
    .eq('empresa_id', empresaId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Trae todas las filas de datos fiscales visibles (para el estado fiscal del listado). */
export async function listarDatosFiscales(): Promise<DatosFiscales[]> {
  const { data, error } = await supabase.from('datos_fiscales').select('*')
  if (error) throw error
  return data ?? []
}

/**
 * Upsert de los datos fiscales de una empresa: inserta si no existe, actualiza en
 * conflicto por `empresa_id` (relación 1:1). Solo super_admin/finanzas (RLS).
 */
export async function guardarDatosFiscales(
  empresaId: number,
  datos: DatosFiscalesEditables
): Promise<DatosFiscales> {
  const { data, error } = await supabase
    .from('datos_fiscales')
    .upsert({ empresa_id: empresaId, ...datos }, { onConflict: 'empresa_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * True si la empresa tiene sus datos fiscales completos (es facturable): existe la
 * fila y todos los campos requeridos para facturar están no vacíos.
 */
export function datosFiscalesCompletos(df: DatosFiscales | null | undefined): boolean {
  if (!df) return false
  return [
    df.razon_social,
    df.rfc,
    df.codigo_postal_fiscal,
    df.regimen_fiscal,
    df.uso_cfdi,
    df.email_facturacion,
  ].every((v) => typeof v === 'string' && v.trim() !== '')
}
