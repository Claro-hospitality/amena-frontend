import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarCierres: vi.fn(),
  ejecutarCierreManual: vi.fn(),
}))
vi.mock('./api', () => api)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { CierresPage } from './CierresPage'

const cierreConstructora = {
  id: 'c1',
  empresa_id: 'e1',
  factura_id: null,
  semana_inicio: '2026-07-13',
  comprometidas: 10,
  consumidas: 8,
  extras: 2,
  precio_unitario: 85,
  monto_total: 680,
  estado: 'cerrado' as const,
  created_at: '',
  updated_at: '',
  empresa: { nombre: 'Constructora Norte' },
}
const cierreEstudio = {
  ...cierreConstructora,
  id: 'c2',
  empresa_id: 'e2',
  semana_inicio: '2026-07-06',
  monto_total: 340,
  empresa: { nombre: 'Estudio Creativo Sur' },
}

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route index element={<CierresPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.listarCierres.mockResolvedValue([cierreConstructora, cierreEstudio])
  api.ejecutarCierreManual.mockResolvedValue({
    corrio: true,
    resultado: { semana_inicio: '2026-07-13', generados: 2, ya_existentes: 1, empresas: [] },
  })
})

describe('CierresPage', () => {
  it('muestra los cierres con semana y montos formateados (super_admin)', async () => {
    renderizar('super_admin')
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Constructora Norte')).toBeInTheDocument()
    expect(within(tabla).getAllByText('$85.00').length).toBe(2) // precio unitario en ambas filas
    expect(within(tabla).getByText('$680.00')).toBeInTheDocument() // monto Constructora
    expect(within(tabla).getByText('$340.00')).toBeInTheDocument() // monto Estudio
    expect(within(tabla).getAllByText(/jul 2026/).length).toBeGreaterThan(0)
  })

  it('super_admin ve el botón de ejecutar cierre', async () => {
    renderizar('super_admin')
    await screen.findByRole('table')
    expect(screen.getByRole('button', { name: 'Ejecutar cierre ahora' })).toBeInTheDocument()
  })

  it('finanzas ve el listado sin el botón de cierre', async () => {
    renderizar('finanzas')
    await screen.findByRole('table')
    expect(
      screen.queryByRole('button', { name: 'Ejecutar cierre ahora' })
    ).not.toBeInTheDocument()
  })

  it('niega el acceso a otros roles (mesero)', () => {
    renderizar('mesero')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })

  it('muestra skeleton mientras carga (sin tabla)', () => {
    api.listarCierres.mockReturnValue(new Promise(() => {}))
    renderizar('super_admin')
    expect(screen.getByRole('button', { name: /ejecutar cierre/i })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío sin datos', async () => {
    api.listarCierres.mockResolvedValue([])
    renderizar('super_admin')
    expect(await screen.findByText(/aún no hay cierres/i)).toBeInTheDocument()
  })

  it('muestra el estado de error y permite reintentar', async () => {
    api.listarCierres.mockRejectedValue(new Error('boom'))
    renderizar('super_admin')
    expect(await screen.findByText(/no se pudieron cargar los cierres/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('filtra por empresa', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Constructora Norte')).toBeInTheDocument()
    expect(within(tabla).getByText('Estudio Creativo Sur')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Filtrar por empresa'))
    await user.click(await screen.findByRole('option', { name: 'Estudio Creativo Sur' }))

    const tablaFiltrada = screen.getByRole('table')
    expect(within(tablaFiltrada).queryByText('Constructora Norte')).not.toBeInTheDocument()
    expect(within(tablaFiltrada).getByText('Estudio Creativo Sur')).toBeInTheDocument()
  })

  it('ejecuta el cierre manual tras confirmar', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    await screen.findByRole('table')

    await user.click(screen.getByRole('button', { name: 'Ejecutar cierre ahora' }))
    const dialogo = await screen.findByRole('alertdialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Ejecutar cierre' }))

    await waitFor(() => expect(api.ejecutarCierreManual).toHaveBeenCalled())
  })

  it('abre el detalle de un cierre', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    await screen.findByRole('table')

    await user.click(screen.getByRole('button', { name: /ver detalle de constructora norte/i }))
    const dialogo = await screen.findByRole('dialog')
    expect(within(dialogo).getByText(/sin factura/i)).toBeInTheDocument()
  })
})
