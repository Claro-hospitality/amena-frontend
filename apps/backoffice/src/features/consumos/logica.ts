import { aISO } from '@amena/utils'
import type { ConsumoRow } from './api'

/** Nombre a mostrar de un consumo (fallback si falta la identidad). */
export function nombreComensal(c: ConsumoRow): string {
  return c.comensal?.usuario?.nombre ?? 'Sin nombre'
}

export interface ResumenConsumos {
  /** Total de comidas registradas en el rango. */
  total: number
  /** Comensales distintos que comieron. */
  comensales: number
  /** Gasto total = suma del precio de la comida de cada consumo. */
  gasto: number
}

/** Cálculos del rango: total de comidas, comensales distintos y gasto acumulado. */
export function resumenConsumos(rows: ConsumoRow[]): ResumenConsumos {
  const comensales = new Set<number>()
  let gasto = 0
  for (const c of rows) {
    if (c.comensal?.id != null) comensales.add(c.comensal.id)
    gasto += c.empresa?.precio_comida ?? 0
  }
  return { total: rows.length, comensales: comensales.size, gasto }
}

export interface TopComensal {
  comensalId: number
  nombre: string
  comidas: number
}

/**
 * Comensales que más comieron en el rango (para la gráfica), de mayor a menor.
 * Agrupa por comensal; empata desempata por nombre. Devuelve a lo más `limite`.
 */
export function topComensales(rows: ConsumoRow[], limite = 10): TopComensal[] {
  const porComensal = new Map<number, TopComensal>()
  for (const c of rows) {
    const id = c.comensal?.id
    if (id == null) continue
    const actual = porComensal.get(id)
    if (actual) actual.comidas += 1
    else porComensal.set(id, { comensalId: id, nombre: nombreComensal(c), comidas: 1 })
  }
  return [...porComensal.values()]
    .sort((a, b) => b.comidas - a.comidas || a.nombre.localeCompare(b.nombre))
    .slice(0, limite)
}

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
