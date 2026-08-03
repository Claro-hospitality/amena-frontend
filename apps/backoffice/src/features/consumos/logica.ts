import { aISO, deISO, lunesDeSemana } from '@amena/utils'
import type { OrigenConsumo } from './api'

/** Granularidad del filtro de fechas: un día, una semana (L–D) o un mes completos. */
export type Granularidad = 'dia' | 'semana' | 'mes'

/** Rango [desde, hasta] en 'YYYY-MM-DD'. */
export interface RangoConsulta {
  desde: string
  hasta: string
}

/**
 * Rango de fechas para una fecha de referencia según la granularidad. Permite ver un día
 * cualquiera, cualquier semana (lunes→domingo de esa fecha) o cualquier mes (día 1→último).
 */
export function rangoPorGranularidad(fecha: Date, g: Granularidad): RangoConsulta {
  if (g === 'dia') {
    const iso = aISO(fecha)
    return { desde: iso, hasta: iso }
  }
  if (g === 'semana') {
    const lunes = lunesDeSemana(fecha)
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    return { desde: aISO(lunes), hasta: aISO(domingo) }
  }
  const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const ultimo = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
  return { desde: aISO(primero), hasta: aISO(ultimo) }
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Etiqueta legible del rango elegido (para el botón del filtro). */
export function etiquetaRango(fecha: Date, g: Granularidad): string {
  if (g === 'dia') {
    return capitalizar(
      fecha.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    )
  }
  if (g === 'mes') {
    return capitalizar(fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }))
  }
  const { desde, hasta } = rangoPorGranularidad(fecha, 'semana')
  const d = deISO(desde).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  const h = deISO(hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${d} – ${h}`
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
