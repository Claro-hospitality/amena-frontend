import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { aISO } from '@amena/utils'

export type Consumo = Database['public']['Tables']['consumos']['Row']

/** Colaborador para la pantalla de resultado (empresa null si RLS no la expone al mesero). */
export interface ColaboradorEscaneado {
  id: string
  nombre: string
  empresa: { nombre: string } | null
}

/** Consumo del día para la lista (hora, colaborador, empresa si es legible). */
export interface ConsumoHoy {
  id: string
  created_at: string
  colaborador: { nombre: string } | null
  empresa: { nombre: string } | null
}

/** Registra el consumo vía la RPC atómica. Devuelve la fila insertada o lanza el error de negocio. */
export async function registrarConsumo(colaboradorId: string, registradoPor: string): Promise<Consumo> {
  const { data, error } = await supabase.rpc('registrar_consumo', {
    p_colaborador_id: colaboradorId,
    p_registrado_por: registradoPor,
  })
  if (error) throw error
  return data as unknown as Consumo
}

/** Nombre (y empresa si es legible) del colaborador escaneado. */
export async function buscarColaborador(id: string): Promise<ColaboradorEscaneado | null> {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('id, nombre, empresa:empresas(nombre)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as ColaboradorEscaneado) ?? null
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

/** Consumos de hoy en orden inverso (para resolver disputas). */
export async function listarConsumosHoy(): Promise<ConsumoHoy[]> {
  const { data, error } = await supabase
    .from('consumos')
    .select('id, created_at, colaborador:colaboradores(nombre), empresa:empresas(nombre)')
    .eq('fecha', aISO(new Date()))
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as ConsumoHoy[]
}
