import { describe, expect, it } from 'vitest'
import { colaboradorSchema } from './colaboradorSchema'

const base = {
  rol: 'colaborador',
  empresa_id: '1',
  nombre: 'Juan Pérez',
  email: 'juan@cn.com',
  telefono: '',
}

describe('colaboradorSchema', () => {
  it('acepta datos válidos y normaliza el teléfono vacío a null', () => {
    const r = colaboradorSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.rol).toBe('colaborador')
      expect(r.data.telefono).toBeNull()
      expect(r.data.empresa_id).toBe(1)
    }
  })

  it('exige un rol válido', () => {
    const r = colaboradorSchema.safeParse({ ...base, rol: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.rol?.[0]).toMatch(/rol/i)
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

  it('exige correo con formato válido', () => {
    expect(colaboradorSchema.safeParse({ ...base, email: '' }).success).toBe(false)
    const r = colaboradorSchema.safeParse({ ...base, email: 'nope' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.email?.[0]).toMatch(/correo/i)
  })
})
