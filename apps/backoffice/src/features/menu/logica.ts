import type { Platillo } from '../platillos/api'

/** Platillos activos que aún NO están asignados ese día (respeta unique(fecha, platillo_id)). */
export function platillosDisponibles(activos: Platillo[], idsAsignados: number[]): Platillo[] {
  const asignados = new Set(idsAsignados)
  return activos.filter((p) => !asignados.has(p.id))
}
