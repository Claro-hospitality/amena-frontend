import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: controlamos qué devuelve el RPC mi_perfil_backoffice.
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@amena/supabase', () => ({ supabase: { rpc: mocks.rpc } }))

import { validarAccesoPortal } from './validarAccesoPortal'

function stubPerfil(perfil: { rol: string; debe_cambiar_password?: boolean } | null) {
  mocks.rpc.mockResolvedValue({
    data: perfil
      ? { rol: perfil.rol, nombre: 'Test', debe_cambiar_password: perfil.debe_cambiar_password ?? false }
      : null,
    error: null,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validarAccesoPortal (backoffice)', () => {
  it('concede super_admin', async () => {
    stubPerfil({ rol: 'super_admin' })
    expect(await validarAccesoPortal()).toEqual({
      concedido: true,
      rol: 'super_admin',
      debeCambiarPassword: false,
    })
  })

  it('concede consulta (rol nuevo)', async () => {
    stubPerfil({ rol: 'consulta' })
    expect(await validarAccesoPortal()).toEqual({
      concedido: true,
      rol: 'consulta',
      debeCambiarPassword: false,
    })
  })

  it('propaga debeCambiarPassword cuando el flag está activo', async () => {
    stubPerfil({ rol: 'mesero', debe_cambiar_password: true })
    expect(await validarAccesoPortal()).toEqual({
      concedido: true,
      rol: 'mesero',
      debeCambiarPassword: true,
    })
  })

  it('deniega si el usuario no es interno (perfil null)', async () => {
    stubPerfil(null)
    expect(await validarAccesoPortal()).toEqual({
      concedido: false,
      rol: null,
      debeCambiarPassword: false,
    })
  })
})
