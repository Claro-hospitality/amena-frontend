import { describe, expect, it } from 'vitest'
import { estadoDelFiltro, iniciales } from './logica'

describe('iniciales', () => {
  it('toma la inicial de las dos primeras palabras', () => {
    expect(iniciales('Mariana Robles Estrada')).toBe('MR')
  })

  it('funciona con un solo nombre', () => {
    expect(iniciales('Javier')).toBe('J')
  })

  it('ignora espacios de más', () => {
    expect(iniciales('  Ana   Villaseñor  ')).toBe('AV')
  })

  it('devuelve cadena vacía si el nombre está vacío', () => {
    expect(iniciales('   ')).toBe('')
  })
})

describe('estadoDelFiltro', () => {
  it('"Todas" no restringe el estado', () => {
    expect(estadoDelFiltro('Todas')).toBeNull()
  })

  it('cada chip mapea a su estado de pago', () => {
    expect(estadoDelFiltro('Pagadas')).toBe('pagada')
    expect(estadoDelFiltro('Pendientes')).toBe('pendiente')
    expect(estadoDelFiltro('Canceladas')).toBe('cancelada')
  })
})
