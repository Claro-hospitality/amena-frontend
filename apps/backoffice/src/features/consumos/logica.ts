import { aISO } from '@amena/utils'
import type { OrigenConsumo } from './api'

/** Un preset de rango de fechas para el filtro. */
export interface RangoPreset {
  clave: 'hoy' | 'ayer' | 'semana' | 'mes'
  etiqueta: string
  desde: string
  hasta: string
}

/**
 * Presets de rango calculados a partir de `hoy` (inyectable para tests):
 * Hoy, Ayer, Últimos 7 días y Este mes. Fechas en 'YYYY-MM-DD'.
 */
export function presetsRango(hoy: Date): RangoPreset[] {
  const hoyISO = aISO(hoy)
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  const ayerISO = aISO(ayer)
  const hace7 = new Date(hoy)
  hace7.setDate(hace7.getDate() - 6)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  return [
    { clave: 'hoy', etiqueta: 'Hoy', desde: hoyISO, hasta: hoyISO },
    { clave: 'ayer', etiqueta: 'Ayer', desde: ayerISO, hasta: ayerISO },
    { clave: 'semana', etiqueta: 'Últimos 7 días', desde: aISO(hace7), hasta: hoyISO },
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
    case 'declaracion':
      return { etiqueta: 'Declarada', variante: 'secondary' }
    case 'extra':
      return { etiqueta: 'Extra', variante: 'outline' }
    case 'libre':
      return { etiqueta: 'Libre', variante: 'default' }
    default:
      return { etiqueta: origen, variante: 'outline' }
  }
}
