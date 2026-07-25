import { describe, expect, it } from 'vitest'
import { calcularEstadoHoy, resumenSemana } from './logica'

describe('calcularEstadoHoy', () => {
  it('ya consumió → tipo consumido con hora', () => {
    const r = calcularEstadoHoy({ tieneCuota: true, consumo: { created_at: '2026-07-17T14:32:00Z' } })
    expect(r.tipo).toBe('consumido')
    if (r.tipo === 'consumido') expect(r.hora).toMatch(/\d{2}:\d{2}/)
  })
  it('tiene cuota y no consumió → con-comida', () => {
    expect(calcularEstadoHoy({ tieneCuota: true, consumo: null })).toEqual({ tipo: 'con-comida' })
  })
  it('sin cuota → sin-comida', () => {
    expect(calcularEstadoHoy({ tieneCuota: false, consumo: null })).toEqual({ tipo: 'sin-comida' })
  })
})

describe('resumenSemana', () => {
  const dias = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'].map(
    (s) => new Date(`${s}T00:00:00`)
  )
  it('cuenta asignadas, usadas y restantes', () => {
    const cuotas = [
      { fecha: '2026-07-13', origen: 'reserva', activo: true },
      { fecha: '2026-07-14', origen: 'reserva', activo: true },
      { fecha: '2026-07-17', origen: 'reserva', activo: true },
    ]
    const consumos = [{ fecha: '2026-07-13', created_at: '' }]
    const r = resumenSemana(dias, cuotas, consumos)
    expect(r.asignadas).toBe(3)
    expect(r.usadas).toBe(1)
    expect(r.restantes).toBe(2)
    expect(r.porDia.find((d) => d.fecha === '2026-07-13')).toMatchObject({ asignada: true, usada: true })
    expect(r.porDia.find((d) => d.fecha === '2026-07-15')).toMatchObject({ asignada: false, usada: false })
  })
})
