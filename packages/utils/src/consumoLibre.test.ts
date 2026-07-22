import { describe, expect, it } from 'vitest'
import {
  formatearDiasPermitidos,
  formatearLimiteDiario,
  ordinalComida,
  resumenPoliticaConsumo,
} from './consumoLibre'

describe('formatearDiasPermitidos', () => {
  it('los 5 hábiles se leen como "L-V"', () => {
    expect(formatearDiasPermitidos([1, 2, 3, 4, 5])).toBe('L-V')
  })
  it('ordena y quita duplicados', () => {
    expect(formatearDiasPermitidos([3, 1, 1, 5])).toBe('L, X, V')
  })
  it('sin días → guion', () => {
    expect(formatearDiasPermitidos([])).toBe('—')
  })
  it('ignora valores fuera de 1..5', () => {
    expect(formatearDiasPermitidos([6, 7, 2])).toBe('M')
  })
})

describe('formatearLimiteDiario', () => {
  it('null es ilimitado', () => {
    expect(formatearLimiteDiario(null)).toBe('ilimitado')
  })
  it('un número se muestra por día', () => {
    expect(formatearLimiteDiario(2)).toBe('2/día')
  })
})

describe('resumenPoliticaConsumo', () => {
  it('días + límite', () => {
    expect(resumenPoliticaConsumo([1, 2, 3, 4, 5], 2)).toBe('L-V, máx 2/día')
  })
  it('límite ilimitado', () => {
    expect(resumenPoliticaConsumo([1, 3], null)).toBe('L, X, ilimitado')
  })
  it('sin días', () => {
    expect(resumenPoliticaConsumo([], 2)).toBe('Sin días permitidos')
  })
})

describe('ordinalComida', () => {
  it('formatea ordinales simples', () => {
    expect(ordinalComida(1)).toBe('1ª')
    expect(ordinalComida(3)).toBe('3ª')
  })
})
