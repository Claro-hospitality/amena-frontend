import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Sesión (helpers de auth) y consultas de rol (cliente supabase) mockeadas.
const auth = vi.hoisted(() => ({
  obtenerSesion: vi.fn(),
  alCambiarSesion: vi.fn(() => () => {}),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
const db = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('@amena/supabase/auth', () => auth)
vi.mock('@amena/supabase', () => ({ supabase: { rpc: db.rpc } }))

// El escáner es una pantalla pesada (cámara/Realtime); para el test de ruteo basta un stub.
vi.mock('../features/escaner/EscanerPage', () => ({
  EscanerPage: () => <h1>Escáner</h1>,
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

function stubRol(rol: string | null, debeCambiar = false) {
  db.rpc.mockImplementation((name: string) => {
    if (name === 'mi_perfil_backoffice') {
      return Promise.resolve({
        data: rol ? { rol, nombre: 'Test', debe_cambiar_password: debeCambiar } : null,
        error: null,
      })
    }
    return Promise.resolve({ data: null, error: null })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.alCambiarSesion.mockReturnValue(() => {})
})

describe('rutas protegidas del backoffice', () => {
  it('sin sesión redirige a /login', async () => {
    auth.obtenerSesion.mockResolvedValue(null)
    montar('/inicio')
    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText('Backoffice')).toBeInTheDocument()
  })

  it('super_admin llega a /inicio', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stubRol('super_admin')
    montar('/')
    expect(await screen.findByText(/panel del backoffice/i)).toBeInTheDocument()
  })

  it('finanzas llega a /inicio', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stubRol('finanzas')
    montar('/')
    expect(await screen.findByText(/panel del backoffice/i)).toBeInTheDocument()
  })

  it('mesero es redirigido a /escaner', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stubRol('mesero')
    montar('/')
    expect(await screen.findByRole('heading', { name: 'Escáner' })).toBeInTheDocument()
  })

  it('usuario sin rol interno → pantalla sin acceso', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stubRol(null)
    montar('/')
    expect(await screen.findByText(/no tienes acceso a este portal/i)).toBeInTheDocument()
  })

  it('con debe_cambiar_password fuerza el cambio de contraseña antes de entrar', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stubRol('super_admin', true)
    montar('/')
    expect(await screen.findByText(/cambia tu contraseña/i)).toBeInTheDocument()
  })
})
