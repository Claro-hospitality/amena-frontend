import { describe, expect, it } from 'vitest'
import type { Platillo } from '../platillos/api'
import { platillosDisponibles } from './logica'

const platillo = (id: string): Platillo => ({
  id,
  nombre: id,
  descripcion: null,
  foto_url: null,
  activo: true,
  created_at: '',
  updated_at: '',
})

describe('platillosDisponibles', () => {
  it('excluye los platillos ya asignados ese día', () => {
    const activos = [platillo('a'), platillo('b'), platillo('c')]
    expect(platillosDisponibles(activos, ['b']).map((p) => p.id)).toEqual(['a', 'c'])
  })

  it('sin asignados devuelve todo el catálogo activo', () => {
    const activos = [platillo('a'), platillo('b')]
    expect(platillosDisponibles(activos, [])).toHaveLength(2)
  })
})
