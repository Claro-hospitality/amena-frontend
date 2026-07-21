import { describe, expect, it } from 'vitest'
import type { ConsumoSemana } from './api'
import { construirPayload, contarComidas, estaConsumida, type SeleccionDeclaracion } from './logica'

describe('construirPayload', () => {
  it('convierte la selección en array y omite comensales sin fechas', () => {
    const seleccion: SeleccionDeclaracion = {
      1: new Set(['2026-07-20', '2026-07-21']),
      2: new Set(),
      3: new Set(['2026-07-20']),
    }
    const payload = construirPayload(seleccion)
    expect(payload).toEqual([
      { comensal_id: 1, fechas: ['2026-07-20', '2026-07-21'] },
      { comensal_id: 3, fechas: ['2026-07-20'] },
    ])
  })
})

describe('contarComidas', () => {
  it('suma comidas y cuenta comensales', () => {
    // 9 comensales; total 43 comidas
    const payload = [
      ...Array.from({ length: 8 }, (_, i) => ({
        comensal_id: i + 1,
        fechas: ['a', 'b', 'c', 'd', 'e'],
      })),
      { comensal_id: 9, fechas: ['a', 'b', 'c'] },
    ]
    expect(contarComidas(payload)).toEqual({ comidas: 43, colaboradores: 9 })
  })

  it('vacío = 0 y 0', () => {
    expect(contarComidas([])).toEqual({ comidas: 0, colaboradores: 0 })
  })
})

describe('estaConsumida', () => {
  const consumos: ConsumoSemana[] = [{ comensal_id: 1, fecha: '2026-07-20' }]
  it('true si hay consumo del comensal esa fecha', () => {
    expect(estaConsumida(1, '2026-07-20', consumos)).toBe(true)
  })
  it('false si no coincide comensal o fecha', () => {
    expect(estaConsumida(1, '2026-07-21', consumos)).toBe(false)
    expect(estaConsumida(2, '2026-07-20', consumos)).toBe(false)
  })
})
