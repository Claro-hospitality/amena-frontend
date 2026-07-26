import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: capturamos el .eq() para verificar que filtra por el user_id logueado,
// y controlamos auth.getUser() + el resultado de la consulta a comensales.
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
}))
vi.mock('@amena/supabase', () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: () => ({
      select: () => ({
        eq: (col: string, val: unknown) => {
          mocks.eq(col, val)
          return { limit: () => ({ maybeSingle: mocks.maybeSingle }) }
        },
      }),
    }),
  },
}))

import { obtenerMiColaborador } from './api'

const filaMiguel = {
  id: 42,
  activo: true,
  consumo_libre: false,
  usuario: {
    id: 7,
    user_id: 'u-miguel',
    nombre: 'Miguel Robles',
    email: 'miguel.robles@investimento.mx',
    telefono: null,
    empresa: {
      nombre: 'Constructora Norte',
      modo_consumo: 'reserva',
      dias_permitidos: [],
      limite_diario: null,
    },
  },
  credencial: [{ qr_token: 'aaaa1111-2222-3333-4444-555566667777', activo: true }],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('obtenerMiColaborador', () => {
  it('filtra el comensal por el user_id del usuario logueado (no toma el primero de la empresa)', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-miguel' } }, error: null })
    mocks.maybeSingle.mockResolvedValue({ data: filaMiguel, error: null })

    const yo = await obtenerMiColaborador()

    // Clave del fix: la consulta se filtra por MI user_id.
    expect(mocks.eq).toHaveBeenCalledWith('usuario.user_id', 'u-miguel')
    expect(yo?.nombre).toBe('Miguel Robles')
    expect(yo?.qr_token).toBe('aaaa1111-2222-3333-4444-555566667777')
  })

  it('sin sesión (sin user) devuelve null sin consultar comensales', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const yo = await obtenerMiColaborador()

    expect(yo).toBeNull()
    expect(mocks.eq).not.toHaveBeenCalled()
  })

  it('usuario sin comensal (p. ej. admin que no come) → null', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-admin' } }, error: null })
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null })

    expect(await obtenerMiColaborador()).toBeNull()
  })
})
