import type { ConsumoSemana, CuotaSemana, ItemDeclaracion } from './api'

/** Selección de la grilla: por comensal, el conjunto de fechas marcadas. */
export type SeleccionDeclaracion = Record<number, Set<string>>

/** Convierte la selección en el payload de la RPC, omitiendo comensales sin fechas. */
export function construirPayload(seleccion: SeleccionDeclaracion): ItemDeclaracion[] {
  return Object.entries(seleccion)
    .map(([clave, fechas]) => ({ comensal_id: Number(clave), fechas: [...fechas].sort() }))
    .filter((item) => item.fechas.length > 0)
}

/** Totales para el resumen: "Declararás N comidas para M colaboradores". */
export function contarComidas(payload: ItemDeclaracion[]): { comidas: number; colaboradores: number } {
  const comidas = payload.reduce((total, item) => total + item.fechas.length, 0)
  const colaboradores = payload.filter((item) => item.fechas.length > 0).length
  return { comidas, colaboradores }
}

/** ¿El comensal ya consumió su comida esa fecha? (cuota consumida vs disponible). */
export function estaConsumida(
  comensalId: number,
  fechaISO: string,
  consumos: ConsumoSemana[]
): boolean {
  return consumos.some((c) => c.comensal_id === comensalId && c.fecha === fechaISO)
}

/** Consumo libre resumido para una fecha: comensal + cuántas comidas registró ese día. */
export interface ConsumoLibreResumen {
  comensalId: number
  nombre: string
  cantidad: number
}

/**
 * Consumos LIBRES de una fecha: los de comensales que consumieron ese día pero NO tienen
 * cuota (modo consumo libre → no hay declaración). Se agrupan por comensal con su conteo,
 * para reflejarlos aunque no exista una cuota que los represente.
 */
export function consumosLibresDelDia(
  fechaISO: string,
  cuotas: CuotaSemana[],
  consumos: ConsumoSemana[]
): ConsumoLibreResumen[] {
  const conCuota = new Set(cuotas.map((q) => q.colaborador.id))
  const porComensal = new Map<number, ConsumoLibreResumen>()
  for (const c of consumos) {
    if (c.fecha !== fechaISO || conCuota.has(c.comensal_id)) continue
    const previo = porComensal.get(c.comensal_id)
    if (previo) previo.cantidad += 1
    else
      porComensal.set(c.comensal_id, {
        comensalId: c.comensal_id,
        nombre: c.colaborador.nombre,
        cantidad: 1,
      })
  }
  return [...porComensal.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
}
