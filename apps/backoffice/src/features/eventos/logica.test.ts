import { describe, expect, it } from 'vitest'
import type { Evento } from './api'
import { filtrarEventos, ocupados, puedeVerEventos } from './logica'

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

describe('filtrarEventos', () => {
  const publicado = evento({ slug: 'publicado', estado: 'Publicado', fecha: '2026-12-01' })
  const borrador = evento({ slug: 'borrador', estado: 'Borrador', fecha: '2026-12-02' })
  const pasado = evento({
    slug: 'pasado',
    titulo: 'Taller viejo',
    estado: 'Publicado',
    fecha: '2026-01-10',
  })
  const todos = [publicado, borrador, pasado]
  const hoy = new Date(2026, 7, 15)

  it('sin filtro ni búsqueda devuelve todo', () => {
    expect(filtrarEventos(todos, 'Todos', '', hoy)).toHaveLength(3)
  })

  it('filtra por estado publicado', () => {
    const r = filtrarEventos(todos, 'Publicados', '', hoy)
    expect(r.map((e) => e.slug)).toEqual(['publicado', 'pasado'])
  })

  it('filtra por borradores', () => {
    expect(filtrarEventos(todos, 'Borradores', '', hoy).map((e) => e.slug)).toEqual(['borrador'])
  })

  it('"Pasados" deja solo los anteriores a hoy', () => {
    expect(filtrarEventos(todos, 'Pasados', '', hoy).map((e) => e.slug)).toEqual(['pasado'])
  })

  it('busca por título sin importar mayúsculas', () => {
    expect(filtrarEventos(todos, 'Todos', 'TALLER', hoy).map((e) => e.slug)).toEqual(['pasado'])
  })

  it('combina filtro y búsqueda', () => {
    expect(filtrarEventos(todos, 'Borradores', 'taller', hoy)).toHaveLength(0)
  })
})
