import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  obtenerSesion: vi.fn(),
  alCambiarSesion: vi.fn(() => () => {}),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
const db = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('@amena/supabase/auth', () => auth)
vi.mock('@amena/supabase', () => ({ supabase: { rpc: db.rpc } }))

// El inicio del colaborador es pesado (QR/queries); para el test de ruteo basta un stub.
vi.mock('../features/colaborador/InicioColaboradorPage', () => ({
  InicioColaboradorPage: () => <h1>Mi espacio</h1>,
}))

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

function stub({ empresas = [] as number[], comensales = [] as number[] }) {
  db.rpc.mockImplementation((name: string) => {
    const map: Record<string, number[]> = {
      mis_empresas_admin: empresas,
      mis_comensales: comensales,
    }
    return Promise.resolve({ data: map[name] ?? [], error: null })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.alCambiarSesion.mockReturnValue(() => {})
})

describe('rutas protegidas del portal', () => {
  it('sin sesión redirige a /login', async () => {
    auth.obtenerSesion.mockResolvedValue(null)
    montar('/inicio')
    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText('Portal de empresas')).toBeInTheDocument()
  })

  it('admin_empresa llega a /inicio', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stub({ empresas: [1] })
    montar('/')
    expect(await screen.findByText(/panel de la empresa/i)).toBeInTheDocument()
  })

  it('colaborador es redirigido a su inicio', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stub({ empresas: [], comensales: [1] })
    montar('/')
    expect(await screen.findByRole('heading', { name: 'Mi espacio' })).toBeInTheDocument()
  })

  it('usuario sin acceso → pantalla sin acceso', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stub({ empresas: [], comensales: [] })
    montar('/')
    expect(await screen.findByText(/no tienes acceso a este portal/i)).toBeInTheDocument()
  })

  it('con must_change_password exige cambiar la contraseña antes de entrar', async () => {
    auth.obtenerSesion.mockResolvedValue({
      access_token: 'tok',
      user: { id: 'u1', user_metadata: { must_change_password: true } },
    })
    stub({ empresas: [1] })
    montar('/')
    expect(await screen.findByRole('button', { name: /guardar contraseña/i })).toBeInTheDocument()
    expect(screen.getByText(/cambia tu contraseña/i)).toBeInTheDocument()
  })
})
