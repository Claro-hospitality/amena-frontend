import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const empresasApi = vi.hoisted(() => ({
  listarEmpresas: vi.fn(),
  crearEmpresa: vi.fn(),
  actualizarEmpresa: vi.fn(),
  cambiarEstadoEmpresa: vi.fn(),
}))
vi.mock('./api', () => empresasApi)

const resumenApi = vi.hoisted(() => ({ obtenerResumenEmpresa: vi.fn() }))
vi.mock('./resumenApi', () => resumenApi)

const cierresApi = vi.hoisted(() => ({ listarCierres: vi.fn(), ejecutarCorteManual: vi.fn() }))
vi.mock('../cierres/api', () => cierresApi)

const colaboradoresApi = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  listarColaboradoresEmpresa: vi.fn(),
  altaUsuarioPortal: vi.fn(),
  nombreEmpresa: () => '—',
}))
vi.mock('../colaboradores/api', () => colaboradoresApi)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { EmpresaDetallePage } from './EmpresaDetallePage'

const empresaFake = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: null,
  precio_comida: 100,
  ciclo_facturacion: 'mensual' as const,
  activo: true,
  created_at: '',
  updated_at: '',
}

const resumenFake = {
  semana_inicio: '2026-07-20',
  precio_comida: 100,
  ciclo_facturacion: 'mensual' as const,
  en_curso: { comprometidas: 5, extras: 1, consumidas: 3, faltan: 2, gasto: 300 },
  gasto_periodo: 800,
  gasto_historico_total: 1500,
  colaboradores_activos: 4,
}

function renderizar(rol: RolBackoffice, empresaId = '1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/empresas/${empresaId}`]}>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route path="empresas/:empresaId" element={<EmpresaDetallePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  empresasApi.listarEmpresas.mockResolvedValue([empresaFake])
  resumenApi.obtenerResumenEmpresa.mockResolvedValue(resumenFake)
  cierresApi.listarCierres.mockResolvedValue([])
  colaboradoresApi.listarColaboradoresEmpresa.mockResolvedValue([
    { id: 1, activo: true, nombre: 'Juan Pérez', email: 'juan@x.com', empresa_id: 1, empresa: null },
  ])
})

describe('EmpresaDetallePage', () => {
  it('muestra el encabezado, las métricas y el gasto histórico', async () => {
    renderizar('super_admin')
    expect(await screen.findByRole('heading', { name: 'Constructora Norte' })).toBeInTheDocument()
    // Métricas de la semana en curso y gasto (query aparte: esperar a que resuelva).
    expect(await screen.findByText('Semana en curso')).toBeInTheDocument()
    expect(screen.getByText('Faltan')).toBeInTheDocument()
    expect(screen.getByText('$1,500.00')).toBeInTheDocument() // gasto histórico
  })

  it('lista los colaboradores de la empresa', async () => {
    renderizar('super_admin')
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Colaboradores' })).toBeInTheDocument()
  })

  it('super_admin ve las acciones de editar/estado; finanzas no', async () => {
    renderizar('finanzas')
    await screen.findByRole('heading', { name: 'Constructora Norte' })
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nuevo usuario' })).not.toBeInTheDocument()
  })

  it('empresa inexistente muestra "no encontrada"', async () => {
    empresasApi.listarEmpresas.mockResolvedValue([empresaFake])
    renderizar('super_admin', '999')
    expect(await screen.findByText(/empresa no encontrada/i)).toBeInTheDocument()
  })

  it('niega el acceso a roles sin permiso (mesero)', () => {
    renderizar('mesero')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
