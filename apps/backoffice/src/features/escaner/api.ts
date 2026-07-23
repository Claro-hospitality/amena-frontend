import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { aISO } from '@amena/utils'

export type Consumo = Database['public']['Tables']['consumos']['Row']
export type ModoConsumo = Database['public']['Enums']['modo_consumo']

/** Resultado del registro: la RPC devuelve la fila y el nombre del comensal/empresa. */
export interface ResultadoConsumo {
  consumo: Consumo
  comensalNombre: string
  empresaNombre: string | null
  /** Cuántos consumos lleva hoy el comensal (incluye este). */
  consumosHoy: number
  /** Modo de consumo con el que se registró ('declaracion' | 'libre'). */
  modo: ModoConsumo
}

/** Consumo del día para la lista: hora, comensal, empresa y quién lo registró. */
export interface ConsumoHoy {
  id: number
  created_at: string
  comensal_nombre: string
  empresa_nombre: string | null
  /** uuid del mesero que registró (para el resumen del turno). */
  registrado_por: string
  /** nombre del mesero que registró (útil con varios dispositivos). */
  mesero_nombre: string
}

/**
 * Registra el consumo vía la RPC atómica a partir del QR escaneado (qr_token).
 * Devuelve el nombre del comensal y de la empresa para el feedback de éxito, o
 * lanza el error de negocio.
 */
export async function registrarConsumo(qrToken: string, registradoPor: string): Promise<ResultadoConsumo> {
  const { data, error } = await supabase.rpc('registrar_consumo', {
    p_qr_token: qrToken,
    p_registrado_por: registradoPor,
  })
  if (error) throw error
  const payload = data as {
    consumo: Consumo
    comensal_nombre: string
    empresa_nombre: string | null
    consumos_hoy?: number
    modo?: ModoConsumo
  }
  return {
    consumo: payload.consumo,
    comensalNombre: payload.comensal_nombre,
    empresaNombre: payload.empresa_nombre ?? null,
    consumosHoy: payload.consumos_hoy ?? 1,
    modo: payload.modo ?? 'declaracion',
  }
}

/** Total de comidas registradas hoy (para el contador). */
export async function contarConsumosHoy(): Promise<number> {
  const { count, error } = await supabase
    .from('consumos')
    .select('*', { count: 'exact', head: true })
    .eq('fecha', aISO(new Date()))
  if (error) throw error
  return count ?? 0
}

/**
 * Consumos de hoy en orden inverso (para resolver disputas), con el nombre de quién los
 * registró. Vía RPC `listar_consumos_dia` (SECURITY DEFINER: resuelve el nombre del mesero,
 * que no es legible con un select normal).
 */
export async function listarConsumosHoy(): Promise<ConsumoHoy[]> {
  const { data, error } = await supabase.rpc('listar_consumos_dia')
  if (error) throw error
  return (data ?? []) as ConsumoHoy[]
}
