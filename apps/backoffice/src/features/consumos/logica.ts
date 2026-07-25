import { aISO, lunesDeSemana } from '@amena/utils'
import type { OrigenConsumo } from './api'

/** Un preset de rango de fechas para el filtro. */
export interface RangoPreset {
  clave: 'hoy' | 'semana' | 'mes'
  etiqueta: string
  desde: string
  hasta: string
}

/**
 * Presets de rango calculados a partir de `hoy` (inyectable para tests):
 * Hoy, Esta semana (lunes→hoy) y Este mes (día 1→hoy). Fechas en 'YYYY-MM-DD'.
 */
export function presetsRango(hoy: Date): RangoPreset[] {
  const hoyISO = aISO(hoy)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  return [
    { clave: 'hoy', etiqueta: 'Hoy', desde: hoyISO, hasta: hoyISO },
    { clave: 'semana', etiqueta: 'Esta semana', desde: aISO(lunesDeSemana(hoy)), hasta: hoyISO },
    { clave: 'mes', etiqueta: 'Este mes', desde: aISO(inicioMes), hasta: hoyISO },
  ]
}

/** Presentación del badge de origen: etiqueta legible + variante del componente Badge. */
export interface BadgeOrigen {
  etiqueta: string
  variante: 'default' | 'secondary' | 'outline'
}

/** Mapea el origen derivado del consumo a su etiqueta y variante de badge (sin color hardcodeado). */
export function badgeOrigen(origen: OrigenConsumo | string): BadgeOrigen {
  switch (origen) {
    case 'reserva':
      return { etiqueta: 'Reservada', variante: 'secondary' }
    case 'extra':
      return { etiqueta: 'Extra', variante: 'outline' }
    case 'libre':
      return { etiqueta: 'Libre', variante: 'default' }
    default:
      return { etiqueta: origen, variante: 'outline' }
  }
}
