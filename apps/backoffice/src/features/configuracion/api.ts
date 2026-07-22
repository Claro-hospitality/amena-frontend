import { supabase } from '@amena/supabase'

/**
 * Días de la semana en español (formas canónicas del backend). El cierre compara sin
 * acentos ni mayúsculas, así que estas formas casan con la lógica del cron.
 * Ver amena-backend/docs/flujos/cierre-semanal.md.
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

const CLAVE_DIA_CIERRE = 'dia_cierre_semanal'

/**
 * Lee el día de cierre semanal configurado. Solo super_admin puede leer/escribir
 * configuracion_sistema (RLS del backend); la UI además oculta la pantalla.
 */
export async function obtenerDiaCierre(): Promise<DiaSemana> {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', CLAVE_DIA_CIERRE)
    .single()
  if (error) throw error
  return data.valor as DiaSemana
}

/** Guarda el día de cierre semanal (jsonb string). */
export async function actualizarDiaCierre(dia: DiaSemana): Promise<void> {
  const { error } = await supabase
    .from('configuracion_sistema')
    .update({ valor: dia })
    .eq('clave', CLAVE_DIA_CIERRE)
  if (error) throw error
}
