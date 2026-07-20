import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos la capa de datos (evita tocar Supabase). nombreEmpresa se conserva simple.
const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  crearColaborador: vi.fn(),
}))
vi.mock('./api', () => ({
  ...api,
  nombreEmpresa: (c: { empresa: { nombre_comercial: string | null; razon_social: string } | null }) =>
    c.empresa?.nombre_comercial ?? c.empresa?.razon_social ?? '—',
}))
vi.mock('../empresas/queries', () => ({
  useEmpresas: () => ({
    data: [{ id: 'e1', nombre_comercial: 'Constructora Norte', razon_social: 'CN SA', activo: true }],
  }),
}))

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { ColaboradoresPage } from './ColaboradoresPage'

const colaboradorFake = {
  id: 'c1',
  empresa_id: 'e1',
  nombre: 'Juan Pérez',
  email: 'juan@cn.com',
  activo: true,
  user_id: null,
  created_at: '',
  updated_at: '',
  empresa: { nombre_comercial: 'Constructora Norte', razon_social: 'CN SA' },
}

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route index element={<ColaboradoresPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ColaboradoresPage', () => {
  it('muestra el listado con su empresa', async () => {
    api.listarColaboradores.mockResolvedValue([colaboradorFake])
    renderizar('super_admin')
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Constructora Norte')).toBeInTheDocument()
  })

  it('muestra el estado vacío con CTA', async () => {
    api.listarColaboradores.mockResolvedValue([])
    renderizar('super_admin')
    expect(await screen.findByText(/aún no hay colaboradores/i)).toBeInTheDocument()
  })

  it('muestra el estado de error', async () => {
    api.listarColaboradores.mockRejectedValue(new Error('boom'))
    renderizar('super_admin')
    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('super_admin puede abrir el formulario de alta', async () => {
    api.listarColaboradores.mockResolvedValue([colaboradorFake])
    renderizar('super_admin')
    await screen.findByText('Juan Pérez')
    await userEvent.click(screen.getByRole('button', { name: /nuevo colaborador/i }))
    expect(await screen.findByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('niega el acceso a roles que no son super_admin', async () => {
    api.listarColaboradores.mockResolvedValue([])
    renderizar('finanzas')
    expect(await screen.findByText(/no tienes acceso/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nuevo colaborador/i })).not.toBeInTheDocument()
  })
})
