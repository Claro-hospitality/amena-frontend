import { describe, expect, it } from 'vitest'
import { debeIgnorarLectura, esUuidValido, mapearMotivoRechazo } from './logica'

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
