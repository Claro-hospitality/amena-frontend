import { aISO, esFechaPasada, horaCorta } from '@amena/utils'
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

/** Estado de un día en modo libre respecto a la política de la empresa. */
export type EstadoDiaLibre =
  | 'completa' // alcanzó el límite del día (o consumió al menos una si es ilimitado)
  | 'parcial' // consumió algunas pero no llegó al límite (solo con límite finito ≥ 2)
  | 'pendiente' // día permitido de hoy o futuro, aún sin consumir
  | 'falto' // día permitido ya vencido sin alcanzar el límite
  | 'no-aplica' // día no permitido por la política

export interface DiaLibre {
  fecha: string
  permitido: boolean
  /** Consumos reales del comensal ese día. */
  consumidas: number
  estado: EstadoDiaLibre
}

export interface ResumenLibre {
  ilimitado: boolean
  /** # de días permitidos (hábiles) de la semana. */
  diasPermitidos: number
  /** Comidas esperadas en la semana: díasPermitidos × límite. 0 si ilimitado. */
  esperadas: number
  /** Comidas consumidas en días permitidos (topadas al límite diario si es finito). */
  consumidas: number
  /** Comidas de días permitidos YA VENCIDOS sin consumir (solo con límite finito). */
  faltantes: number
  /** # de días permitidos ya vencidos sin ningún consumo. */
  diasFalto: number
  porDia: DiaLibre[]
}

/**
 * Resumen semanal para comensales en modo de CONSUMO LIBRE (sin cuotas): compara los consumos
 * de la semana contra la política de la empresa (días permitidos × límite diario). Marca cada
 * día como completo, parcial, pendiente (hoy/futuro) o "faltó" (día permitido ya vencido sin
 * alcanzar el límite). `esperadas`/`faltantes` solo tienen sentido con límite finito; con límite
 * ilimitado (`limiteDiario == null`) quedan en 0 y cada día permitido con ≥1 consumo cuenta como
 * completo. Los `dias` deben ser los hábiles (lun-vie); `diasPermitidos` son ISO dow (1=lun…5=vie),
 * que para días hábiles coinciden con `Date.getDay()`.
 */
export function resumenSemanaLibre(
  dias: Date[],
  consumos: MiConsumo[],
  diasPermitidos: number[],
  limiteDiario: number | null,
  hoy: Date = new Date()
): ResumenLibre {
  const permitidos = new Set(diasPermitidos)
  const conteoPorFecha = new Map<string, number>()
  for (const c of consumos) conteoPorFecha.set(c.fecha, (conteoPorFecha.get(c.fecha) ?? 0) + 1)

  const ilimitado = limiteDiario == null
  let diasPermitidosCount = 0
  let esperadas = 0
  let consumidas = 0
  let faltantes = 0
  let diasFalto = 0

  const porDia: DiaLibre[] = dias.map((d) => {
    const fecha = aISO(d)
    const n = conteoPorFecha.get(fecha) ?? 0
    if (!permitidos.has(d.getDay())) {
      return { fecha, permitido: false, consumidas: n, estado: 'no-aplica' as const }
    }
    diasPermitidosCount++
    const pasado = esFechaPasada(d, hoy)

    let estado: EstadoDiaLibre
    if (ilimitado) {
      consumidas += n
      if (n > 0) estado = 'completa'
      else if (pasado) {
        estado = 'falto'
        diasFalto++
      } else estado = 'pendiente'
    } else {
      const limite = limiteDiario
      esperadas += limite
      consumidas += Math.min(n, limite)
      if (n >= limite) estado = 'completa'
      else if (n > 0) {
        estado = 'parcial'
        if (pasado) faltantes += limite - n
      } else if (pasado) {
        estado = 'falto'
        faltantes += limite
        diasFalto++
      } else estado = 'pendiente'
    }
    return { fecha, permitido: true, consumidas: n, estado }
  })

  return { ilimitado, diasPermitidos: diasPermitidosCount, esperadas, consumidas, faltantes, diasFalto, porDia }
}
