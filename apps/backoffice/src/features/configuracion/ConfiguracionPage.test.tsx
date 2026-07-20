import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos la capa de datos (incluye DIAS_SEMANA, que la página importa como valor).
const api = vi.hoisted(() => ({
  obtenerDiaCorte: vi.fn(),
  actualizarDiaCorte: vi.fn(),
  DIAS_SEMANA: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
}))
vi.mock('./api', () => api)

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { ConfiguracionPage } from './ConfiguracionPage'

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route index element={<ConfiguracionPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.obtenerDiaCorte.mockResolvedValue('domingo')
  api.actualizarDiaCorte.mockResolvedValue(undefined)
})

describe('ConfiguracionPage', () => {
  it('niega el acceso a roles que no son super_admin', () => {
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Configuración' })).not.toBeInTheDocument()
  })

  it('carga el día de corte actual en el select', async () => {
    renderizar('super_admin')
    const select = (await screen.findByLabelText('Día de corte semanal')) as HTMLSelectElement
    expect(select.value).toBe('domingo')
  })

  it('deshabilita Guardar mientras no haya cambios', async () => {
    renderizar('super_admin')
    await screen.findByLabelText('Día de corte semanal')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('guarda el nuevo día tras confirmar', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    const select = await screen.findByLabelText('Día de corte semanal')

    await user.selectOptions(select, 'lunes')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    // Confirmar dentro del diálogo (explica el efecto).
    const dialogo = await screen.findByRole('alertdialog')
    expect(within(dialogo).getByText(/se ejecutarán cada lunes/i)).toBeInTheDocument()
    await user.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(api.actualizarDiaCorte).toHaveBeenCalledWith('lunes')
  })
})
