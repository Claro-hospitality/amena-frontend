import { describe, expect, it } from 'vitest'
import type { ConsumoSemana } from './api'
import { construirPayload, contarComidas, estaConsumida, type SeleccionDeclaracion } from './logica'

describe('construirPayload', () => {
  it('convierte la selección en array y omite colaboradores sin fechas', () => {
    const seleccion: SeleccionDeclaracion = {
      a: new Set(['2026-07-20', '2026-07-21']),
      b: new Set(),
      c: new Set(['2026-07-20']),
    }
    const payload = construirPayload(seleccion)
    expect(payload).toEqual([
      { colaborador_id: 'a', fechas: ['2026-07-20', '2026-07-21'] },
      { colaborador_id: 'c', fechas: ['2026-07-20'] },
    ])
  })
})

describe('contarComidas', () => {
  it('suma comidas y cuenta colaboradores', () => {
    // 9 colaboradores; total 43 comidas
    const payload = [
      ...Array.from({ length: 8 }, (_, i) => ({
        colaborador_id: `c${i}`,
        fechas: ['a', 'b', 'c', 'd', 'e'],
      })),
      { colaborador_id: 'c8', fechas: ['a', 'b', 'c'] },
    ]
    expect(contarComidas(payload)).toEqual({ comidas: 43, colaboradores: 9 })
  })

  it('vacío = 0 y 0', () => {
    expect(contarComidas([])).toEqual({ comidas: 0, colaboradores: 0 })
  })
})

describe('estaConsumida', () => {
  const consumos: ConsumoSemana[] = [{ colaborador_id: 'a', fecha: '2026-07-20' }]
  it('true si hay consumo del colaborador esa fecha', () => {
    expect(estaConsumida('a', '2026-07-20', consumos)).toBe(true)
  })
  it('false si no coincide colaborador o fecha', () => {
    expect(estaConsumida('a', '2026-07-21', consumos)).toBe(false)
    expect(estaConsumida('b', '2026-07-20', consumos)).toBe(false)
  })
})
