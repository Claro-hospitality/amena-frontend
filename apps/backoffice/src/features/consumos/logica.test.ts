import { describe, expect, it } from 'vitest'
import { badgeOrigen, presetsRango } from './logica'

describe('presetsRango', () => {
  it('calcula Hoy, Ayer, Últimos 7 días y Este mes', () => {
    const p = presetsRango(new Date(2026, 6, 24)) // 24 jul 2026 (local)
    expect(p.map((x) => x.clave)).toEqual(['hoy', 'ayer', 'semana', 'mes'])
    expect(p[0]).toMatchObject({ desde: '2026-07-24', hasta: '2026-07-24' })
    expect(p[1]).toMatchObject({ desde: '2026-07-23', hasta: '2026-07-23' })
    expect(p[2]).toMatchObject({ desde: '2026-07-18', hasta: '2026-07-24' })
    expect(p[3]).toMatchObject({ desde: '2026-07-01', hasta: '2026-07-24' })
  })
})

describe('badgeOrigen', () => {
  it('mapea cada origen a su etiqueta legible', () => {
    expect(badgeOrigen('declaracion').etiqueta).toBe('Declarada')
    expect(badgeOrigen('extra').etiqueta).toBe('Extra')
    expect(badgeOrigen('libre').etiqueta).toBe('Libre')
  })

  it('asigna una variante de badge a cada origen', () => {
    expect(badgeOrigen('declaracion').variante).toBe('secondary')
    expect(badgeOrigen('extra').variante).toBe('outline')
    expect(badgeOrigen('libre').variante).toBe('default')
  })

  it('origen desconocido cae a la etiqueta cruda con variante outline', () => {
    expect(badgeOrigen('otro')).toEqual({ etiqueta: 'otro', variante: 'outline' })
  })
})
