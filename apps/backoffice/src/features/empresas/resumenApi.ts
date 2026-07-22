import { supabase } from '@amena/supabase'
import type { CicloFacturacion } from './api'

/** Métricas de la semana en curso (aún sin cierre). */
export interface EnCurso {
  comprometidas: number
  extras: number
  consumidas: number
  faltan: number
  gasto: number
}

/** Resumen operativo de una empresa (RPC `resumen_empresa`). */
export interface ResumenEmpresa {
  semana_inicio: string
  precio_comida: number
  ciclo_facturacion: CicloFacturacion
  en_curso: EnCurso
  gasto_periodo: number
  gasto_historico_total: number
  colaboradores_activos: number
}

/** Llama al RPC de resumen. RLS/guard del backend restringe a super_admin/finanzas. */
export async function obtenerResumenEmpresa(empresaId: number): Promise<ResumenEmpresa> {
  const { data, error } = await supabase.rpc('resumen_empresa', { p_empresa_id: empresaId })
  if (error) throw error
  return data as unknown as ResumenEmpresa
}
