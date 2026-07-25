import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarMisCortes: vi.fn(),
}))
vi.mock('./api', () => api)

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { CortesPage } from './CortesPage'

const corte = {
  id: 'c1',
  empresa_id: 'e1',
  factura_id: null,
  semana_inicio: '2026-07-13',
  reservadas: 10,
  consumidas: 8,
  extras: 2,
  precio_unitario: 85,
  monto_total: 680,
  estado: 'cerrado' as const,
  created_at: '',
  updated_at: '',
}

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
            <Route index element={<CortesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.listarMisCortes.mockResolvedValue([corte])
})

describe('CortesPage (portal)', () => {
  it('muestra una card por corte con semana y monto (admin_empresa)', async () => {
    renderizar('admin_empresa')
    expect(await screen.findByText(/13.*jul 2026/)).toBeInTheDocument()
    expect(screen.getByText('$680.00')).toBeInTheDocument()
  })

  it('niega el acceso al colaborador', () => {
    renderizar('colaborador')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })

  it('muestra el estado vacío sin cortes', async () => {
    api.listarMisCortes.mockResolvedValue([])
    renderizar('admin_empresa')
    expect(await screen.findByText(/aún no hay cortes de tu empresa/i)).toBeInTheDocument()
  })

  it('muestra el estado de error y permite reintentar', async () => {
    api.listarMisCortes.mockRejectedValue(new Error('boom'))
    renderizar('admin_empresa')
    expect(await screen.findByText(/no se pudieron cargar los cortes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
