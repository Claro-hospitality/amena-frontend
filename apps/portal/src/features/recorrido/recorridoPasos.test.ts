import { describe, expect, it } from 'vitest'
import { construirPasos } from './recorridoPasos'

describe('construirPasos', () => {
  it('el recorrido empieza con bienvenida y termina con cierre (ambos sin ancla)', () => {
    for (const tipo of ['colaborador', 'admin_empresa'] as const) {
      const pasos = construirPasos(tipo)
      expect(pasos.length).toBeGreaterThan(2)
      expect(pasos[0].ancla).toBeUndefined()
      expect(pasos[0].ruta).toBeUndefined()
      expect(pasos.at(-1)!.ancla).toBeUndefined()
    }
  })

  it('el colaborador recorre inicio, menú y mi-qr, sin la sección Empresa', () => {
    const anclas = construirPasos('colaborador').map((p) => p.ancla)
    expect(anclas).toContain('[data-tour="nav-inicio"]')
    expect(anclas).toContain('[data-tour="nav-menu"]')
    expect(anclas).toContain('[data-tour="nav-mi-qr"]')
    // Ninguna ancla de empresa para el colaborador.
    expect(anclas.some((a) => a?.includes('nav-empresa') || a?.includes('emp-'))).toBe(false)
  })

  it('el admin recorre Empresa y TODAS sus sub-secciones', () => {
    const pasos = construirPasos('admin_empresa')
    const anclas = pasos.map((p) => p.ancla)
    expect(anclas).toContain('[data-tour="nav-empresa"]')
    for (const sub of ['emp-general', 'emp-colaboradores', 'emp-cuotas', 'emp-cortes', 'emp-facturas']) {
      expect(anclas).toContain(`[data-tour="${sub}"]`)
    }
  })

  it('cada sub-sección de Empresa navega a su propia ruta', () => {
    const porAncla = new Map(construirPasos('admin_empresa').map((p) => [p.ancla, p.ruta]))
    expect(porAncla.get('[data-tour="emp-general"]')).toBe('/empresa')
    expect(porAncla.get('[data-tour="emp-colaboradores"]')).toBe('/empresa/colaboradores')
    expect(porAncla.get('[data-tour="emp-cuotas"]')).toBe('/empresa/cuotas')
    expect(porAncla.get('[data-tour="emp-cortes"]')).toBe('/empresa/cortes')
    expect(porAncla.get('[data-tour="emp-facturas"]')).toBe('/empresa/facturas')
  })

  it('todo paso con ancla trae título y descripción', () => {
    for (const paso of construirPasos('admin_empresa')) {
      expect(paso.titulo.length).toBeGreaterThan(0)
      expect(paso.descripcion.length).toBeGreaterThan(0)
    }
  })
})
