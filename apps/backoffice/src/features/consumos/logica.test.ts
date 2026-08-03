import { describe, expect, it } from 'vitest'
import { badgeOrigen, rangoPorGranularidad } from './logica'

describe('rangoPorGranularidad', () => {
  const f = new Date(2026, 6, 24) // vie 24 jul 2026 (lunes: 20 jul, domingo: 26 jul)

  it('día: desde = hasta = la fecha', () => {
    expect(rangoPorGranularidad(f, 'dia')).toEqual({ desde: '2026-07-24', hasta: '2026-07-24' })
  })
  it('semana: lunes→domingo de esa fecha', () => {
    expect(rangoPorGranularidad(f, 'semana')).toEqual({ desde: '2026-07-20', hasta: '2026-07-26' })
  })
  it('mes: día 1→último del mes', () => {
    expect(rangoPorGranularidad(f, 'mes')).toEqual({ desde: '2026-07-01', hasta: '2026-07-31' })
  })
  it('semana de una fecha pasada (otro mes)', () => {
    // mié 3 jun 2026 → lunes 1 jun, domingo 7 jun
    expect(rangoPorGranularidad(new Date(2026, 5, 3), 'semana')).toEqual({
      desde: '2026-06-01',
      hasta: '2026-06-07',
    })
  })
})

describe('badgeOrigen', () => {
  it('mapea cada origen a su etiqueta legible', () => {
    expect(badgeOrigen('reserva').etiqueta).toBe('Reservada')
    expect(badgeOrigen('extra').etiqueta).toBe('Extra')
    expect(badgeOrigen('libre').etiqueta).toBe('Libre')
  })

  it('asigna una variante de badge a cada origen', () => {
    expect(badgeOrigen('reserva').variante).toBe('secondary')
    expect(badgeOrigen('extra').variante).toBe('outline')
    expect(badgeOrigen('libre').variante).toBe('default')
  })

  it('origen desconocido cae a la etiqueta cruda con variante outline', () => {
    expect(badgeOrigen('otro')).toEqual({ etiqueta: 'otro', variante: 'outline' })
  })
})
