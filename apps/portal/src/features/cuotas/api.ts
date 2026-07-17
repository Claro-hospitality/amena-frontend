import { supabase } from '@amena/supabase'
import type { Database, Json } from '@amena/supabase/types'
import { aISO, deISO, diasHabiles } from '@amena/utils'

export type OrigenCuota = Database['public']['Enums']['origen_cuota']

/** Cuota activa de la semana, con el colaborador al que pertenece. */
export interface CuotaSemana {
  id: string
  fecha: string
  origen: OrigenCuota
  colaborador: { id: string; nombre: string }
}

/** Consumo (par colaborador+fecha) para cruzar con las cuotas. */
export interface ConsumoSemana {
  colaborador_id: string
  fecha: string
}

/** Un renglón de la declaración: un colaborador y las fechas que tendrá comida. */
export interface ItemDeclaracion {
  colaborador_id: string
  fechas: string[]
}

/** Resumen que devuelve la RPC. */
export interface ResumenDeclaracion {
  creadas: number
  reactivadas: number
  ya_existentes: number
}

function rangoSemana(lunesISO: string) {
  const dias = diasHabiles(deISO(lunesISO)).map(aISO)
  return { desde: dias[0], hasta: dias[dias.length - 1] }
}

/** Cuotas activas [lun..vie] de la empresa del admin (RLS filtra la empresa). */
export async function listarCuotasSemana(lunesISO: string): Promise<CuotaSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const { data, error } = await supabase
    .from('cuotas')
    .select('id, fecha, origen, colaborador:colaboradores(id, nombre)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as unknown as CuotaSemana[]
}

/** Consumos [lun..vie] de la empresa del admin (RLS filtra la empresa). */
export async function listarConsumosSemana(lunesISO: string): Promise<ConsumoSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const { data, error } = await supabase
    .from('consumos')
    .select('colaborador_id, fecha')
    .gte('fecha', desde)
    .lte('fecha', hasta)
  if (error) throw error
  return (data ?? []) as ConsumoSemana[]
}

/**
 * Declara cuotas vía la RPC atómica e idempotente `declarar_cuotas`.
 * `origen` = 'declaracion' (viernes) o 'extra' (sobre la marcha).
 */
export async function declararCuotas(
  empresaId: string,
  declaracion: ItemDeclaracion[],
  origen: OrigenCuota = 'declaracion'
): Promise<ResumenDeclaracion> {
  const { data, error } = await supabase.rpc('declarar_cuotas', {
    p_empresa_id: empresaId,
    p_declaracion: declaracion as unknown as Json,
    p_origen: origen,
  })
  if (error) throw error
  return data as unknown as ResumenDeclaracion
}
