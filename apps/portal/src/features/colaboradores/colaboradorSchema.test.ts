import { describe, expect, it } from 'vitest'
import { colaboradorSchema } from './colaboradorSchema'

describe('colaboradorSchema', () => {
  it('exige email (ya no es opcional)', () => {
    const r = colaboradorSchema.safeParse({ nombre: 'María López', email: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.email?.[0]).toMatch(/requerido/i)
  })

  it('exige nombre', () => {
    const r = colaboradorSchema.safeParse({ nombre: '  ', email: 'ana@empresa.com' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.nombre?.[0]).toMatch(/requerido/i)
  })

  it('valida el formato del email', () => {
    expect(colaboradorSchema.safeParse({ nombre: 'X', email: 'ana@empresa.com' }).success).toBe(true)
    expect(colaboradorSchema.safeParse({ nombre: 'X', email: 'nope' }).success).toBe(false)
  })
})
