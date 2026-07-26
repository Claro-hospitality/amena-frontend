import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos la capa de datos (incluye DIAS_SEMANA, que la página importa como valor).
const api = vi.hoisted(() => ({
  obtenerDiaCorte: vi.fn(),
  actualizarDiaCorte: vi.fn(),
  obtenerConfigFacturacion: vi.fn(),
  actualizarConfigFacturacion: vi.fn(),
  CLAVES_FACTURACION: [
    'serie_facturas_default',
    'clave_prod_serv_sat',
    'clave_unidad_sat',
    'metodo_pago_default',
    'forma_pago_default',
    'lugar_expedicion',
  ],
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
  api.obtenerConfigFacturacion.mockResolvedValue({
    serie_facturas_default: 'A',
    clave_prod_serv_sat: '90101501',
    clave_unidad_sat: 'ACT',
    metodo_pago_default: 'PPD',
    forma_pago_default: '99',
    lugar_expedicion: '44600',
  })
  api.actualizarConfigFacturacion.mockResolvedValue(undefined)
})

describe('ConfiguracionPage', () => {
  it('niega el acceso a roles que no son super_admin', () => {
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Configuración' })).not.toBeInTheDocument()
  })

  it('carga el día de corte actual en el select', async () => {
    renderizar('super_admin')
    const select = await screen.findByLabelText('Día de corte semanal')
    expect(select).toHaveTextContent('Domingo')
  })

  it('deshabilita Guardar mientras no haya cambios', async () => {
    renderizar('super_admin')
    await screen.findByLabelText('Día de corte semanal')
    // Hay un "Guardar" por sección (cortes y facturación); el de cortes es el primero.
    expect(screen.getAllByRole('button', { name: 'Guardar' })[0]).toBeDisabled()
  })

  it('guarda el nuevo día tras confirmar', async () => {
    const user = userEvent.setup()
    renderizar('super_admin')
    const select = await screen.findByLabelText('Día de corte semanal')

    await user.click(select)
    await user.click(await screen.findByRole('option', { name: 'Lunes' }))
    await user.click(screen.getAllByRole('button', { name: 'Guardar' })[0])

    // Confirmar dentro del diálogo (explica el efecto).
    const dialogo = await screen.findByRole('alertdialog')
    expect(within(dialogo).getByText(/se ejecutarán cada lunes/i)).toBeInTheDocument()
    await user.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(api.actualizarDiaCorte).toHaveBeenCalledWith('lunes')
  })

  it('Facturación: solo el campo Serie y el aviso de ambiente (sin campos SAT ni CP)', async () => {
    renderizar('super_admin')
    expect(await screen.findByLabelText('Serie por default')).toBeInTheDocument()
    // El aviso de ambiente está presente (fuera del formulario).
    expect(screen.getByText(/ambiente de timbrado/i)).toBeInTheDocument()
    // Los campos que pasaron a ser constantes/eliminados ya no están:
    expect(screen.queryByLabelText(/lugar de expedición/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/clave prodserv sat/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/clave de unidad sat/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/método de pago/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/forma de pago/i)).not.toBeInTheDocument()
  })
})
