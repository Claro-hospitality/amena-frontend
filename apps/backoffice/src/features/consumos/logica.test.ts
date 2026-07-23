import { describe, expect, it } from 'vitest'
import type { ConsumoRow } from './api'
import { presetsRango, resumenConsumos, topComensales } from './logica'

const row = (id: number, comensalId: number, nombre: string, precio: number): ConsumoRow => ({
  id,
  created_at: '2026-07-24T12:00:00Z',
  fecha: '2026-07-24',
  comensal: { id: comensalId, usuario: { nombre } },
  empresa: { nombre: 'Acme', precio_comida: precio },
})

const rows = [row(1, 10, 'Juan', 100), row(2, 10, 'Juan', 100), row(3, 20, 'Ana', 80)]

describe('resumenConsumos', () => {
  it('cuenta comidas, comensales distintos y suma el gasto', () => {
    expect(resumenConsumos(rows)).toEqual({ total: 3, comensales: 2, gasto: 280 })
  })

  it('rango vacío → ceros', () => {
    expect(resumenConsumos([])).toEqual({ total: 0, comensales: 0, gasto: 0 })
  })
})

describe('topComensales', () => {
  it('agrupa por comensal y ordena por comidas desc', () => {
    expect(topComensales(rows)).toEqual([
      { comensalId: 10, nombre: 'Juan', comidas: 2 },
      { comensalId: 20, nombre: 'Ana', comidas: 1 },
    ])
  })

  it('respeta el límite', () => {
    expect(topComensales(rows, 1)).toHaveLength(1)
    expect(topComensales(rows, 1)[0].nombre).toBe('Juan')
  })
})

describe('presetsRango', () => {
  it('calcula Hoy, Ayer, Últimos 7 días y Este mes', () => {
    const p = presetsRango(new Date(2026, 6, 24)) // 24 jul 2026 (local)
    expect(p.map((x) => x.clave)).toEqual(['hoy', 'ayer', 'semana', 'mes'])
    expect(p[0]).toMatchObject({ desde: '2026-07-24', hasta: '2026-07-24' })
    expect(p[1]).toMatchObject({ desde: '2026-07-23', hasta: '2026-07-23' })
    expect(p[2]).toMatchObject({ desde: '2026-07-18', hasta: '2026-07-24' })
    expect(p[3]).toMatchObject({ desde: '2026-07-01', hasta: '2026-07-24' })
  })
})
