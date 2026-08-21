import { describe, expect, it } from 'vitest'
import type { Reservacion } from './api'
import { filtrarReservaciones, iniciales } from './logica'

function reservacion(over: Partial<Reservacion> = {}): Reservacion {
  return {
    id: 'r-1',
    folio: 'AMN-EV-2026-00418',
    evento_id: 'e-1',
    nombre: 'Mariana Robles Estrada',
    email: 'mariana.robles@gmail.com',
    telefono: null,
    personas: 2,
    monto: 1700,
    estado_pago: 'pagada',
    estado_boleto: 'sin usar',
    synergy_pay_id: null,
    metodo_pago: null,
    reservada_el: '2026-08-02T18:42:00-06:00',
    validada_el: null,
    updated_at: '2026-08-02T18:42:00-06:00',
    eventos: null,
    ...over,
  }
}

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

describe('filtrarReservaciones', () => {
  const pagada = reservacion({ folio: 'F-PAGADA', estado_pago: 'pagada' })
  const pendiente = reservacion({
    folio: 'F-PENDIENTE',
    estado_pago: 'pendiente',
    nombre: 'Luis Tapia',
    email: 'luis.tapia@gmail.com',
  })
  const cancelada = reservacion({
    folio: 'F-CANCELADA',
    estado_pago: 'cancelada',
    nombre: 'Rodrigo Gámez',
    email: 'rgamez@empresa.mx',
  })
  const todas = [pagada, pendiente, cancelada]

  it('sin filtro devuelve todas', () => {
    expect(filtrarReservaciones(todas, 'Todas', '')).toHaveLength(3)
  })

  it('filtra por estado de pago', () => {
    expect(filtrarReservaciones(todas, 'Pagadas', '').map((r) => r.folio)).toEqual(['F-PAGADA'])
    expect(filtrarReservaciones(todas, 'Canceladas', '').map((r) => r.folio)).toEqual([
      'F-CANCELADA',
    ])
  })

  it('busca por nombre', () => {
    expect(filtrarReservaciones(todas, 'Todas', 'tapia').map((r) => r.folio)).toEqual([
      'F-PENDIENTE',
    ])
  })

  it('busca por folio', () => {
    expect(filtrarReservaciones(todas, 'Todas', 'f-cancel').map((r) => r.folio)).toEqual([
      'F-CANCELADA',
    ])
  })

  // En la app original el email se comparaba sin normalizar, así que una búsqueda
  // en mayúsculas no encontraba nada.
  it('busca por email sin importar mayúsculas', () => {
    expect(filtrarReservaciones(todas, 'Todas', 'RGAMEZ@EMPRESA.MX').map((r) => r.folio)).toEqual([
      'F-CANCELADA',
    ])
  })

  it('combina filtro y búsqueda', () => {
    expect(filtrarReservaciones(todas, 'Pagadas', 'tapia')).toHaveLength(0)
  })
})
