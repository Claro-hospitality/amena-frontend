import { describe, expect, it } from 'vitest'
import { describirClima, emojiPorHora, primerNombre, saludoPorHora } from './logica'

describe('saludoPorHora', () => {
  it('mañana, tarde y noche', () => {
    expect(saludoPorHora(8)).toBe('Buenos días')
    expect(saludoPorHora(11)).toBe('Buenos días')
    expect(saludoPorHora(12)).toBe('Buenas tardes')
    expect(saludoPorHora(18)).toBe('Buenas tardes')
    expect(saludoPorHora(19)).toBe('Buenas noches')
    expect(saludoPorHora(3)).toBe('Buenas noches')
  })
})

describe('emojiPorHora', () => {
  it('sol de día, luna de noche', () => {
    expect(emojiPorHora(10)).toBe('☀️')
    expect(emojiPorHora(22)).toBe('🌙')
    expect(emojiPorHora(4)).toBe('🌙')
  })
})

describe('primerNombre', () => {
  it('toma solo el primer nombre', () => {
    expect(primerNombre('Cristian Soria López')).toBe('Cristian')
    expect(primerNombre('  Ana  ')).toBe('Ana')
    expect(primerNombre(null)).toBe('')
    expect(primerNombre(undefined)).toBe('')
  })
})

describe('describirClima', () => {
  it('mapea códigos WMO conocidos', () => {
    expect(describirClima(0).texto).toBe('Despejado')
    expect(describirClima(3).texto).toBe('Nublado')
    expect(describirClima(63).texto).toBe('Lluvia')
    expect(describirClima(95).texto).toBe('Tormenta')
  })
  it('fallback para códigos desconocidos', () => {
    expect(describirClima(999).texto).toBe('Clima actual')
  })
})
