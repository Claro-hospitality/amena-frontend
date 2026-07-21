import { supabase } from '@amena/supabase'
import type { Database, Json } from '@amena/supabase/types'
import { aISO, deISO, diasHabiles } from '@amena/utils'

export type OrigenCuota = Database['public']['Enums']['origen_cuota']

/** Cuota activa de la semana, con el comensal al que pertenece. */
export interface CuotaSemana {
  id: number
  fecha: string
  origen: OrigenCuota
  colaborador: { id: number; nombre: string }
}

/** Consumo (par comensal+fecha) para cruzar con las cuotas. */
export interface ConsumoSemana {
  comensal_id: number
  fecha: string
}

/** Un renglón de la declaración: un comensal y las fechas que tendrá comida. */
export interface ItemDeclaracion {
  comensal_id: number
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
    .select('id, fecha, origen, comensal:comensales(id, usuario:usuarios_portal_empresarial(nombre))')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return ((data ?? []) as FilaCuota[]).map((c) => ({
    id: c.id,
    fecha: c.fecha,
    origen: c.origen,
    colaborador: { id: c.comensal?.id ?? 0, nombre: c.comensal?.usuario?.nombre ?? '' },
  }))
}

interface FilaCuota {
  id: number
  fecha: string
  origen: OrigenCuota
  comensal: { id: number; usuario: { nombre: string } | null } | null
}

/** Consumos [lun..vie] de la empresa del admin (RLS filtra la empresa). */
export async function listarConsumosSemana(lunesISO: string): Promise<ConsumoSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const { data, error } = await supabase
    .from('consumos')
    .select('comensal_id, fecha')
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
  empresaId: number,
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
