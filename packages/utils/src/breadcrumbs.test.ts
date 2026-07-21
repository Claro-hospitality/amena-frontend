import { describe, expect, it } from 'vitest'
import { construirMigas } from './breadcrumbs'

const MAPA = {
  '/inicio': 'Inicio',
  '/empresas': 'Empresas',
  '/escaner': 'Escáner',
  '/escaner/hoy': 'Consumos de hoy',
}

describe('construirMigas', () => {
  it('antepone Inicio y marca la última como actual', () => {
    const migas = construirMigas('/empresas', MAPA)
    expect(migas).toEqual([
      { label: 'Inicio', to: '/inicio', esActual: false },
      { label: 'Empresas', to: '/empresas', esActual: true },
    ])
  })

  it('encadena rutas anidadas acumulando segmentos', () => {
    const migas = construirMigas('/escaner/hoy', MAPA)
    expect(migas.map((m) => m.to)).toEqual(['/inicio', '/escaner', '/escaner/hoy'])
    expect(migas.at(-1)).toEqual({ label: 'Consumos de hoy', to: '/escaner/hoy', esActual: true })
    expect(migas[1].esActual).toBe(false)
  })

  it('en Inicio devuelve una sola miga (actual), sin duplicar la raíz', () => {
    const migas = construirMigas('/inicio', MAPA)
    expect(migas).toEqual([{ label: 'Inicio', to: '/inicio', esActual: true }])
  })

  it('ignora segmentos sin etiqueta en el mapa (no rompe)', () => {
    const migas = construirMigas('/empresas/e123', MAPA)
    // /empresas/e123 no está mapeado → solo se resuelve /empresas
    expect(migas.map((m) => m.label)).toEqual(['Inicio', 'Empresas'])
    expect(migas.at(-1)?.esActual).toBe(true)
  })

  it('ruta desconocida cae a solo Inicio (actual)', () => {
    const migas = construirMigas('/no-existe', MAPA)
    expect(migas).toEqual([{ label: 'Inicio', to: '/inicio', esActual: true }])
  })
})
