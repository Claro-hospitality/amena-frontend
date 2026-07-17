import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const colabApi = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  obtenerMiEmpresaId: vi.fn(),
  crearColaborador: vi.fn(),
  actualizarColaborador: vi.fn(),
  cambiarEstadoColaborador: vi.fn(),
}))
vi.mock('../colaboradores/api', () => colabApi)

const cuotasApi = vi.hoisted(() => ({
  listarCuotasSemana: vi.fn(),
  listarConsumosSemana: vi.fn(),
  declararCuotas: vi.fn(),
}))
vi.mock('./api', () => cuotasApi)

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { DeclararCuotasPage } from './DeclararCuotasPage'

const colaborador = {
  id: 'c1',
  empresa_id: 'emp1',
  user_id: null,
  nombre: 'Ana López',
  email: null,
  activo: true,
  created_at: '',
  updated_at: '',
  empresa: { nombre: 'Constructora' },
}

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
            <Route index element={<DeclararCuotasPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  colabApi.listarColaboradores.mockResolvedValue([colaborador])
  colabApi.obtenerMiEmpresaId.mockResolvedValue('emp1')
  cuotasApi.listarCuotasSemana.mockResolvedValue([])
  cuotasApi.listarConsumosSemana.mockResolvedValue([])
  cuotasApi.declararCuotas.mockResolvedValue({ creadas: 5, reactivadas: 0, ya_existentes: 0 })
})

describe('DeclararCuotasPage', () => {
  it('sin selección, el botón Declarar está deshabilitado', async () => {
    renderizar('admin_empresa')
    await screen.findByText('Ana López')
    expect(screen.getByRole('button', { name: 'Declarar' })).toBeDisabled()
  })

  it('"Todos, toda la semana" arma la declaración y la envía por la RPC', async () => {
    const user = userEvent.setup()
    renderizar('admin_empresa')
    await screen.findByText('Ana López')

    await user.click(screen.getByRole('button', { name: /todos, toda la semana/i }))

    // La próxima semana tiene 5 días hábiles futuros → 5 comidas para 1 colaborador.
    expect(await screen.findByText(/5 comidas · 1 colaborador/i)).toBeInTheDocument()

    const declarar = screen.getByRole('button', { name: 'Declarar' })
    expect(declarar).toBeEnabled()
    await user.click(declarar)

    // Confirmación
    const dialogo = await screen.findByRole('alertdialog')
    expect(within(dialogo).getByText(/declararás/i)).toBeInTheDocument()
    await user.click(within(dialogo).getByRole('button', { name: 'Declarar' }))

    expect(cuotasApi.declararCuotas).toHaveBeenCalledTimes(1)
    const [empresaId, declaracion] = cuotasApi.declararCuotas.mock.calls[0]
    expect(empresaId).toBe('emp1')
    expect(declaracion).toHaveLength(1)
    expect(declaracion[0]).toMatchObject({ colaborador_id: 'c1' })
    expect(declaracion[0].fechas).toHaveLength(5)
  })

  it('un tipo que no es admin_empresa no ve el módulo', () => {
    renderizar('colaborador')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
