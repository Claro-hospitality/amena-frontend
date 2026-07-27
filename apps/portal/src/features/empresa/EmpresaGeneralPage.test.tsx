import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  obtenerMiEmpresa: vi.fn(),
  guardarDatosFiscales: vi.fn(),
  actualizarNombreComercial: vi.fn(),
}))
vi.mock('./api', () => api)

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { EmpresaGeneralPage } from './EmpresaGeneralPage'

const empresa = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  precio_comida: 85,
  ciclo_facturacion: 'mensual' as const,
  modo_consumo: 'reserva' as const,
  dias_permitidos: [1, 2, 3, 4, 5],
  limite_diario: null,
  activo: true,
  created_at: '',
  updated_at: '',
}

const fiscal = {
  id: 1,
  empresa_id: 1,
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: 'CNO120101AB1',
  codigo_postal_fiscal: '64000',
  regimen_fiscal: '601',
  uso_cfdi: 'G03',
  email_facturacion: 'fac@norte.mx',
  activo: true,
  created_at: '',
  updated_at: '',
}

function renderizar(tipo: TipoUsuarioPortal) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ tipo }} />}>
            <Route index element={<EmpresaGeneralPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.obtenerMiEmpresa.mockResolvedValue({ empresa, datosFiscales: fiscal })
  api.guardarDatosFiscales.mockResolvedValue(undefined)
  api.actualizarNombreComercial.mockResolvedValue(undefined)
})

describe('EmpresaGeneralPage', () => {
  it('muestra los términos del plan en solo lectura y el nombre comercial', async () => {
    renderizar('admin_empresa')
    expect(await screen.findByText('Constructora Norte')).toBeInTheDocument()
    expect(screen.getByText('$85.00')).toBeInTheDocument()
    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText('Por reserva (cuota por día)')).toBeInTheDocument()
    expect(screen.getByText(/acordaste con amena/i)).toBeInTheDocument()
  })

  it('muestra el estado vacío fiscal y permite completar los datos', async () => {
    api.obtenerMiEmpresa.mockResolvedValue({ empresa, datosFiscales: null })
    const user = userEvent.setup()
    renderizar('admin_empresa')

    expect(await screen.findByText(/aún no has registrado tus datos fiscales/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /completar datos fiscales/i }))

    // Se abre el diálogo de registro y al guardar se invoca la mutation con los datos.
    await user.type(screen.getByLabelText('Razón social'), 'Mi Empresa SA')
    await user.type(screen.getByLabelText('RFC'), 'abc010101ab1')
    await user.type(screen.getByLabelText('Código postal fiscal'), '06600')
    await user.type(screen.getByLabelText('Régimen fiscal'), '601')
    await user.type(screen.getByLabelText('Correo de facturación'), 'fac@x.com')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    await waitFor(() =>
      expect(api.guardarDatosFiscales).toHaveBeenCalledWith(1, {
        razon_social: 'Mi Empresa SA',
        rfc: 'ABC010101AB1',
        codigo_postal_fiscal: '06600',
        regimen_fiscal: '601',
        uso_cfdi: 'G03',
        email_facturacion: 'fac@x.com',
      })
    )
  })

  it('niega el acceso a un colaborador (no muestra términos)', async () => {
    renderizar('colaborador')
    await waitFor(() => expect(screen.queryByText('Términos del plan')).not.toBeInTheDocument())
  })
})
