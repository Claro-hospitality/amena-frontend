import { describe, expect, it } from 'vitest'
import { colaboradorSchema } from './colaboradorSchema'

const base = { empresa_id: 'e1', nombre: 'Juan Pérez', email: '' }

describe('colaboradorSchema', () => {
  it('acepta datos válidos y normaliza el correo vacío a null', () => {
    const r = colaboradorSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.empresa_id).toBe('e1')
      expect(r.data.email).toBeNull()
    }
  })

  it('exige seleccionar una empresa', () => {
    const r = colaboradorSchema.safeParse({ ...base, empresa_id: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.empresa_id?.[0]).toMatch(/empresa/i)
  })

  it('exige nombre', () => {
    const r = colaboradorSchema.safeParse({ ...base, nombre: '  ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.nombre?.[0]).toMatch(/requerido/i)
  })

  it('valida el formato del correo solo si se llena', () => {
    expect(colaboradorSchema.safeParse({ ...base, email: 'juan@cn.com' }).success).toBe(true)
    const r = colaboradorSchema.safeParse({ ...base, email: 'nope' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.email?.[0]).toMatch(/correo/i)
  })
})
