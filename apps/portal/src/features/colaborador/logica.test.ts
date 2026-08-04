import { describe, expect, it } from 'vitest'
import { calcularEstadoHoy, resumenSemana, resumenSemanaLibre } from './logica'

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

describe('resumenSemanaLibre', () => {
  // Semana lun 13 … vie 17 jul 2026. "Hoy" = miércoles 15 (13 y 14 pasados; 16 y 17 futuros).
  const dias = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'].map(
    (s) => new Date(`${s}T00:00:00`)
  )
  const hoy = new Date('2026-07-15T12:00:00')
  const c = (fecha: string) => ({ fecha, created_at: `${fecha}T13:00:00Z` })
  const estado = (r: ReturnType<typeof resumenSemanaLibre>, fecha: string) =>
    r.porDia.find((d) => d.fecha === fecha)?.estado

  it('límite 1/día, L-V: completa hoy y días con consumo, "faltó" los pasados sin consumir', () => {
    // Consumió lunes y miércoles(hoy); martes lo dejó pasar.
    const r = resumenSemanaLibre(dias, [c('2026-07-13'), c('2026-07-15')], [1, 2, 3, 4, 5], 1, hoy)
    expect(r.esperadas).toBe(5)
    expect(r.consumidas).toBe(2)
    expect(r.faltantes).toBe(1) // solo el martes (día pasado sin consumo)
    expect(r.diasFalto).toBe(1)
    expect(estado(r, '2026-07-13')).toBe('completa')
    expect(estado(r, '2026-07-14')).toBe('falto')
    expect(estado(r, '2026-07-15')).toBe('completa')
    expect(estado(r, '2026-07-16')).toBe('pendiente')
    expect(estado(r, '2026-07-17')).toBe('pendiente')
  })

  it('límite 2/día: distingue parcial (pasado suma faltante, hoy no)', () => {
    // Lunes 1 de 2 (parcial pasado); miércoles(hoy) 1 de 2 (parcial, aún puede); martes 0.
    const r = resumenSemanaLibre(dias, [c('2026-07-13'), c('2026-07-15')], [1, 2, 3, 4, 5], 2, hoy)
    expect(r.esperadas).toBe(10)
    expect(r.consumidas).toBe(2)
    // lunes: falta 1; martes: falta 2; miércoles(hoy): no cuenta como faltante.
    expect(r.faltantes).toBe(3)
    expect(r.diasFalto).toBe(1) // solo el martes quedó en 0
    expect(estado(r, '2026-07-13')).toBe('parcial')
    expect(estado(r, '2026-07-14')).toBe('falto')
    expect(estado(r, '2026-07-15')).toBe('parcial')
  })

  it('ilimitado: no calcula esperadas/faltantes; marca días no permitidos como no-aplica', () => {
    // Días permitidos solo L, X, V. Consumió el lunes (2 veces).
    const r = resumenSemanaLibre(dias, [c('2026-07-13'), c('2026-07-13')], [1, 3, 5], null, hoy)
    expect(r.ilimitado).toBe(true)
    expect(r.esperadas).toBe(0)
    expect(r.faltantes).toBe(0)
    expect(r.diasPermitidos).toBe(3)
    expect(r.consumidas).toBe(2)
    expect(estado(r, '2026-07-13')).toBe('completa')
    expect(estado(r, '2026-07-14')).toBe('no-aplica') // martes no permitido
    expect(estado(r, '2026-07-15')).toBe('pendiente') // miércoles hoy, sin consumo
    expect(estado(r, '2026-07-16')).toBe('no-aplica') // jueves no permitido
    expect(estado(r, '2026-07-17')).toBe('pendiente') // viernes futuro
  })
})
