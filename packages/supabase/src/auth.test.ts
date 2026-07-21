import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos el cliente para no tocar red ni env. index.ts nunca ejecuta createClient.
// vi.hoisted evita el TDZ: vitest sube vi.mock por encima de las declaraciones.
const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}))

vi.mock('./index', () => ({
  supabase: { auth: mocks },
}))

import { alCambiarSesion, cerrarSesion, iniciarSesion, obtenerSesion } from './auth'

const sesionFake = { access_token: 'tok', user: { id: 'u1' } }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('iniciarSesion', () => {
  it('devuelve la sesión cuando las credenciales son válidas', async () => {
    mocks.signInWithPassword.mockResolvedValue({ data: { session: sesionFake }, error: null })
    const sesion = await iniciarSesion('a@b.com', 'secreto')
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secreto' })
    expect(sesion).toBe(sesionFake)
  })

  it('lanza el error cuando las credenciales son inválidas', async () => {
    const error = new Error('Invalid login credentials')
    mocks.signInWithPassword.mockResolvedValue({ data: { session: null }, error })
    await expect(iniciarSesion('a@b.com', 'mal')).rejects.toBe(error)
  })
})

describe('cerrarSesion', () => {
  it('llama a signOut', async () => {
    mocks.signOut.mockResolvedValue({ error: null })
    await cerrarSesion()
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })

  it('lanza el error si signOut falla', async () => {
    const error = new Error('network')
    mocks.signOut.mockResolvedValue({ error })
    await expect(cerrarSesion()).rejects.toBe(error)
  })
})

describe('obtenerSesion', () => {
  it('devuelve la sesión actual', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: sesionFake } })
    expect(await obtenerSesion()).toBe(sesionFake)
  })

  it('devuelve null cuando no hay sesión', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    expect(await obtenerSesion()).toBeNull()
  })
})

describe('alCambiarSesion', () => {
  it('registra el callback y devuelve una función para desuscribirse', () => {
    const unsubscribe = vi.fn()
    mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } })
    const callback = vi.fn()

    const cancelar = alCambiarSesion(callback)

    // Simula un evento de cambio de sesión emitido por Supabase.
    const handlerRegistrado = mocks.onAuthStateChange.mock.calls[0][0]
    handlerRegistrado('SIGNED_IN', sesionFake)
    expect(callback).toHaveBeenCalledWith(sesionFake)

    cancelar()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
