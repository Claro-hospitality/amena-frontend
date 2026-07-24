import { describe, expect, it } from 'vitest'
import type { BusquedaComensal } from './api'
import {
  debeIgnorarLectura,
  esUuidValido,
  estadoComensalTexto,
  mapearMotivoRechazo,
  puedeRegistrar,
} from './logica'

/** Construye un comensal de búsqueda con valores por defecto (declaración, sin consumo). */
function comensal(over: Partial<BusquedaComensal> = {}): BusquedaComensal {
  return {
    comensal_id: 1,
    nombre: 'Ana Ruiz',
    empresa_nombre: 'Acme',
    es_libre: false,
    tiene_cuota: false,
    consumio_hoy: false,
    ultima_hora: null,
    consumos_hoy: 0,
    limite_diario: null,
    ...over,
  }
}

describe('esUuidValido', () => {
  it('acepta un UUID bien formado', () => {
    expect(esUuidValido('10000000-0000-0000-0000-000000000001')).toBe(true)
    expect(esUuidValido('  10000000-0000-0000-0000-000000000001  ')).toBe(true)
  })
  it('rechaza texto que no es UUID', () => {
    expect(esUuidValido('hola')).toBe(false)
    expect(esUuidValido('1234')).toBe(false)
    expect(esUuidValido('')).toBe(false)
  })
})

describe('mapearMotivoRechazo', () => {
  const casos: [string, string][] = [
    ['El colaborador no existe', 'QR no válido'],
    ['El colaborador está inactivo', 'Colaborador inactivo'],
    ['La empresa del colaborador está inactiva', 'Empresa inactiva'],
    ['El colaborador no tiene cuota disponible para hoy', 'Sin cuota para hoy'],
    ['El colaborador ya consumió hoy', 'Ya consumió hoy'],
    ['Hoy no es un día permitido para consumo libre', 'Hoy no es día permitido'],
  ]
  it.each(casos)('%s → %s', (mensaje, esperado) => {
    expect(mapearMotivoRechazo({ message: mensaje })).toBe(esperado)
  })
  it('límite diario devuelve el mensaje del RPC con el conteo (N de M)', () => {
    expect(mapearMotivoRechazo({ message: 'Límite diario alcanzado (2 de 2)' })).toBe(
      'Límite diario alcanzado (2 de 2)'
    )
  })
  it('desconocido → mensaje genérico', () => {
    expect(mapearMotivoRechazo({ message: 'boom' })).toBe('No se pudo registrar')
    expect(mapearMotivoRechazo(null)).toBe('No se pudo registrar')
  })
})

describe('estadoComensalTexto', () => {
  it('modo libre: "Libre: N de M hoy" (M = límite o ∞)', () => {
    expect(estadoComensalTexto(comensal({ es_libre: true, consumos_hoy: 1, limite_diario: 2 }))).toBe(
      'Libre: 1 de 2 hoy'
    )
    expect(estadoComensalTexto(comensal({ es_libre: true, consumos_hoy: 0, limite_diario: null }))).toBe(
      'Libre: 0 de ∞ hoy'
    )
  })
  it('ya consumió: muestra la hora', () => {
    const texto = estadoComensalTexto(
      comensal({ consumio_hoy: true, ultima_hora: '2026-07-24T19:10:00Z' })
    )
    expect(texto).toMatch(/^Ya consumió a las \d{1,2}:\d{2}/)
  })
  it('declaración con cuota / sin cuota', () => {
    expect(estadoComensalTexto(comensal({ tiene_cuota: true }))).toBe('Con cuota disponible')
    expect(estadoComensalTexto(comensal({ tiene_cuota: false }))).toBe('Sin cuota para hoy')
  })
})

describe('puedeRegistrar', () => {
  it('libre: true bajo el límite, false al alcanzarlo, true si es ilimitado', () => {
    expect(puedeRegistrar(comensal({ es_libre: true, consumos_hoy: 1, limite_diario: 2 }))).toBe(true)
    expect(puedeRegistrar(comensal({ es_libre: true, consumos_hoy: 2, limite_diario: 2 }))).toBe(false)
    expect(puedeRegistrar(comensal({ es_libre: true, consumos_hoy: 9, limite_diario: null }))).toBe(true)
  })
  it('declaración: true solo con cuota y sin consumo previo', () => {
    expect(puedeRegistrar(comensal({ tiene_cuota: true, consumio_hoy: false }))).toBe(true)
    expect(puedeRegistrar(comensal({ tiene_cuota: true, consumio_hoy: true }))).toBe(false)
    expect(puedeRegistrar(comensal({ tiene_cuota: false }))).toBe(false)
  })
})

describe('debeIgnorarLectura', () => {
  const id = 'abc'
  it('ignora la misma id dentro de la ventana', () => {
    expect(debeIgnorarLectura(id, { id, ts: 1000 }, 3000, 5000)).toBe(true)
  })
  it('no ignora fuera de la ventana', () => {
    expect(debeIgnorarLectura(id, { id, ts: 1000 }, 7000, 5000)).toBe(false)
  })
  it('no ignora una id distinta ni la primera lectura', () => {
    expect(debeIgnorarLectura(id, { id: 'otra', ts: 1000 }, 1500, 5000)).toBe(false)
    expect(debeIgnorarLectura(id, null, 1500, 5000)).toBe(false)
  })
})
