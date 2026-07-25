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

// Inicio y Mi QR son pesados (menú/QR/queries); para el test de RUTEO basta un stub que
// marque a qué página aterriza cada tipo.
vi.mock('../features/inicio/InicioPage', () => ({
  InicioPage: () => <h1>Inicio</h1>,
}))
vi.mock('../features/colaborador/MiCredencialPage', () => ({
  MiCredencialPage: () => <h1>Mi QR</h1>,
}))
vi.mock('../features/colaboradores/ColaboradoresPage', () => ({
  ColaboradoresPage: () => <h1>Colaboradores</h1>,
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

  it('admin_empresa aterriza en /inicio', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stub({ empresas: [1] })
    montar('/')
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
  })

  it('colaborador aterriza en /mi-qr', async () => {
    auth.obtenerSesion.mockResolvedValue(sesionFake)
    stub({ empresas: [], comensales: [1] })
    montar('/')
    expect(await screen.findByRole('heading', { name: 'Mi QR' })).toBeInTheDocument()
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

  // Rutas viejas → nuevas (bookmarks/correos que puedan seguir apuntando a los paths previos).
  describe('redirecciones de rutas viejas', () => {
    it('/historial → /mi-qr', async () => {
      auth.obtenerSesion.mockResolvedValue(sesionFake)
      stub({ empresas: [], comensales: [1] })
      montar('/historial')
      expect(await screen.findByRole('heading', { name: 'Mi QR' })).toBeInTheDocument()
    })

    it('/colaboradores → /empresa/colaboradores', async () => {
      auth.obtenerSesion.mockResolvedValue(sesionFake)
      stub({ empresas: [1] })
      montar('/colaboradores')
      expect(await screen.findByRole('heading', { name: 'Colaboradores' })).toBeInTheDocument()
    })
  })
})
