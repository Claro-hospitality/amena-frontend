import { describe, expect, it } from 'vitest'
import { datosFiscalesSchema, desglosarMontoConIva, nombreComercialSchema } from './fiscal'

const fiscalBase = {
  razon_social: 'Empresa Ejemplo S.A. de C.V.',
  rfc: 'ABC010101AB1',
  codigo_postal_fiscal: '06600',
  regimen_fiscal: '601',
  uso_cfdi: 'G03',
  email_facturacion: 'facturacion@ejemplo.com',
}

describe('datosFiscalesSchema', () => {
  it('acepta datos válidos y normaliza el RFC a mayúsculas', () => {
    const r = datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'abc010101ab1' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.rfc).toBe('ABC010101AB1')
  })

  it('acepta RFC moral (12) y físico (13)', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'ABC010101AB1' }).success).toBe(true)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'ABCD010101AB1' }).success).toBe(true)
  })

  it('rechaza RFC con formato inválido', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'nope' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: '  ' }).success).toBe(false)
  })

  it('exige código postal de exactamente 5 dígitos', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '0660' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '066000' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: 'abcde' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '06600' }).success).toBe(true)
  })

  it('exige razón social, régimen, uso CFDI y correo válido', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, razon_social: '  ' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, regimen_fiscal: '' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, uso_cfdi: '' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, email_facturacion: 'no-es-correo' }).success).toBe(false)
  })
})

describe('nombreComercialSchema', () => {
  it('recorta espacios y convierte vacío en null', () => {
    expect(nombreComercialSchema.parse({ nombre_comercial: '  ' }).nombre_comercial).toBeNull()
    expect(nombreComercialSchema.parse({ nombre_comercial: '  Acme  ' }).nombre_comercial).toBe('Acme')
  })
})

describe('desglosarMontoConIva', () => {
  it('desglosa hacia dentro un monto con IVA (espeja el backend de facturación)', () => {
    // 6 × 168 = 1008 → subtotal 868.97 + iva 139.03 = 1008.00
    expect(desglosarMontoConIva(1008)).toEqual({ subtotal: 868.97, iva: 139.03, total: 1008 })
    // 3 × 95 = 285 → subtotal 245.69 + iva 39.31
    expect(desglosarMontoConIva(285)).toEqual({ subtotal: 245.69, iva: 39.31, total: 285 })
  })

  it('subtotal + iva siempre reconstruye el total al centavo', () => {
    for (const total of [504, 1170, 2184, 2535, 999.99]) {
      const { subtotal, iva } = desglosarMontoConIva(total)
      expect(subtotal + iva).toBeCloseTo(total, 2)
    }
  })
})
