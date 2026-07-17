import type { ConsumoSemana, ItemDeclaracion } from './api'

/** Selección de la grilla: por colaborador, el conjunto de fechas marcadas. */
export type SeleccionDeclaracion = Record<string, Set<string>>

/** Convierte la selección en el payload de la RPC, omitiendo colaboradores sin fechas. */
export function construirPayload(seleccion: SeleccionDeclaracion): ItemDeclaracion[] {
  return Object.entries(seleccion)
    .map(([colaborador_id, fechas]) => ({ colaborador_id, fechas: [...fechas].sort() }))
    .filter((item) => item.fechas.length > 0)
}

/** Totales para el resumen: "Declararás N comidas para M colaboradores". */
export function contarComidas(payload: ItemDeclaracion[]): { comidas: number; colaboradores: number } {
  const comidas = payload.reduce((total, item) => total + item.fechas.length, 0)
  const colaboradores = payload.filter((item) => item.fechas.length > 0).length
  return { comidas, colaboradores }
}

/** ¿El colaborador ya consumió su comida esa fecha? (cuota consumida vs disponible). */
export function estaConsumida(
  colaboradorId: string,
  fechaISO: string,
  consumos: ConsumoSemana[]
): boolean {
  return consumos.some((c) => c.colaborador_id === colaboradorId && c.fecha === fechaISO)
}
