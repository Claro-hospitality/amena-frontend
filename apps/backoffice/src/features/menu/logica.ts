import { lunesDeSemana } from '@amena/utils'
import type { Platillo } from '../platillos/api'

/** Platillos activos que aún NO están asignados ese día (respeta unique(fecha, platillo_id)). */
export function platillosDisponibles(activos: Platillo[], idsAsignados: number[]): Platillo[] {
  const asignados = new Set(idsAsignados)
  return activos.filter((p) => !asignados.has(p.id))
}

/**
 * Los lunes de las semanas que componen el mes de `fechaEnMes`: desde el lunes de la
 * semana que contiene el día 1 hasta el último lunes cuyo lun–vie toca el mes. Se usa
 * para apilar las semanas completas en la vista "Mes".
 */
export function semanasDelMes(fechaEnMes: Date): Date[] {
  const primero = new Date(fechaEnMes.getFullYear(), fechaEnMes.getMonth(), 1)
  const ultimo = new Date(fechaEnMes.getFullYear(), fechaEnMes.getMonth() + 1, 0)
  const semanas: Date[] = []
  const lunes = lunesDeSemana(primero)
  while (lunes <= ultimo) {
    semanas.push(new Date(lunes))
    lunes.setDate(lunes.getDate() + 7)
  }
  return semanas
}
