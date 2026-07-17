import { describe, expect, it } from 'vitest'
import {
  aISO,
  deISO,
  diasHabiles,
  esFechaPasada,
  etiquetaDia,
  etiquetaDiaCorta,
  horaCorta,
  lunesDeSemana,
  rangoSemanaLegible,
} from './semana'

// 2026-07-15 es miércoles; su semana va del lunes 13 al viernes 17.
const miercoles = new Date(2026, 6, 15)

describe('lunesDeSemana', () => {
  it('devuelve el lunes de la semana', () => {
    const lunes = lunesDeSemana(miercoles)
    expect(lunes.getDay()).toBe(1)
    expect(aISO(lunes)).toBe('2026-07-13')
  })
})

describe('diasHabiles', () => {
  it('devuelve lunes a viernes (5 días)', () => {
    const dias = diasHabiles(lunesDeSemana(miercoles)).map(aISO)
    expect(dias).toEqual(['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'])
  })
})

describe('rangoSemanaLegible', () => {
  it('incluye los días del rango y el año', () => {
    const rango = rangoSemanaLegible(lunesDeSemana(miercoles))
    expect(rango).toContain('13')
    expect(rango).toContain('17')
    expect(rango).toContain('2026')
  })
})

describe('etiquetaDia', () => {
  it('es el nombre del día y el número', () => {
    expect(etiquetaDia(new Date(2026, 6, 13))).toMatch(/lunes 13/i)
  })
})

describe('etiquetaDiaCorta', () => {
  it('es el nombre corto del día y el número', () => {
    expect(etiquetaDiaCorta(new Date(2026, 6, 13))).toMatch(/lun.*13/i)
  })
})

describe('esFechaPasada', () => {
  const hoy = new Date(2026, 6, 15)
  it('true para días anteriores a hoy', () => {
    expect(esFechaPasada(new Date(2026, 6, 10), hoy)).toBe(true)
  })
  it('false para hoy y futuros', () => {
    expect(esFechaPasada(new Date(2026, 6, 15), hoy)).toBe(false)
    expect(esFechaPasada(new Date(2026, 6, 20), hoy)).toBe(false)
  })
})

describe('aISO / deISO', () => {
  it('van y vuelven', () => {
    expect(aISO(deISO('2026-07-13'))).toBe('2026-07-13')
  })
})

describe('horaCorta', () => {
  it('formatea HH:mm', () => {
    expect(horaCorta(new Date(2026, 6, 13, 9, 5))).toBe('09:05')
    expect(horaCorta(new Date(2026, 6, 13, 14, 30))).toBe('14:30')
  })
})
