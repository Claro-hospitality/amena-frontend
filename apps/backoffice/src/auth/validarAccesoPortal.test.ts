import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: controlamos qué devuelve cada helper RPC (es_*).
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@amena/supabase', () => ({ supabase: { rpc: mocks.rpc } }))

import { validarAccesoPortal } from './validarAccesoPortal'

function stubRoles({ sa = false, fin = false, mes = false }) {
  mocks.rpc.mockImplementation((name: string) => {
    const map: Record<string, boolean> = {
      es_super_admin: sa,
      es_finanzas: fin,
      es_mesero: mes,
    }
    return Promise.resolve({ data: map[name] ?? false, error: null })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validarAccesoPortal (backoffice)', () => {
  it('concede super_admin', async () => {
    stubRoles({ sa: true })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, rol: 'super_admin' })
  })

  it('concede finanzas', async () => {
    stubRoles({ fin: true })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, rol: 'finanzas' })
  })

  it('concede mesero', async () => {
    stubRoles({ mes: true })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, rol: 'mesero' })
  })

  it('deniega si el usuario no es interno (ningún rol)', async () => {
    stubRoles({})
    expect(await validarAccesoPortal()).toEqual({ concedido: false, rol: null })
  })
})
