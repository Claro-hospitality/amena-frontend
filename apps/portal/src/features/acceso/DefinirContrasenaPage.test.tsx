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

import { DefinirContrasenaPage } from './DefinirContrasenaPage'

/** Monta la página en la ruta dada (el token viaja en el query string). */
function montar(ruta = '/definir-contrasena') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <DefinirContrasenaPage />
    </MemoryRouter>
  )
}

const MENSAJE_UNIFORME =
  'Si esa cuenta existe, te enviamos un enlace nuevo. Revisa tu correo (y la carpeta de spam).'

describe('DefinirContrasenaPage — enlace vencido o ya usado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sin token válido ofrece pedir un enlace nuevo, sin depender de un admin', async () => {
    montar()

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviarme un enlace nuevo/i })
    ).toBeInTheDocument()
  })

  it('cuando el token ya se usó, también ofrece el autoservicio', async () => {
    auth.verificarTokenAcceso.mockRejectedValue(new Error('token usado'))
    montar('/definir-contrasena?token_hash=abc&type=recovery')

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviarme un enlace nuevo/i })
    ).toBeInTheDocument()
  })

  it('pide el enlace para la plataforma del portal y muestra la respuesta', async () => {
    auth.solicitarAcceso.mockResolvedValue(MENSAJE_UNIFORME)
    const usuario = userEvent.setup()
    montar()

    await usuario.type(await screen.findByLabelText(/tu correo/i), 'ada@sozu.com')
    await usuario.click(screen.getByRole('button', { name: /enviarme un enlace nuevo/i }))

    expect(auth.solicitarAcceso).toHaveBeenCalledWith('ada@sozu.com', 'portal')
    expect(await screen.findByText(MENSAJE_UNIFORME)).toBeInTheDocument()
    // El formulario desaparece: nada invita a reintentar en bucle.
    expect(
      screen.queryByRole('button', { name: /enviarme un enlace nuevo/i })
    ).not.toBeInTheDocument()
  })

  it('no manda nada si el correo va vacío', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.click(
      await screen.findByRole('button', { name: /enviarme un enlace nuevo/i })
    )

    expect(auth.solicitarAcceso).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent(/escribe tu correo/i)
  })

  it('si el envío falla, lo dice y deja reintentar', async () => {
    auth.solicitarAcceso.mockRejectedValue(new Error('red caída'))
    const usuario = userEvent.setup()
    montar()

    await usuario.type(await screen.findByLabelText(/tu correo/i), 'ada@sozu.com')
    await usuario.click(screen.getByRole('button', { name: /enviarme un enlace nuevo/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos enviar el enlace/i)
    expect(
      screen.getByRole('button', { name: /enviarme un enlace nuevo/i })
    ).toBeInTheDocument()
  })
})
