import { supabase } from '@amena/supabase'

/**
 * Días de la semana en español (formas canónicas del backend). El corte compara sin
 * acentos ni mayúsculas, así que estas formas casan con la lógica del cron.
 * Ver amena-backend/docs/flujos/corte-semanal.md.
 */
export const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const
export type DiaSemana = (typeof DIAS_SEMANA)[number]

const CLAVE_DIA_CORTE = 'dia_corte_semanal'

/**
 * Lee el día de corte semanal configurado. Solo super_admin puede leer/escribir
 * configuracion_sistema (RLS del backend); la UI además oculta la pantalla.
 */
export async function obtenerDiaCorte(): Promise<DiaSemana> {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', CLAVE_DIA_CORTE)
    .single()
  if (error) throw error
  return data.valor as DiaSemana
}

/** Guarda el día de corte semanal (jsonb string). */
export async function actualizarDiaCorte(dia: DiaSemana): Promise<void> {
  const { error } = await supabase
    .from('configuracion_sistema')
    .update({ valor: dia })
    .eq('clave', CLAVE_DIA_CORTE)
  if (error) throw error
}

/** Parámetros fiscales editables (claves de `configuracion_sistema`, valores jsonb string). */
export const CLAVES_FACTURACION = [
  'serie_facturas_default',
  'clave_prod_serv_sat',
  'clave_unidad_sat',
  'metodo_pago_default',
  'forma_pago_default',
  'lugar_expedicion',
] as const
export type ClaveFacturacion = (typeof CLAVES_FACTURACION)[number]
export type ConfigFacturacion = Record<ClaveFacturacion, string>

export async function obtenerConfigFacturacion(): Promise<ConfigFacturacion> {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('clave, valor')
    .in('clave', [...CLAVES_FACTURACION])
  if (error) throw error
  const cfg = Object.fromEntries(CLAVES_FACTURACION.map((c) => [c, ''])) as ConfigFacturacion
  for (const fila of data ?? []) {
    cfg[fila.clave as ClaveFacturacion] = String(fila.valor ?? '')
  }
  return cfg
}

/** Guarda cada parámetro fiscal (upsert por clave; no pisa la descripción existente). */
export async function actualizarConfigFacturacion(cfg: ConfigFacturacion): Promise<void> {
  for (const clave of CLAVES_FACTURACION) {
    const { error } = await supabase
      .from('configuracion_sistema')
      .upsert({ clave, valor: cfg[clave] }, { onConflict: 'clave' })
    if (error) throw error
  }
}
