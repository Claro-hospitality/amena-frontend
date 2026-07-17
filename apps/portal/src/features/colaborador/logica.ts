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
