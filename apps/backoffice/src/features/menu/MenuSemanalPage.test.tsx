import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aISO, esFinDeSemana } from '@amena/utils'

const menuApi = vi.hoisted(() => ({
  listarMenuSemana: vi.fn(),
  listarMenuRango: vi.fn(),
  agregarPlatilloADia: vi.fn(),
  quitarMenuDia: vi.fn(),
  copiarSemanaAnterior: vi.fn(),
}))
vi.mock('./api', () => menuApi)

const platApi = vi.hoisted(() => ({ listarPlatillos: vi.fn() }))
vi.mock('../platillos/api', () => platApi)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { MenuSemanalPage } from './MenuSemanalPage'

// Primer día hábil del mes actual — el calendario siempre lo muestra dentro del rango.
const diaHabil = (() => {
  const hoy = new Date()
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  while (esFinDeSemana(d)) d.setDate(d.getDate() + 1)
  return d
})()
const fechaObjetivo = aISO(diaHabil)

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
  it('muestra el calendario del mes con los platillos asignados', async () => {
    menuApi.listarMenuRango.mockResolvedValue([
      { id: 1, fecha: fechaObjetivo, platillo: platilloFake },
    ])
    renderizar('super_admin')
    expect((await screen.findAllByText('Milanesa con puré')).length).toBeGreaterThan(0)
  })

  it('rol sin permiso: no ve el módulo', () => {
    menuApi.listarMenuRango.mockResolvedValue([])
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
