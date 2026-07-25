import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aISO, diasHabiles, lunesDeSemana } from '@amena/utils'

const api = vi.hoisted(() => ({
  obtenerMiColaborador: vi.fn(),
  estadoDeHoy: vi.fn(),
  menuDelDia: vi.fn(),
  menuSemana: vi.fn(),
  misCuotasSemana: vi.fn(),
  misConsumos: vi.fn(),
}))
vi.mock('./api', () => api)

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { MenuColaboradorPage } from './MenuColaboradorPage'

const lunes = aISO(lunesDeSemana(new Date()))
const dia0 = diasHabiles(lunesDeSemana(new Date())).map(aISO)[0]

function renderizar(tipo: TipoUsuarioPortal, esComensal = false) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo, esComensal }} />}>
            <Route index element={<MenuColaboradorPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MenuColaboradorPage', () => {
  it('muestra los platillos del menú', async () => {
    api.menuSemana.mockResolvedValue([
      { fecha: dia0, platillo: { nombre: 'Milanesa con puré', foto_url: null } },
    ])
    renderizar('colaborador')
    expect(await screen.findByText('Milanesa con puré')).toBeInTheDocument()
  })

  it('estado vacío cuando la semana no tiene menú', async () => {
    api.menuSemana.mockResolvedValue([])
    renderizar('colaborador')
    expect(await screen.findByText(/sin menú esta semana/i)).toBeInTheDocument()
  })

  it('un admin sin comensal no ve el módulo', () => {
    api.menuSemana.mockResolvedValue([])
    renderizar('admin_empresa')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })

  it('un admin que también es comensal sí ve el menú', async () => {
    api.menuSemana.mockResolvedValue([
      { fecha: dia0, platillo: { nombre: 'Milanesa con puré', foto_url: null } },
    ])
    renderizar('admin_empresa', true)
    expect(await screen.findByText('Milanesa con puré')).toBeInTheDocument()
  })

  it('usa la semana actual como referencia', () => {
    expect(lunes).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
