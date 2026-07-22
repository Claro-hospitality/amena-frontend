import { supabase } from '@amena/supabase'
import { aISO, deISO, diasHabiles } from '@amena/utils'
import type { Platillo } from '../platillos/api'

export interface MenuDiaConPlatillo {
  id: number
  fecha: string
  platillo: Platillo
}

/** Menú de la semana (lun–vie desde `lunesISO`): asignaciones activas con su platillo. */
export async function listarMenuSemana(lunesISO: string): Promise<MenuDiaConPlatillo[]> {
  const dias = diasHabiles(deISO(lunesISO)).map(aISO)
  const { data, error } = await supabase
    .from('menu_dias')
    .select('id, fecha, platillo:platillos(*)')
    .gte('fecha', dias[0])
    .lte('fecha', dias[dias.length - 1])
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as unknown as MenuDiaConPlatillo[]
}

/** Menú de un rango de fechas [desdeISO, hastaISO] (para la vista por mes). */
export async function listarMenuRango(
  desdeISO: string,
  hastaISO: string
): Promise<MenuDiaConPlatillo[]> {
  const { data, error } = await supabase
    .from('menu_dias')
    .select('id, fecha, platillo:platillos(*)')
    .gte('fecha', desdeISO)
    .lte('fecha', hastaISO)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as unknown as MenuDiaConPlatillo[]
}

/** Agrega (o reactiva) un platillo a un día. Respeta unique(fecha, platillo_id) vía upsert. */
export async function agregarPlatilloADia(fecha: string, platillo_id: number): Promise<void> {
  const { error } = await supabase
    .from('menu_dias')
    .upsert({ fecha, platillo_id, activo: true }, { onConflict: 'fecha,platillo_id' })
  if (error) throw error
}

/** Quita un platillo de un día — baja lógica (conserva historia). */
export async function quitarMenuDia(id: number): Promise<void> {
  const { error } = await supabase.from('menu_dias').update({ activo: false }).eq('id', id)
  if (error) throw error
}

/** Copia los platillos activos de la semana anterior a la semana actual (misma posición + 7 días). */
export async function copiarSemanaAnterior(lunesISO: string): Promise<number> {
  const lunesPrev = deISO(lunesISO)
  lunesPrev.setDate(lunesPrev.getDate() - 7)
  const previa = await listarMenuSemana(aISO(lunesPrev))
  if (previa.length === 0) return 0

  const filas = previa.map((m) => {
    const fecha = deISO(m.fecha)
    fecha.setDate(fecha.getDate() + 7)
    return { fecha: aISO(fecha), platillo_id: m.platillo.id, activo: true }
  })
  const { error } = await supabase
    .from('menu_dias')
    .upsert(filas, { onConflict: 'fecha,platillo_id' })
  if (error) throw error
  return filas.length
}
