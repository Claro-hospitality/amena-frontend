import { describe, expect, it } from 'vitest'
import type { Evento } from './api'
import { condicionFiltroEvento, ocupados, puedeVerEventos } from './logica'

function evento(over: Partial<Evento> = {}): Evento {
  return {
    id: 'id-1',
    slug: 'cata-de-vinos',
    categoria: 'Cata',
    titulo: 'Cata de vinos mexicanos',
    descripcion_corta: 'Seis etiquetas',
    descripcion_larga: null,
    incluye: null,
    fecha: '2026-08-15',
    hora_inicio: '19:00:00',
    hora_fin: '21:30:00',
    lugar: 'Amena',
    precio: 850,
    cupo_total: 24,
    cupo_disponible: 12,
    estado: 'Publicado',
    imagen_url: 'https://x/1.jpg',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...over,
  }
}

describe('puedeVerEventos', () => {
  it('deja pasar al rol dedicado y al super_admin', () => {
    expect(puedeVerEventos('eventos')).toBe(true)
    expect(puedeVerEventos('super_admin')).toBe(true)
  })

  it('bloquea a los demás roles del backoffice', () => {
    expect(puedeVerEventos('finanzas')).toBe(false)
    expect(puedeVerEventos('mesero')).toBe(false)
    expect(puedeVerEventos('consulta')).toBe(false)
    expect(puedeVerEventos('capitan_meseros')).toBe(false)
  })
})

describe('ocupados', () => {
  it('resta el cupo disponible del total', () => {
    expect(ocupados(evento({ cupo_total: 24, cupo_disponible: 12 }))).toBe(12)
  })

  it('es cero cuando nadie reservó', () => {
    expect(ocupados(evento({ cupo_total: 20, cupo_disponible: 20 }))).toBe(0)
  })
})

describe('condicionFiltroEvento', () => {
  const HOY = '2026-08-15'

  it('"Todos" no pone condición', () => {
    expect(condicionFiltroEvento('Todos', HOY)).toBeNull()
  })

  it('filtra por estado', () => {
    expect(condicionFiltroEvento('Publicados', HOY)).toEqual({
      columna: 'estado',
      operador: 'eq',
      valor: 'Publicado',
    })
    expect(condicionFiltroEvento('Borradores', HOY)).toEqual({
      columna: 'estado',
      operador: 'eq',
      valor: 'Borrador',
    })
  })

  it('"Pasados" corta por fecha, con el hoy que se le pasa', () => {
    // El corte se inyecta para no depender del reloj de la máquina que corre el test.
    expect(condicionFiltroEvento('Pasados', HOY)).toEqual({
      columna: 'fecha',
      operador: 'lt',
      valor: HOY,
    })
  })
})
