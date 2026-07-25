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
import { HistorialPage } from './HistorialPage'

const dias = diasHabiles(lunesDeSemana(new Date())).map(aISO)

function renderizar(tipo: TipoUsuarioPortal, esComensal = false) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo, esComensal }} />}>
            <Route index element={<HistorialPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HistorialPage', () => {
  it('resume la semana y lista los consumos', async () => {
    api.misCuotasSemana.mockResolvedValue([
      { fecha: dias[0], origen: 'declaracion', activo: true },
      { fecha: dias[1], origen: 'declaracion', activo: true },
      { fecha: dias[2], origen: 'declaracion', activo: true },
    ])
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar('colaborador')
    // 3 asignadas, 1 usada → quedan 2
    expect(await screen.findByText(/te quedan 2 de 3 comidas/i)).toBeInTheDocument()
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument()
  })

  it('un admin sin comensal no ve el módulo', () => {
    api.misCuotasSemana.mockResolvedValue([])
    api.misConsumos.mockResolvedValue([])
    renderizar('admin_empresa')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })

  it('un admin que también es comensal sí ve su historial', async () => {
    api.misCuotasSemana.mockResolvedValue([
      { fecha: dias[0], origen: 'declaracion', activo: true },
    ])
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar('admin_empresa', true)
    expect(await screen.findByText(/te quedan/i)).toBeInTheDocument()
  })
})
