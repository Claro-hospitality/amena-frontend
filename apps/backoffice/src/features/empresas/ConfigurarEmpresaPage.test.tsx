import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./queries', () => {
  const empresa = {
    id: 1,
    nombre_comercial: 'Constructora Norte',
    precio_comida: 100,
    ciclo_facturacion: 'mensual',
    activo: true,
    created_at: '',
    updated_at: '',
    modo_consumo: 'reserva',
    dias_permitidos: [],
    limite_diario: null,
  }
  return {
    useEmpresas: () => ({ data: [empresa], isLoading: false, isError: false, refetch: vi.fn() }),
    useActualizarEmpresa: () => ({ mutate: vi.fn(), isPending: false }),
  }
})

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { ConfigurarEmpresaPage } from './ConfigurarEmpresaPage'

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/empresas/1/configurar']}>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route path="empresas/:empresaId/configurar" element={<ConfigurarEmpresaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ConfigurarEmpresaPage', () => {
  it('super_admin: ve la política y las acciones Editar/Desactivar', async () => {
    renderizar('super_admin')
    expect(await screen.findByRole('heading', { name: 'Constructora Norte' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desactivar' })).toBeInTheDocument()
    // La política de consumo es editable (switch de modo libre visible).
    expect(screen.getByRole('switch', { name: /modo libre/i })).toBeInTheDocument()
  })

  it('finanzas: no tiene acceso', () => {
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
