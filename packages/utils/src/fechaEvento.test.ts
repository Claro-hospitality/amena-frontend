import { describe, expect, it } from 'vitest'
import {
  fechaBadge,
  fechaCortaConHora,
  fechaLarga,
  marcaDeTiempo,
  rangoHorario,
} from './fechaEvento'

describe('fechaBadge', () => {
  it('arma día, fecha abreviada y hora en mayúsculas', () => {
    expect(fechaBadge('2026-08-15', '19:00:00')).toBe('SÁB 15 AGO · 19:00')
  })

  it('acepta la hora ya recortada a HH:mm', () => {
    expect(fechaBadge('2026-08-15', '19:00')).toBe('SÁB 15 AGO · 19:00')
  })
})

describe('fechaLarga', () => {
  it('capitaliza el día e incluye el año', () => {
    expect(fechaLarga('2026-08-15')).toBe('Sábado 15 de agosto, 2026')
  })

  // El bug clásico: new Date('2026-01-01') se interpreta como UTC y en México
  // retrocede al 31 de diciembre. parseISO da medianoche local.
  it('no corre la fecha un día por zona horaria', () => {
    expect(fechaLarga('2026-01-01')).toBe('Jueves 1 de enero, 2026')
  })
})

describe('fechaCortaConHora', () => {
  it('incluye año y hora', () => {
    expect(fechaCortaConHora('2026-08-15', '19:00:00')).toBe('Sáb 15 ago 2026 · 19:00 h')
  })
})

describe('rangoHorario', () => {
  it('muestra inicio y fin cuando hay hora de cierre', () => {
    expect(rangoHorario('19:00:00', '21:30:00')).toBe('19:00 — 21:30 h')
  })

  it('muestra solo el inicio cuando no hay hora de cierre', () => {
    expect(rangoHorario('19:00:00', null)).toBe('19:00 h')
  })
})

describe('marcaDeTiempo', () => {
  it('formatea un timestamp con fecha y hora', () => {
    // Se construye con componentes locales para que el test no dependa de la zona.
    const iso = new Date(2026, 7, 15, 19, 4).toISOString()
    expect(marcaDeTiempo(iso)).toBe('15 ago 2026, 19:04 h')
  })
})
