import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Controlamos la sesión mockeando los helpers de @amena/supabase/auth.
const mocks = vi.hoisted(() => ({
  obtenerSesion: vi.fn(),
  alCambiarSesion: vi.fn(() => () => {}),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))

vi.mock('@amena/supabase/auth', () => mocks)

import App from '../App'
import { AuthProvider } from './AuthProvider'

function montar(rutaInicial: string) {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  )
}

const sesionFake = { access_token: 'tok', user: { id: 'u1' } }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.alCambiarSesion.mockReturnValue(() => {})
})

describe('flujo de rutas protegidas', () => {
  it('redirige a /login al entrar a una ruta protegida sin sesión', async () => {
    mocks.obtenerSesion.mockResolvedValue(null)

    montar('/inicio')

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText('Portal de empresas')).toBeInTheDocument()
    expect(screen.queryByText(/portal de la empresa/i)).not.toBeInTheDocument()
  })

  it('muestra la ruta protegida cuando hay sesión y el acceso es concedido', async () => {
    mocks.obtenerSesion.mockResolvedValue(sesionFake)

    montar('/inicio')

    expect(await screen.findByText(/portal de la empresa/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
  })
})
