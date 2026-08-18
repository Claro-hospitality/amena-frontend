import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('./index', () => ({
  supabase: { functions: { invoke: mocks.invoke }, auth: { signOut: mocks.signOut } },
}))

import { esSesionExpirada, invocarFuncion, SesionExpiradaError } from './funciones'

/** Simula el FunctionsHttpError de supabase-js: el body viaja en error.context (un Response). */
function fallo(status: number, body: unknown) {
  return {
    data: null,
    error: { name: 'FunctionsHttpError', context: { status, json: async () => body } },
  }
}

describe('invocarFuncion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.signOut.mockResolvedValue({ error: null })
  })

  it('devuelve los datos cuando todo sale bien', async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true }, error: null })

    await expect(invocarFuncion('corte-semanal', { force: true })).resolves.toEqual({ ok: true })
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('un 401 es sesión expirada: limpia la sesión LOCAL y avisa', async () => {
    mocks.invoke.mockResolvedValue(
      fallo(401, { error: 'Tu sesión ya no es válida. Vuelve a iniciar sesión.' })
    )

    const err = await invocarFuncion('restablecer-acceso', {}).catch((e) => e)

    expect(esSesionExpirada(err)).toBe(true)
    expect(err.message).toMatch(/vuelve a iniciar sesión/i)
    // 'local': un signOut global revocaría también la sesión de la otra app.
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('un 403 es falta de permisos: NO toca la sesión', async () => {
    mocks.invoke.mockResolvedValue(
      fallo(403, { error: 'Esta operación requiere el rol super_admin.' })
    )

    const err = await invocarFuncion('restablecer-acceso', {}).catch((e) => e)

    // Volver a iniciar sesión no arreglaría esto, así que no se cierra nada.
    expect(esSesionExpirada(err)).toBe(false)
    expect(err.message).toBe('Esta operación requiere el rol super_admin.')
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('usa el mensaje propio de cada llamador cuando la función no manda uno', async () => {
    mocks.invoke.mockResolvedValue(fallo(500, {}))

    const err = await invocarFuncion('facturar-corte', {}, 'No se pudo facturar el corte.').catch(
      (e) => e
    )

    expect(err.message).toBe('No se pudo facturar el corte.')
  })

  it('un body que no es JSON no rompe el manejo del error', async () => {
    mocks.invoke.mockResolvedValue({
      data: null,
      error: {
        context: {
          status: 500,
          json: async () => {
            throw new Error('no es JSON')
          },
        },
      },
    })

    const err = await invocarFuncion('corte-semanal', {}).catch((e) => e)

    expect(err.message).toMatch(/no se pudo completar/i)
  })

  it('esSesionExpirada reconoce la marca aunque el error pierda su prototipo', () => {
    expect(esSesionExpirada(new SesionExpiradaError())).toBe(true)
    expect(esSesionExpirada({ esSesionExpirada: true })).toBe(true)
    expect(esSesionExpirada(new Error('otra cosa'))).toBe(false)
    expect(esSesionExpirada(null)).toBe(false)
  })
})
