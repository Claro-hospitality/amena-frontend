import { describe, expect, it } from 'vitest'
import { aParrafos, deParrafos, eventoSchema } from './eventoSchema'

const base = {
  titulo: 'Cata de vinos',
  descripcion_corta: 'Seis etiquetas mexicanas',
  descripcion_larga: 'Una noche para recorrer seis etiquetas.',
  categoria: 'Cata',
  fecha: '2026-08-15',
  hora_inicio: '19:00',
  hora_fin: '21:30',
  precio: '850',
  cupo_total: '24',
  lugar: 'Amena · Mutuo Vive, Guadalajara',
}

describe('eventoSchema', () => {
  it('acepta un evento completo y convierte los números', () => {
    const r = eventoSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.precio).toBe(850)
      expect(r.data.cupo_total).toBe(24)
    }
  })

  it('convierte la hora de fin vacía a null (la columna es nullable)', () => {
    const r = eventoSchema.safeParse({ ...base, hora_fin: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.hora_fin).toBeNull()
  })

  it('rechaza un título vacío', () => {
    const r = eventoSchema.safeParse({ ...base, titulo: '   ' })
    expect(r.success).toBe(false)
  })

  it('rechaza una categoría que la base no acepta', () => {
    const r = eventoSchema.safeParse({ ...base, categoria: 'Concierto' })
    expect(r.success).toBe(false)
  })

  it('rechaza un cupo de cero', () => {
    const r = eventoSchema.safeParse({ ...base, cupo_total: '0' })
    expect(r.success).toBe(false)
  })
})

describe('aParrafos / deParrafos', () => {
  it('parte por línea en blanco y descarta vacíos', () => {
    expect(aParrafos('Uno\n\nDos\n\n\n\nTres')).toEqual(['Uno', 'Dos', 'Tres'])
  })

  it('devuelve arreglo vacío para texto en blanco', () => {
    expect(aParrafos('   \n\n  ')).toEqual([])
  })

  it('hace ida y vuelta sin perder párrafos', () => {
    const parrafos = ['Primero', 'Segundo']
    expect(aParrafos(deParrafos(parrafos))).toEqual(parrafos)
  })

  it('deParrafos tolera null', () => {
    expect(deParrafos(null)).toBe('')
  })
})
