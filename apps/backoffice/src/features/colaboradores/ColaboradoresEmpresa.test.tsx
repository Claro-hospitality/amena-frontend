import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  listarColaboradoresEmpresa: vi.fn(),
  altaUsuarioPortal: vi.fn(),
  nombreEmpresa: () => '—',
}))
vi.mock('./api', () => api)

import type { Empresa } from '../empresas/api'
import { ColaboradoresEmpresa } from './ColaboradoresEmpresa'

const empresa: Empresa = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  razon_social: 'Constructora Norte S.A. de C.V.',
  rfc: null,
  precio_comida: 100,
  ciclo_facturacion: 'mensual',
  activo: true,
  created_at: '',
  updated_at: '',
}

function renderizar(puedeGestionar = true) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <ColaboradoresEmpresa empresa={empresa} puedeGestionar={puedeGestionar} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.listarColaboradoresEmpresa.mockResolvedValue([
    { id: 1, activo: true, nombre: 'Juan Pérez', email: 'juan@x.com', empresa_id: 1, empresa: null },
  ])
})

describe('ColaboradoresEmpresa', () => {
  it('lista los colaboradores de la empresa', async () => {
    renderizar()
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
  })

  it('el alta fija la empresa (campo deshabilitado, sin selector de empresa)', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez')
    await user.click(screen.getByRole('button', { name: 'Nuevo usuario' }))

    const campoEmpresa = await screen.findByLabelText('Empresa')
    expect(campoEmpresa).toBeDisabled()
    expect(campoEmpresa).toHaveValue('Constructora Norte')
  })

  it('en modo lectura (finanzas) no ofrece dar de alta', async () => {
    renderizar(false)
    await screen.findByText('Juan Pérez')
    expect(screen.queryByRole('button', { name: 'Nuevo usuario' })).not.toBeInTheDocument()
  })
})
