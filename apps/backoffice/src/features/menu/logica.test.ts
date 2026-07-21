import { describe, expect, it } from 'vitest'
import type { Platillo } from '../platillos/api'
import { platillosDisponibles } from './logica'

const platillo = (id: number): Platillo => ({
  id,
  nombre: String(id),
  descripcion: null,
  foto_url: null,
  activo: true,
  created_at: '',
  updated_at: '',
})

describe('platillosDisponibles', () => {
  it('excluye los platillos ya asignados ese día', () => {
    const activos = [platillo(1), platillo(2), platillo(3)]
    expect(platillosDisponibles(activos, [2]).map((p) => p.id)).toEqual([1, 3])
  })

  it('sin asignados devuelve todo el catálogo activo', () => {
    const activos = [platillo(1), platillo(2)]
    expect(platillosDisponibles(activos, [])).toHaveLength(2)
  })
})
