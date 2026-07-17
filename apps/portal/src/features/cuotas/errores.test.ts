import { describe, expect, it } from 'vitest'
import { mapearErrorDeclaracion } from './errores'

describe('mapearErrorDeclaracion', () => {
  it('permiso (SQLSTATE 42501)', () => {
    expect(mapearErrorDeclaracion({ code: '42501', message: 'No autorizado…' })).toMatch(/permiso/i)
  })

  it('colaborador de otra empresa', () => {
    expect(
      mapearErrorDeclaracion({ message: 'El colaborador x no pertenece a la empresa y' })
    ).toMatch(/no pertenece/i)
  })

  it('colaborador inactivo', () => {
    expect(mapearErrorDeclaracion({ message: 'El colaborador x está inactivo' })).toMatch(
      /inactivo/i
    )
  })

  it('colaborador inexistente', () => {
    expect(mapearErrorDeclaracion({ message: 'El colaborador x no existe' })).toMatch(/ya no existe/i)
  })

  it('fin de semana', () => {
    expect(
      mapearErrorDeclaracion({ message: 'La fecha x cae en fin de semana; solo se permiten…' })
    ).toMatch(/lunes a viernes/i)
  })

  it('fecha pasada', () => {
    expect(mapearErrorDeclaracion({ message: 'La fecha x ya pasó; no se pueden…' })).toMatch(
      /fechas pasadas/i
    )
  })

  it('fallback para errores desconocidos', () => {
    expect(mapearErrorDeclaracion({ message: 'boom' })).toMatch(/no se pudo guardar/i)
    expect(mapearErrorDeclaracion(null)).toMatch(/no se pudo guardar/i)
  })
})
