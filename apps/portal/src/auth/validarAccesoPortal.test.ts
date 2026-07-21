import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: controlamos qué devuelven mis_empresas_admin / mis_comensales.
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@amena/supabase', () => ({ supabase: { rpc: mocks.rpc } }))

import { validarAccesoPortal } from './validarAccesoPortal'

function stub({
  empresas = [] as number[],
  comensales = [] as number[],
}: {
  empresas?: number[]
  comensales?: number[]
}) {
  mocks.rpc.mockImplementation((name: string) => {
    const map: Record<string, number[]> = {
      mis_empresas_admin: empresas,
      mis_comensales: comensales,
    }
    return Promise.resolve({ data: map[name] ?? [], error: null })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validarAccesoPortal (portal)', () => {
  it('concede admin_empresa si administra alguna empresa', async () => {
    stub({ empresas: [1] })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, tipo: 'admin_empresa' })
  })

  it('concede colaborador si tiene comensal enlazado (y no es admin)', async () => {
    stub({ empresas: [], comensales: [1] })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, tipo: 'colaborador' })
  })

  it('deniega si no es admin ni colaborador', async () => {
    stub({ empresas: [], comensales: [] })
    expect(await validarAccesoPortal()).toEqual({ concedido: false, tipo: null })
  })
})
