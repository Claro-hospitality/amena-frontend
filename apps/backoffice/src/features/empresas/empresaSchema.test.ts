import { describe, expect, it } from 'vitest'
import { empresaSchema } from './empresaSchema'

const base = {
  nombre_comercial: 'Constructora Norte',
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: '',
  precio_comida: '85',
  ciclo_facturacion: 'mensual',
}

describe('empresaSchema', () => {
  it('acepta datos válidos y parsea el precio', () => {
    const r = empresaSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.precio_comida).toBe(85)
      expect(r.data.rfc).toBeNull()
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

  it('valida RFC solo si se llena', () => {
    expect(empresaSchema.safeParse({ ...base, rfc: 'XAXX010101000' }).success).toBe(true) // válido
    expect(empresaSchema.safeParse({ ...base, rfc: 'nope' }).success).toBe(false) // inválido
  })
})
