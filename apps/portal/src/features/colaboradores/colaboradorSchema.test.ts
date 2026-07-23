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

  it('rol: cae a colaborador si falta o viene vacío; acepta admin', () => {
    const base = { nombre: 'X', email: 'ana@empresa.com' }
    const sinRol = colaboradorSchema.safeParse(base)
    expect(sinRol.success && sinRol.data.rol).toBe('colaborador')
    const vacio = colaboradorSchema.safeParse({ ...base, rol: '' })
    expect(vacio.success && vacio.data.rol).toBe('colaborador')
    const admin = colaboradorSchema.safeParse({ ...base, rol: 'admin' })
    expect(admin.success && admin.data.rol).toBe('admin')
  })
})
