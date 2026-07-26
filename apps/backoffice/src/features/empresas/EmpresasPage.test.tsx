import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos la capa de datos para controlar carga/vacío/datos/error sin red.
// datosFiscalesCompletos NO se mockea: se reexporta la implementación real para el badge.
const api = vi.hoisted(() => ({
  listarEmpresas: vi.fn(),
  crearEmpresa: vi.fn(),
  actualizarEmpresa: vi.fn(),
  cambiarEstadoEmpresa: vi.fn(),
  listarDatosFiscales: vi.fn(),
}))
vi.mock('./api', async (importActual) => {
  const actual = await importActual<typeof import('./api')>()
  return { ...api, datosFiscalesCompletos: actual.datosFiscalesCompletos }
})

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { EmpresasPage } from './EmpresasPage'

const empresaFake = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  precio_comida: 85,
  ciclo_facturacion: 'mensual' as const,
  activo: true,
  created_at: '',
  updated_at: '',
}

const fiscalCompleto = {
  id: 10,
  empresa_id: 1,
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: 'XAXX010101000',
  codigo_postal_fiscal: '06600',
  regimen_fiscal: '601',
  uso_cfdi: 'G03',
  email_facturacion: 'facturacion@empresa.com',
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
  api.listarDatosFiscales.mockResolvedValue([])
})

describe('EmpresasPage', () => {
  it('muestra la tabla con datos y el precio formateado', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    renderizar('super_admin')
    expect(await screen.findByText('Constructora Norte')).toBeInTheDocument()
    expect(screen.getByText('$85.00')).toBeInTheDocument()
  })

  it('muestra "Sin datos fiscales" cuando la empresa no tiene fila fiscal', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    api.listarDatosFiscales.mockResolvedValue([])
    renderizar('super_admin')
    await screen.findByText('Constructora Norte')
    expect(await screen.findByText('Sin datos fiscales')).toBeInTheDocument()
    expect(screen.queryByText('Facturable')).not.toBeInTheDocument()
  })

  it('muestra "Facturable" cuando la empresa tiene datos fiscales completos', async () => {
    api.listarEmpresas.mockResolvedValue([empresaFake])
    api.listarDatosFiscales.mockResolvedValue([fiscalCompleto])
    renderizar('super_admin')
    await screen.findByText('Constructora Norte')
    expect(await screen.findByText('Facturable')).toBeInTheDocument()
    expect(screen.queryByText('Sin datos fiscales')).not.toBeInTheDocument()
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
