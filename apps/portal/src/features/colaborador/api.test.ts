import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: un query-builder genérico y encadenable que registra .eq()/.in() (para
// verificar el filtrado) y resuelve por tabla al hacer `await`. Soporta tanto la cadena de
// `obtenerMiColaborador` (…eq().limit().maybeSingle()) como la de `estadoDeHoy`
// (…in().eq().eq().limit() + rpc('mis_comensales')).
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  eq: vi.fn(),
  in: vi.fn(),
  maybeSingle: vi.fn(),
  // Resultado que resuelve el `await <builder>` según la tabla consultada.
  porTabla: {} as Record<string, { data: unknown; error: unknown }>,
}))
vi.mock('@amena/supabase', () => {
  const builderDe = (tabla: string) => {
    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        mocks.eq(col, val)
        return builder
      },
      in: (col: string, val: unknown) => {
        mocks.in(col, val)
        return builder
      },
      limit: () => builder,
      maybeSingle: () => mocks.maybeSingle(),
      // Hace al builder "thenable": `await from(t).select()...limit()` resuelve el resultado
      // configurado para esa tabla (por defecto lista vacía).
      then: (resolver: (v: unknown) => unknown) =>
        resolver(mocks.porTabla[tabla] ?? { data: [], error: null }),
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: mocks.getUser },
      rpc: (...args: unknown[]) => mocks.rpc(...args),
      from: (tabla: string) => {
        mocks.from(tabla)
        return builderDe(tabla)
      },
    },
  }
})

import { estadoDeHoy, obtenerMiColaborador } from './api'

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
  mocks.porTabla = {}
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

describe('estadoDeHoy', () => {
  it('acota cuotas y consumos a MIS comensales (no toma el consumo de otra persona/empresa)', async () => {
    mocks.rpc.mockResolvedValue({ data: [42], error: null })
    // Yo no tengo cuota ni consumo hoy, aunque la RLS deje ver los de otros.
    mocks.porTabla = {
      cuotas: { data: [], error: null },
      consumos: { data: [], error: null },
    }

    const estado = await estadoDeHoy()

    // Clave del fix: ambas consultas filtran por comensal_id ∈ mis comensales.
    expect(mocks.in).toHaveBeenCalledWith('comensal_id', [42])
    expect(mocks.in).toHaveBeenCalledTimes(2)
    // Sin consumo propio hoy → NO se muestra "Ya comiste".
    expect(estado).toEqual({ tieneCuota: false, consumo: null })
  })

  it('refleja mi propio consumo de hoy cuando existe', async () => {
    mocks.rpc.mockResolvedValue({ data: [42], error: null })
    mocks.porTabla = {
      cuotas: { data: [{ fecha: '2026-08-04' }], error: null },
      consumos: { data: [{ created_at: '2026-08-04T19:58:00Z' }], error: null },
    }

    const estado = await estadoDeHoy()

    expect(estado.tieneCuota).toBe(true)
    expect(estado.consumo).toEqual({ created_at: '2026-08-04T19:58:00Z' })
  })

  it('sin comensales (admin que no come) → estado vacío sin consultar cuotas/consumos', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const estado = await estadoDeHoy()

    expect(estado).toEqual({ tieneCuota: false, consumo: null })
    // No debe consultar cuotas/consumos si no tengo comensales.
    expect(mocks.from).not.toHaveBeenCalled()
    expect(mocks.in).not.toHaveBeenCalled()
  })
})
