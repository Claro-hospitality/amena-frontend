import { aISO, horaCorta } from '@amena/utils'
import type { EstadoHoy, MiConsumo, MiCuota } from './api'

export type ResultadoHoy =
  | { tipo: 'consumido'; hora: string }
  | { tipo: 'con-comida' }
  | { tipo: 'sin-comida' }

/** Deriva el estado de la comida de hoy. Si ya consumió, gana ese estado (con la hora). */
export function calcularEstadoHoy(estado: EstadoHoy): ResultadoHoy {
  if (estado.consumo) {
    return { tipo: 'consumido', hora: horaCorta(new Date(estado.consumo.created_at)) }
  }
  if (estado.tieneCuota) return { tipo: 'con-comida' }
  return { tipo: 'sin-comida' }
}

export interface DiaSemana {
  fecha: string
  asignada: boolean
  usada: boolean
}
export interface ResumenSemana {
  asignadas: number
  usadas: number
  restantes: number
  porDia: DiaSemana[]
}

/** Resumen de la semana: qué días tiene cuota, cuáles ya usó, cuántas le quedan. */
export function resumenSemana(
  dias: Date[],
  cuotas: MiCuota[],
  consumos: MiConsumo[]
): ResumenSemana {
  const conCuota = new Set(cuotas.map((c) => c.fecha))
  const consumidas = new Set(consumos.map((c) => c.fecha))
  const porDia = dias.map((d) => {
    const fecha = aISO(d)
    return { fecha, asignada: conCuota.has(fecha), usada: conCuota.has(fecha) && consumidas.has(fecha) }
  })
  const asignadas = porDia.filter((d) => d.asignada).length
  const usadas = porDia.filter((d) => d.usada).length
  return { asignadas, usadas, restantes: asignadas - usadas, porDia }
}

export interface DesgloseSemana {
  total: number
  /** Consumos de una comida reservada (cuota origen 'reserva'). */
  programado: number
  /** Consumos de una comida extra (cuota origen 'extra'). */
  extra: number
  /** Consumos sin cuota ese día (consumo libre). */
  libre: number
}

/**
 * Desglosa los consumos de la semana por tipo. El origen de cada consumo se deriva de la cuota
 * del mismo día: 'reserva' → programado, 'extra' → extra, sin cuota → libre.
 */
export function desgloseSemana(
  dias: Date[],
  cuotas: MiCuota[],
  consumos: MiConsumo[]
): DesgloseSemana {
  const semana = new Set(dias.map(aISO))
  const origenPorFecha = new Map(cuotas.map((c) => [c.fecha, c.origen]))
  let programado = 0
  let extra = 0
  let libre = 0
  for (const c of consumos) {
    if (!semana.has(c.fecha)) continue
    const origen = origenPorFecha.get(c.fecha)
    if (origen === 'extra') extra++
    else if (origen) programado++
    else libre++
  }
  return { total: programado + extra + libre, programado, extra, libre }
}
