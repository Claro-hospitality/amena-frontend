import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  verificarTokenAcceso: vi.fn(),
  definirPasswordAcceso: vi.fn(),
  solicitarAcceso: vi.fn(),
}))

vi.mock('@amena/supabase/auth', () => auth)
vi.mock('../recorrido/useRecorridoPortal', () => ({ programarRecorrido: vi.fn() }))

import { DefinirContrasenaPage } from './DefinirContrasenaPage'

const CON_TOKEN = '/definir-contrasena?token_hash=abc123&type=recovery'
const MENSAJE_UNIFORME = 'Si esa cuenta existe, te enviamos un enlace nuevo.'

function montar(ruta = CON_TOKEN) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <DefinirContrasenaPage />
    </MemoryRouter>
  )
}

/** Llena los dos campos con una contraseña válida y envía. */
async function guardar(usuario: ReturnType<typeof userEvent.setup>, pass = 'contrasena-larga') {
  await usuario.type(await screen.findByLabelText('Contraseña'), pass)
  await usuario.type(screen.getByLabelText(/confirmar/i), pass)
  await usuario.click(screen.getByRole('button', { name: /guardar y entrar/i }))
}

describe('DefinirContrasenaPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('NO canjea el token al abrir la página (así no lo quema un escáner de correo)', async () => {
    montar()

    // Se ve el formulario sin haber tocado el token: es de un solo uso y se gasta al guardar.
    expect(await screen.findByLabelText('Contraseña')).toBeInTheDocument()
    expect(auth.verificarTokenAcceso).not.toHaveBeenCalled()
  })

  it('canjea el token y define la contraseña al guardar', async () => {
    auth.verificarTokenAcceso.mockResolvedValue({})
    auth.definirPasswordAcceso.mockResolvedValue(undefined)
    const usuario = userEvent.setup()
    montar()

    await guardar(usuario)

    expect(auth.verificarTokenAcceso).toHaveBeenCalledWith('abc123')
    expect(auth.definirPasswordAcceso).toHaveBeenCalledWith('contrasena-larga')
  })

  it('si el token ya no sirve, lo dice al guardar y ofrece pedir otro', async () => {
    auth.verificarTokenAcceso.mockRejectedValue(new Error('otp_expired'))
    const usuario = userEvent.setup()
    montar()

    await guardar(usuario)

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviarme un enlace nuevo/i })
    ).toBeInTheDocument()
    // No se intentó guardar la contraseña con una sesión que no existe.
    expect(auth.definirPasswordAcceso).not.toHaveBeenCalled()
  })

  it('las validaciones de contraseña no gastan el token', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.type(await screen.findByLabelText('Contraseña'), 'corta')
    await usuario.type(screen.getByLabelText(/confirmar/i), 'corta')
    await usuario.click(screen.getByRole('button', { name: /guardar y entrar/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/al menos 8 caracteres/i)

    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena-larga')
    await usuario.click(screen.getByRole('button', { name: /guardar y entrar/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/no coinciden/i)

    expect(auth.verificarTokenAcceso).not.toHaveBeenCalled()
  })

  it('sin token en la URL, ofrece el autoservicio de inmediato', async () => {
    montar('/definir-contrasena')

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviarme un enlace nuevo/i })
    ).toBeInTheDocument()
  })

  it('el autoservicio pide el enlace para el portal y muestra la respuesta', async () => {
    auth.solicitarAcceso.mockResolvedValue(MENSAJE_UNIFORME)
    const usuario = userEvent.setup()
    montar('/definir-contrasena')

    await usuario.type(await screen.findByLabelText(/tu correo/i), 'ada@sozu.com')
    await usuario.click(screen.getByRole('button', { name: /enviarme un enlace nuevo/i }))

    expect(auth.solicitarAcceso).toHaveBeenCalledWith('ada@sozu.com', 'portal')
    expect(await screen.findByText(MENSAJE_UNIFORME)).toBeInTheDocument()
  })
})
