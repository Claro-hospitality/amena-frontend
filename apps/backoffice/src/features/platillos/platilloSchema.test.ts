import { describe, expect, it } from 'vitest'
import { platilloSchema } from './platilloSchema'

describe('platilloSchema', () => {
  it('acepta nombre con descripción vacía (queda null)', () => {
    const r = platilloSchema.safeParse({ nombre: 'Milanesa con puré', descripcion: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.descripcion).toBeNull()
  })

  it('exige nombre', () => {
    const r = platilloSchema.safeParse({ nombre: '  ', descripcion: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.nombre?.[0]).toMatch(/requerido/i)
  })

  it('conserva la descripción si se llena', () => {
    const r = platilloSchema.safeParse({ nombre: 'Pozole', descripcion: 'Rojo, con maíz' })
    expect(r.success && r.data.descripcion).toBe('Rojo, con maíz')
  })
})
