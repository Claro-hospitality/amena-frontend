import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos la capa de datos para controlar carga/vacío/datos/error sin red.
const api = vi.hoisted(() => ({
  listarEmpresas: vi.fn(),
  crearEmpresa: vi.fn(),
  actualizarEmpresa: vi.fn(),
  cambiarEstadoEmpresa: vi.fn(),
}))
vi.mock('./api', () => api)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { EmpresasPage } from './EmpresasPage'

const empresaFake = {
  id: 'e1',
  nombre_comercial: 'Constructora Norte',
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: null,
  precio_comida: 85,
  ciclo_facturacion: 'mensual' as const,
  activo: true,
  created_at: '',
  updated_at: '',
}

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route index element={<EmpresasPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EmpresasPage', () => {
  it('muestra la tabla con datos y el precio formateado', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    renderizar('super_admin')
    expect(await screen.findByText('Constructora Norte')).toBeInTheDocument()
    expect(screen.getByText('$85.00')).toBeInTheDocument()
  })

  it('muestra el estado vacío con CTA para super_admin', async () => {
    api.listarEmpresas.mockResolvedValue([])
    renderizar('super_admin')
    expect(await screen.findByText(/aún no hay empresas/i)).toBeInTheDocument()
  })

  it('muestra el estado de error cuando falla la carga', async () => {
    api.listarEmpresas.mockRejectedValue(new Error('boom'))
    renderizar('super_admin')
    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('muestra skeleton mientras carga (sin tabla ni vacío)', () => {
    api.listarEmpresas.mockReturnValue(new Promise(() => {}))
    renderizar('super_admin')
    expect(screen.getByRole('button', { name: /nueva empresa/i })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText(/aún no hay empresas/i)).not.toBeInTheDocument()
  })

  it('super_admin ve crear y acciones por fila', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    renderizar('super_admin')
    await screen.findByText('Constructora Norte') // espera a que carguen los datos
    expect(screen.getByRole('button', { name: /nueva empresa/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /editar constructora norte/i })
    ).toBeInTheDocument()
  })

  it('finanzas ve el listado sin crear ni acciones', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    renderizar('finanzas')
    expect(await screen.findByText('Constructora Norte')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nueva empresa/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
  })
})
