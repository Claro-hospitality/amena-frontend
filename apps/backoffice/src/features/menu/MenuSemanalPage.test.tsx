import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aISO, diasHabiles, lunesDeSemana } from '@amena/utils'

const menuApi = vi.hoisted(() => ({
  listarMenuSemana: vi.fn(),
  agregarPlatilloADia: vi.fn(),
  quitarMenuDia: vi.fn(),
  copiarSemanaAnterior: vi.fn(),
}))
vi.mock('./api', () => menuApi)

const platApi = vi.hoisted(() => ({ listarPlatillos: vi.fn() }))
vi.mock('../platillos/api', () => platApi)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { MenuSemanalPage } from './MenuSemanalPage'

const semanaActual = diasHabiles(lunesDeSemana(new Date())).map(aISO)
const platilloFake = {
  id: 1,
  nombre: 'Milanesa con puré',
  descripcion: null,
  foto_url: null,
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
            <Route index element={<MenuSemanalPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  platApi.listarPlatillos.mockResolvedValue([platilloFake])
})

describe('MenuSemanalPage', () => {
  it('semana vacía: ofrece copiar la semana anterior', async () => {
    menuApi.listarMenuSemana.mockResolvedValue([])
    renderizar('super_admin')
    expect(
      await screen.findByRole('button', { name: /copiar semana anterior/i })
    ).toBeInTheDocument()
  })

  it('con platillos: muestra el asignado y ya no ofrece copiar', async () => {
    menuApi.listarMenuSemana.mockResolvedValue([
      { id: 1, fecha: semanaActual[0], platillo: platilloFake },
    ])
    renderizar('super_admin')
    expect((await screen.findAllByText('Milanesa con puré')).length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /copiar semana anterior/i })
    ).not.toBeInTheDocument()
  })

  it('rol sin permiso: no ve el módulo', () => {
    menuApi.listarMenuSemana.mockResolvedValue([])
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
