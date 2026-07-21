import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  listarUsuariosEmpresa: vi.fn(),
  altaUsuarioPortal: vi.fn(),
  establecerRolPortal: vi.fn(),
  nombreEmpresa: () => '—',
}))
vi.mock('./api', () => api)

import type { Empresa } from '../empresas/api'
import { UsuariosEmpresa } from './UsuariosEmpresa'

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
      <UsuariosEmpresa empresa={empresa} puedeGestionar={puedeGestionar} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.establecerRolPortal.mockResolvedValue(undefined)
  api.listarUsuariosEmpresa.mockResolvedValue([
    { id: 1, nombre: 'Adriana Ruiz', email: 'admin@x.com', activo: true, esAdmin: true, esColaborador: false },
    { id: 2, nombre: 'Juan Pérez', email: 'juan@x.com', activo: true, esAdmin: false, esColaborador: true },
  ])
})

describe('UsuariosEmpresa', () => {
  it('lista admins y colaboradores con su rol', async () => {
    renderizar()
    expect(await screen.findByText('Adriana Ruiz')).toBeInTheDocument()
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('Colaborador')).toBeInTheDocument()
  })

  it('el alta fija la empresa (campo deshabilitado)', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Adriana Ruiz')
    await user.click(screen.getByRole('button', { name: 'Nuevo usuario' }))

    const campoEmpresa = await screen.findByLabelText('Empresa')
    expect(campoEmpresa).toBeDisabled()
    expect(campoEmpresa).toHaveValue('Constructora Norte')
  })

  it('en modo lectura (finanzas) no ofrece dar de alta ni editar', async () => {
    renderizar(false)
    await screen.findByText('Adriana Ruiz')
    expect(screen.queryByRole('button', { name: 'Nuevo usuario' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /editar roles/i })
    ).not.toBeInTheDocument()
  })

  it('editar roles: activar Administrador llama al RPC', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez')
    await user.click(screen.getByRole('button', { name: 'Editar roles de Juan Pérez' }))
    expect(await screen.findByText('Roles de Juan Pérez')).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Administrador' }))
    await waitFor(() => expect(api.establecerRolPortal).toHaveBeenCalledWith(2, 'admin', true))
  })

  it('editar roles: quitar Colaborador pide confirmación antes del RPC', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez')
    await user.click(screen.getByRole('button', { name: 'Editar roles de Juan Pérez' }))
    await screen.findByText('Roles de Juan Pérez')

    // Juan es colaborador → apagar el switch abre confirmación, sin llamar aún al RPC.
    await user.click(screen.getByRole('switch', { name: 'Colaborador' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(api.establecerRolPortal).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Quitar' }))
    await waitFor(() =>
      expect(api.establecerRolPortal).toHaveBeenCalledWith(2, 'colaborador', false)
    )
  })
})
