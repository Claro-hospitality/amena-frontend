import { supabase } from '@amena/supabase'

/**
 * Un consumo (comida registrada) enriquecido para el reporte: hora exacta, día, comensal
 * (nombre + id) y empresa (nombre + precio de la comida, para el cálculo del gasto).
 * La RLS de `consumos` ya limita la lectura por rol: super_admin/finanzas/consulta ven todos.
 */
export interface ConsumoRow {
  id: number
  created_at: string
  fecha: string
  comensal: { id: number; usuario: { nombre: string } | null } | null
  empresa: { nombre: string | null; precio_comida: number } | null
}

/**
 * Consumos en el rango [desdeISO, hastaISO] (ambos inclusive, formato 'YYYY-MM-DD'),
 * más recientes primero. Consulta directa: la RLS permite a super_admin/finanzas/consulta
 * leer todos los consumos, así que no hace falta un RPC.
 */
export async function listarConsumos(desdeISO: string, hastaISO: string): Promise<ConsumoRow[]> {
  const { data, error } = await supabase
    .from('consumos')
    .select(
      'id, created_at, fecha, comensal:comensales(id, usuario:usuarios_portal_empresarial(nombre)), empresa:empresas(nombre:nombre_comercial, precio_comida)'
    )
    .gte('fecha', desdeISO)
    .lte('fecha', hastaISO)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as ConsumoRow[]
}
