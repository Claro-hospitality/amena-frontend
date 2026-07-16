import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: controlamos qué devuelven mis_empresas_admin / mis_colaboradores.
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@amena/supabase', () => ({ supabase: { rpc: mocks.rpc } }))

import { validarAccesoPortal } from './validarAccesoPortal'

function stub({
  empresas = [] as string[],
  colaboradores = [] as string[],
}: {
  empresas?: string[]
  colaboradores?: string[]
}) {
  mocks.rpc.mockImplementation((name: string) => {
    const map: Record<string, string[]> = {
      mis_empresas_admin: empresas,
      mis_colaboradores: colaboradores,
    }
    return Promise.resolve({ data: map[name] ?? [], error: null })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validarAccesoPortal (portal)', () => {
  it('concede admin_empresa si administra alguna empresa', async () => {
    stub({ empresas: ['e1'] })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, tipo: 'admin_empresa' })
  })

  it('concede colaborador si tiene colaborador enlazado (y no es admin)', async () => {
    stub({ empresas: [], colaboradores: ['c1'] })
    expect(await validarAccesoPortal()).toEqual({ concedido: true, tipo: 'colaborador' })
  })

  it('deniega si no es admin ni colaborador', async () => {
    stub({ empresas: [], colaboradores: [] })
    expect(await validarAccesoPortal()).toEqual({ concedido: false, tipo: null })
  })
})
