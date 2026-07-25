import { describe, expect, it } from 'vitest'
import { empresaSchema, politicaConsumoSchema } from './empresaSchema'

const base = {
  nombre_comercial: 'Constructora Norte',
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: 'XAXX010101000',
  precio_comida: '85',
  ciclo_facturacion: 'mensual',
}

describe('empresaSchema', () => {
  it('acepta datos válidos y parsea el precio', () => {
    const r = empresaSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.precio_comida).toBe(85)
      expect(r.data.rfc).toBe('XAXX010101000')
      expect(r.data.razon_social).toBe('Constructora Norte S.A. de C.V.')
      expect(r.data.ciclo_facturacion).toBe('mensual')
    }
  })

  it('acepta nombre comercial vacío (opcional → null)', () => {
    const r = empresaSchema.safeParse({ ...base, nombre_comercial: '  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.nombre_comercial).toBeNull()
  })

  it('exige razón social', () => {
    const r = empresaSchema.safeParse({ ...base, razon_social: '  ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.razon_social?.[0]).toMatch(/requerida/i)
  })

  it('exige precio mayor a 0', () => {
    expect(empresaSchema.safeParse({ ...base, precio_comida: '0' }).success).toBe(false)
    expect(empresaSchema.safeParse({ ...base, precio_comida: '' }).success).toBe(false)
  })

  it('parsea precio con formato de moneda', () => {
    const r = empresaSchema.safeParse({ ...base, precio_comida: '$1,234.50' })
    expect(r.success && r.data.precio_comida).toBe(1234.5)
  })

  it('exige RFC y valida su formato', () => {
    expect(empresaSchema.safeParse({ ...base, rfc: 'xaxx010101000' }).success).toBe(true) // válido (se normaliza a mayúsculas)
    expect(empresaSchema.safeParse({ ...base, rfc: '  ' }).success).toBe(false) // vacío → requerido
    expect(empresaSchema.safeParse({ ...base, rfc: 'nope' }).success).toBe(false) // inválido
  })
})

describe('politicaConsumoSchema', () => {
  it('modo reserva: acepta sin días y límite null', () => {
    const r = politicaConsumoSchema.safeParse({
      modo_consumo: 'reserva',
      dias_permitidos: [],
      limite_diario: null,
    })
    expect(r.success).toBe(true)
  })

  it('modo libre: acepta días L-V (1..5) y límite entero > 0', () => {
    const r = politicaConsumoSchema.safeParse({
      modo_consumo: 'libre',
      dias_permitidos: [1, 2, 3, 4, 5],
      limite_diario: 2,
    })
    expect(r.success).toBe(true)
  })

  it('modo libre: null (ilimitado) es válido', () => {
    const r = politicaConsumoSchema.safeParse({
      modo_consumo: 'libre',
      dias_permitidos: [1],
      limite_diario: null,
    })
    expect(r.success).toBe(true)
  })

  it('rechaza días fuera de 1..5', () => {
    expect(
      politicaConsumoSchema.safeParse({
        modo_consumo: 'libre',
        dias_permitidos: [6],
        limite_diario: 1,
      }).success
    ).toBe(false)
    expect(
      politicaConsumoSchema.safeParse({
        modo_consumo: 'libre',
        dias_permitidos: [0],
        limite_diario: 1,
      }).success
    ).toBe(false)
  })

  it('rechaza límite <= 0', () => {
    expect(
      politicaConsumoSchema.safeParse({
        modo_consumo: 'libre',
        dias_permitidos: [1],
        limite_diario: 0,
      }).success
    ).toBe(false)
  })

  it('modo libre exige al menos un día permitido', () => {
    const r = politicaConsumoSchema.safeParse({
      modo_consumo: 'libre',
      dias_permitidos: [],
      limite_diario: 2,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.dias_permitidos?.[0]).toMatch(/al menos/i)
  })
})
