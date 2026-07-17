import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aISO, diasHabiles, lunesDeSemana } from '@amena/utils'

const cuotasApi = vi.hoisted(() => ({
  listarCuotasSemana: vi.fn(),
  listarConsumosSemana: vi.fn(),
  declararCuotas: vi.fn(),
}))
vi.mock('./api', () => cuotasApi)

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { CuotasSemanaPage } from './CuotasSemanaPage'

const dias = diasHabiles(lunesDeSemana(new Date())).map(aISO)
const dia0 = dias[0]

const cuotas = [
  { id: 'q1', fecha: dia0, origen: 'declaracion', colaborador: { id: 'a', nombre: 'Ana López' } },
  { id: 'q2', fecha: dia0, origen: 'extra', colaborador: { id: 'b', nombre: 'Beto Ruiz' } },
]

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
            <Route index element={<CuotasSemanaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  cuotasApi.listarCuotasSemana.mockResolvedValue(cuotas)
  cuotasApi.listarConsumosSemana.mockResolvedValue([{ colaborador_id: 'a', fecha: dia0 }])
})

describe('CuotasSemanaPage', () => {
  it('muestra cuotas, distingue extras y consumidas vs disponibles', async () => {
    renderizar('admin_empresa')
    await screen.findByText('Ana López')
    expect(screen.getByText('Beto Ruiz')).toBeInTheDocument()
    // Beto es extra; Ana consumió (hay consumo), Beto no.
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.getByText('Consumida')).toBeInTheDocument()
    expect(screen.getByText('Disponible')).toBeInTheDocument()
  })

  it('en una semana totalmente pasada no ofrece "Agregar extra"', async () => {
    const user = userEvent.setup()
    renderizar('admin_empresa')
    await screen.findByText('Ana López')
    // Ir a la semana anterior (siempre completamente en el pasado).
    await user.click(screen.getByRole('button', { name: /semana anterior/i }))
    expect(screen.queryByRole('button', { name: /agregar extra/i })).not.toBeInTheDocument()
  })

  it('un tipo que no es admin_empresa no ve el módulo', () => {
    renderizar('colaborador')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
