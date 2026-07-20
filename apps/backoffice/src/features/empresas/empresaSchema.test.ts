import { describe, expect, it } from 'vitest'
import { empresaSchema } from './empresaSchema'

const base = {
  nombre_comercial: 'Constructora Norte',
  razon_social: '',
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
      expect(r.data.razon_social).toBeNull()
      expect(r.data.ciclo_facturacion).toBe('mensual')
    }
  })

  it('exige nombre comercial', () => {
    const r = empresaSchema.safeParse({ ...base, nombre_comercial: '  ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.nombre_comercial?.[0]).toMatch(/requerido/i)
  })

  it('acepta razón social opcional y la conserva', () => {
    const r = empresaSchema.safeParse({ ...base, razon_social: 'Constructora Norte S.A. de C.V.' })
    expect(r.success && r.data.razon_social).toBe('Constructora Norte S.A. de C.V.')
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
