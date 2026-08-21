import { describe, expect, it } from 'vitest'
import { grupoEventos, navPorRol } from './navBackoffice'
import { rutaActiva } from './navActiva'

const RUTAS_EVENTOS = grupoEventos.items.map((i) => i.to)

describe('rutaActiva', () => {
  it('marca el ítem exacto', () => {
    expect(rutaActiva('/eventos', RUTAS_EVENTOS)).toBe('/eventos')
    expect(rutaActiva('/eventos/catalogo', RUTAS_EVENTOS)).toBe('/eventos/catalogo')
  })

  it('el Resumen NO se queda prendido en las demás pantallas del grupo', () => {
    // El bug que arregla esto: `/eventos` es prefijo de todo el grupo.
    for (const url of [
      '/eventos/catalogo',
      '/eventos/catalogo/nuevo',
      '/eventos/reservaciones',
      '/eventos/escanear',
    ]) {
      expect(rutaActiva(url, RUTAS_EVENTOS)).not.toBe('/eventos')
    }
  })

  it('un detalle deja marcado a su padre', () => {
    expect(rutaActiva('/eventos/reservaciones/AMN-EV-2026-00418', RUTAS_EVENTOS)).toBe(
      '/eventos/reservaciones'
    )
    expect(rutaActiva('/eventos/catalogo/cata-de-vinos/editar', RUTAS_EVENTOS)).toBe(
      '/eventos/catalogo'
    )
  })

  it('no confunde una ruta que solo comparte el inicio del nombre', () => {
    // `/eventos/catalogos-viejos` no es hija de `/eventos/catalogo`.
    expect(rutaActiva('/eventos/catalogos-viejos', RUTAS_EVENTOS)).toBe('/eventos')
  })

  it('devuelve null cuando la URL no es de la lista', () => {
    expect(rutaActiva('/cortes', RUTAS_EVENTOS)).toBeNull()
  })

  it('sirve igual para los ítems planos del menú', () => {
    const rutas = navPorRol.super_admin.map((i) => i.to)
    expect(rutaActiva('/empresas/3', rutas)).toBe('/empresas')
    expect(rutaActiva('/menu', rutas)).toBe('/menu')
  })
})
