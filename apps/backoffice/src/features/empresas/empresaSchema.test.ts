import { describe, expect, it } from 'vitest'
import { datosFiscalesSchema, empresaSchema, politicaConsumoSchema } from './empresaSchema'

const base = {
  nombre_comercial: 'Constructora Norte',
  precio_comida: '85',
  ciclo_facturacion: 'mensual',
}

describe('empresaSchema', () => {
  it('acepta datos válidos y parsea el precio', () => {
    const r = empresaSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.precio_comida).toBe(85)
      expect(r.data.ciclo_facturacion).toBe('mensual')
    }
  })

  it('acepta nombre comercial vacío (opcional → null)', () => {
    const r = empresaSchema.safeParse({ ...base, nombre_comercial: '  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.nombre_comercial).toBeNull()
  })

  it('exige precio mayor a 0', () => {
    expect(empresaSchema.safeParse({ ...base, precio_comida: '0' }).success).toBe(false)
    expect(empresaSchema.safeParse({ ...base, precio_comida: '' }).success).toBe(false)
  })

  it('parsea precio con formato de moneda', () => {
    const r = empresaSchema.safeParse({ ...base, precio_comida: '$1,234.50' })
    expect(r.success && r.data.precio_comida).toBe(1234.5)
  })
})

describe('datosFiscalesSchema', () => {
  const fiscalBase = {
    razon_social: 'Constructora Norte S.A. de C.V.',
    rfc: 'XAXX010101000',
    codigo_postal_fiscal: '06600',
    regimen_fiscal: '601',
    uso_cfdi: 'G03',
    email_facturacion: 'facturacion@empresa.com',
  }

  it('acepta datos fiscales válidos', () => {
    const r = datosFiscalesSchema.safeParse(fiscalBase)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.razon_social).toBe('Constructora Norte S.A. de C.V.')
  })

  it('exige razón social', () => {
    const r = datosFiscalesSchema.safeParse({ ...fiscalBase, razon_social: '  ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.razon_social?.[0]).toMatch(/requerida/i)
  })

  it('valida el RFC (12 moral / 13 física) y lo normaliza a mayúsculas', () => {
    // 12 (moral)
    const moral = datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'abc010101ab1' })
    expect(moral.success).toBe(true)
    if (moral.success) expect(moral.data.rfc).toBe('ABC010101AB1')
    // 13 (física)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'ABCD010101AB1' }).success).toBe(true)
    // vacío / inválido
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: '  ' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, rfc: 'nope' }).success).toBe(false)
  })

  it('exige CP de exactamente 5 dígitos', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '0660' }).success).toBe(
      false
    )
    expect(
      datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '066000' }).success
    ).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: 'abcde' }).success).toBe(
      false
    )
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, codigo_postal_fiscal: '06600' }).success).toBe(
      true
    )
  })

  it('valida el correo de facturación', () => {
    expect(
      datosFiscalesSchema.safeParse({ ...fiscalBase, email_facturacion: 'no-es-correo' }).success
    ).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, email_facturacion: '  ' }).success).toBe(false)
  })

  it('exige régimen fiscal y uso de CFDI', () => {
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, regimen_fiscal: '' }).success).toBe(false)
    expect(datosFiscalesSchema.safeParse({ ...fiscalBase, uso_cfdi: '' }).success).toBe(false)
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
