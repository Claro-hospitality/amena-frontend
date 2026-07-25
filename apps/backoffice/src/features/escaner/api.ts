import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { aISO } from '@amena/utils'

export type Consumo = Database['public']['Tables']['consumos']['Row']
export type ModoConsumo = Database['public']['Enums']['modo_consumo']
export type MetodoConsumo = Database['public']['Enums']['metodo_consumo']

/** Resultado del registro: la RPC devuelve la fila y el nombre del comensal/empresa. */
export interface ResultadoConsumo {
  consumo: Consumo
  comensalNombre: string
  empresaNombre: string | null
  /** Cuántos consumos lleva hoy el comensal (incluye este). */
  consumosHoy: number
  /** Modo de consumo con el que se registró ('reserva' | 'libre'). */
  modo: ModoConsumo
}

/** Consumo del día para la lista: hora, comensal, empresa, quién lo registró y cómo. */
export interface ConsumoHoy {
  id: number
  created_at: string
  comensal_nombre: string
  empresa_nombre: string | null
  /** uuid del mesero que registró (para el resumen del turno). */
  registrado_por: string
  /** nombre del mesero que registró (útil con varios dispositivos). */
  mesero_nombre: string
  /** qr (escaneo) o manual (registro por búsqueda). */
  metodo: MetodoConsumo
  /** reserva | extra | libre (para contar los consumos libres del turno). */
  origen: string
}

/**
 * Un comensal en la búsqueda del registro manual, con su estado de hoy. Se define a mano
 * (no derivado de los tipos generados) porque el generador marca como no-nulos campos que en
 * runtime sí pueden ser null: `empresa_nombre` (empresas.nombre_comercial), `ultima_hora`
 * (max sin filas) y `limite_diario` (ilimitado).
 */
export interface BusquedaComensal {
  comensal_id: number
  nombre: string
  empresa_nombre: string | null
  es_libre: boolean
  tiene_cuota: boolean
  consumio_hoy: boolean
  ultima_hora: string | null
  consumos_hoy: number
  limite_diario: number | null
}

/** Estado operativo del día para los banners del escáner. */
export interface EstadoOperativo {
  hay_menu: boolean
  hay_cuotas: boolean
}

/** Normaliza el jsonb de las RPC de registro (escaneo y manual) al tipo del front. */
function mapearResultado(data: unknown): ResultadoConsumo {
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
    modo: payload.modo ?? 'reserva',
  }
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
  return mapearResultado(data)
}

/**
 * Registro MANUAL (plan B del QR olvidado): mismas validaciones que el escaneo, por comensal_id.
 * El backend marca el consumo con metodo='manual'.
 */
export async function registrarConsumoManual(
  comensalId: number,
  registradoPor: string
): Promise<ResultadoConsumo> {
  const { data, error } = await supabase.rpc('registrar_consumo_manual', {
    p_comensal_id: comensalId,
    p_registrado_por: registradoPor,
  })
  if (error) throw error
  return mapearResultado(data)
}

/** Busca comensales por nombre (mínimo 2 caracteres) con su estado de hoy, para el registro manual. */
export async function buscarComensales(q: string): Promise<BusquedaComensal[]> {
  const { data, error } = await supabase.rpc('buscar_comensales_consumo', { p_q: q })
  if (error) throw error
  return data ?? []
}

/** Estado operativo de hoy (¿menú cargado? ¿cuotas?) para los banners. */
export async function estadoOperativoDia(): Promise<EstadoOperativo> {
  const { data, error } = await supabase.rpc('estado_operativo_dia')
  if (error) throw error
  return (data ?? { hay_menu: true, hay_cuotas: true }) as unknown as EstadoOperativo
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
