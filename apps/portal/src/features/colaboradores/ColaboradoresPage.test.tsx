import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  obtenerMiEmpresaId: vi.fn(),
  crearColaborador: vi.fn(),
  actualizarColaborador: vi.fn(),
  cambiarEstadoColaborador: vi.fn(),
  establecerConsumoLibre: vi.fn(),
  resetearPasswordColaborador: vi.fn(),
  empresaEnModoLibre: (c: { politica?: { modo_consumo?: string } | null }) =>
    c.politica?.modo_consumo === 'libre',
}))
vi.mock('./api', () => api)
vi.mock('qrcode.react', () => ({
  QRCodeSVG: () => null,
  QRCodeCanvas: () => null,
}))

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { ColaboradoresPage } from './ColaboradoresPage'
import { crearColaboradorFake, politicaLibreFake } from './testFactory'

const colaboradorFake = crearColaboradorFake()

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
            <Route index element={<ColaboradoresPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ColaboradoresPage', () => {
  it('muestra los colaboradores y la acción Ver QR', async () => {
    api.listarColaboradores.mockResolvedValue([colaboradorFake])
    renderizar('admin_empresa')
    expect((await screen.findAllByText('María López')).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /ver qr/i }).length).toBeGreaterThan(0)
  })

  it('muestra el estado vacío con CTA', async () => {
    api.listarColaboradores.mockResolvedValue([])
    renderizar('admin_empresa')
    expect(await screen.findByText(/aún no hay colaboradores/i)).toBeInTheDocument()
  })

  it('muestra el estado de error', async () => {
    api.listarColaboradores.mockRejectedValue(new Error('boom'))
    renderizar('admin_empresa')
    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('muestra skeleton mientras carga (sin tabla ni vacío)', () => {
    api.listarColaboradores.mockReturnValue(new Promise(() => {}))
    renderizar('admin_empresa')
    expect(screen.getByRole('button', { name: /nuevo/i })).toBeInTheDocument()
    expect(screen.queryByText(/aún no hay colaboradores/i)).not.toBeInTheDocument()
  })

  it('empresa en modo reserva: sin política ni toggle de consumo libre', async () => {
    api.listarColaboradores.mockResolvedValue([crearColaboradorFake({ politica: null })])
    renderizar('admin_empresa')
    await screen.findAllByText('María López')
    expect(screen.queryByText(/consumo libre:/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: /consumo libre/i })
    ).not.toBeInTheDocument()
  })

  it('empresa en modo libre: muestra la política vigente y el toggle por colaborador', async () => {
    api.listarColaboradores.mockResolvedValue([
      crearColaboradorFake({ politica: politicaLibreFake() }),
    ])
    renderizar('admin_empresa')
    await screen.findAllByText('María López')
    expect(screen.getByText(/consumo libre activo/i)).toBeInTheDocument()
    expect(screen.getByText(/lunes a viernes/i)).toBeInTheDocument()
    expect(screen.getByText(/hasta 2 al día/i)).toBeInTheDocument()
    // Toggle visible (móvil + tabla renderizan ambos; basta con que exista).
    expect(screen.getAllByRole('switch', { name: /consumo libre/i }).length).toBeGreaterThan(0)
  })

  it('restablecer contraseña: confirma, llama a la función y muestra la temporal', async () => {
    const user = userEvent.setup()
    api.resetearPasswordColaborador.mockResolvedValue({
      email: 'maria@x.com',
      yaTeniaCuenta: false,
      tempPassword: 'Temp0ral-Fuerte!',
    })
    api.listarColaboradores.mockResolvedValue([
      crearColaboradorFake({ usuario_id: 5, user_id: 'u1' }),
    ])
    renderizar('admin_empresa')
    await screen.findAllByText('María López')

    // Abre el menú de acciones (hay uno por vista; basta el primero) y elige restablecer.
    await user.click(screen.getAllByRole('button', { name: /acciones de maría lópez/i })[0])
    await user.click(await screen.findByRole('menuitem', { name: /restablecer contraseña/i }))

    // Confirmación → aplicar.
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restablecer' }))
    expect(api.resetearPasswordColaborador).toHaveBeenCalledWith(5)
    expect(await screen.findByText('Temp0ral-Fuerte!')).toBeInTheDocument()
  })

  it('activar el toggle llama establecer_consumo_libre con el usuario_id (no el id de comensal)', async () => {
    const user = userEvent.setup()
    api.establecerConsumoLibre.mockResolvedValue(undefined)
    api.listarColaboradores.mockResolvedValue([
      crearColaboradorFake({ id: 1, usuario_id: 5, politica: politicaLibreFake() }),
    ])
    renderizar('admin_empresa')
    await screen.findAllByText('María López')
    const toggles = screen.getAllByRole('switch', { name: /consumo libre/i })
    await user.click(toggles[0])
    expect(api.establecerConsumoLibre).toHaveBeenCalledWith(5, true)
  })
})
