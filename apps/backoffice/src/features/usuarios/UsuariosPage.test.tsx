import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock de queries (evita el cliente de Supabase) y de useAuth (id del usuario actual).
const q = vi.hoisted(() => ({
  useUsuarios: vi.fn(),
  useCrearUsuario: vi.fn(),
  useResetearPassword: vi.fn(),
  useCambiarRol: vi.fn(),
  useEstablecerEstado: vi.fn(),
}))
vi.mock('./queries', () => q)
vi.mock('../../auth/useAuth', () => ({ useAuth: () => ({ session: { user: { id: 'me' } } }) }))

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { UsuariosPage } from './UsuariosPage'

const usuarios = [
  {
    user_id: 'u2',
    nombre: 'Otra Persona',
    rol: 'consulta',
    activo: true,
    email: 'otra@amena.com',
    debe_cambiar_password: false,
  },
  {
    user_id: 'me',
    nombre: 'Yo Super',
    rol: 'super_admin',
    activo: true,
    email: 'yo@amena.com',
    debe_cambiar_password: false,
  },
]

const mutacionInerte = { mutateAsync: vi.fn(), isPending: false }

function renderizar(rol: RolBackoffice) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Outlet context={{ rol }} />}>
          <Route index element={<UsuariosPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  q.useUsuarios.mockReturnValue({ data: usuarios, isLoading: false, isError: false })
  q.useCrearUsuario.mockReturnValue(mutacionInerte)
  q.useResetearPassword.mockReturnValue(mutacionInerte)
  q.useCambiarRol.mockReturnValue(mutacionInerte)
  q.useEstablecerEstado.mockReturnValue(mutacionInerte)
})

describe('UsuariosPage', () => {
  it('un rol que no es super_admin no ve el módulo', () => {
    renderizar('consulta')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })

  it('lista los usuarios internos con su email', () => {
    renderizar('super_admin')
    expect(screen.getByText('Yo Super')).toBeInTheDocument()
    expect(screen.getByText('Otra Persona')).toBeInTheDocument()
    expect(screen.getByText('yo@amena.com')).toBeInTheDocument()
  })

  it('salvaguardas: la acción "Cambiar rol" está deshabilitada para mí / el último super_admin, y habilitada para otros', () => {
    renderizar('super_admin')
    const botones = screen.getAllByLabelText('Cambiar rol') as HTMLButtonElement[]
    expect(botones.some((b) => b.disabled)).toBe(true) // yo (y último super_admin)
    expect(botones.some((b) => !b.disabled)).toBe(true) // la otra persona
  })

  it('abre el diálogo de alta con "Nuevo usuario"', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    await user.click(screen.getByRole('button', { name: /nuevo usuario/i }))
    expect(await screen.findByText(/nuevo usuario del backoffice/i)).toBeInTheDocument()
  })
})
