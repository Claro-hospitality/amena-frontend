import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  obtenerMiEmpresaId: vi.fn(),
  crearColaborador: vi.fn(),
  actualizarColaborador: vi.fn(),
  cambiarEstadoColaborador: vi.fn(),
}))
vi.mock('./api', () => api)
vi.mock('qrcode.react', () => ({
  QRCodeSVG: () => null,
  QRCodeCanvas: () => null,
}))

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { ColaboradoresPage } from './ColaboradoresPage'

const colaboradorFake = {
  id: '10000000-0000-0000-0000-000000000001',
  empresa_id: 'e1',
  user_id: null,
  nombre: 'María López',
  email: 'maria@empresa.com',
  activo: true,
  created_at: '',
  updated_at: '',
  empresa: { nombre: 'Constructora Norte' },
}

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
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
  it('muestra los colaboradores y la acción Ver QR', async () => {
    api.listarColaboradores.mockResolvedValue([colaboradorFake])
    renderizar('admin_empresa')
    expect((await screen.findAllByText('María López')).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /ver qr/i }).length).toBeGreaterThan(0)
  })

  it('muestra el estado vacío con CTA', async () => {
    api.listarColaboradores.mockResolvedValue([])
    renderizar('admin_empresa')
    expect(await screen.findByText(/aún no hay colaboradores/i)).toBeInTheDocument()
  })

  it('muestra el estado de error', async () => {
    api.listarColaboradores.mockRejectedValue(new Error('boom'))
    renderizar('admin_empresa')
    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('muestra skeleton mientras carga (sin tabla ni vacío)', () => {
    api.listarColaboradores.mockReturnValue(new Promise(() => {}))
    renderizar('admin_empresa')
    expect(screen.getByRole('button', { name: /nuevo/i })).toBeInTheDocument()
    expect(screen.queryByText(/aún no hay colaboradores/i)).not.toBeInTheDocument()
  })
})
