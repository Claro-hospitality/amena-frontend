import { describe, expect, it } from 'vitest'
import { mapearErrorReserva } from './errores'

describe('mapearErrorReserva', () => {
  it('permiso (SQLSTATE 42501)', () => {
    expect(mapearErrorReserva({ code: '42501', message: 'No autorizado…' })).toMatch(/permiso/i)
  })

  it('colaborador de otra empresa', () => {
    expect(
      mapearErrorReserva({ message: 'El colaborador x no pertenece a la empresa y' })
    ).toMatch(/no pertenece/i)
  })

  it('colaborador inactivo', () => {
    expect(mapearErrorReserva({ message: 'El colaborador x está inactivo' })).toMatch(
      /inactivo/i
    )
  })

  it('colaborador inexistente', () => {
    expect(mapearErrorReserva({ message: 'El colaborador x no existe' })).toMatch(/ya no existe/i)
  })

  it('fin de semana', () => {
    expect(
      mapearErrorReserva({ message: 'La fecha x cae en fin de semana; solo se permiten…' })
    ).toMatch(/lunes a viernes/i)
  })

  it('fecha pasada', () => {
    expect(mapearErrorReserva({ message: 'La fecha x ya pasó; no se pueden…' })).toMatch(
      /fechas pasadas/i
    )
  })

  it('fallback para errores desconocidos', () => {
    expect(mapearErrorReserva({ message: 'boom' })).toMatch(/no se pudo guardar/i)
    expect(mapearErrorReserva(null)).toMatch(/no se pudo guardar/i)
  })
})
