import { describe, expect, it } from 'vitest'
import { colaboradorSchema } from './colaboradorSchema'

describe('colaboradorSchema', () => {
  it('acepta nombre con email vacío (queda null)', () => {
    const r = colaboradorSchema.safeParse({ nombre: 'María López', email: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBeNull()
  })

  it('exige nombre', () => {
    const r = colaboradorSchema.safeParse({ nombre: '  ', email: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.nombre?.[0]).toMatch(/requerido/i)
  })

  it('valida el formato del email solo si se llena', () => {
    expect(colaboradorSchema.safeParse({ nombre: 'X', email: 'ana@empresa.com' }).success).toBe(true)
    expect(colaboradorSchema.safeParse({ nombre: 'X', email: 'nope' }).success).toBe(false)
  })
})
