import { describe, expect, it } from 'vitest'
import { formatearMoneda, parsearMoneda } from './moneda'

describe('formatearMoneda', () => {
  it('formatea como moneda MXN', () => {
    expect(formatearMoneda(85)).toBe('$85.00')
    expect(formatearMoneda(1234.5)).toBe('$1,234.50')
    expect(formatearMoneda(0)).toBe('$0.00')
  })
})

describe('parsearMoneda', () => {
  it('extrae el número de un string con formato', () => {
    expect(parsearMoneda('$1,234.50')).toBe(1234.5)
    expect(parsearMoneda('85')).toBe(85)
  })
  it('devuelve NaN cuando no hay dígitos', () => {
    expect(parsearMoneda('')).toBeNaN()
    expect(parsearMoneda('abc')).toBeNaN()
  })
})
