import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  listarColaboradores: vi.fn(),
  listarUsuariosEmpresa: vi.fn(),
  altaUsuarioPortal: vi.fn(),
  asignarRolUnico: vi.fn(),
  establecerRolPortal: vi.fn(),
  establecerComidaComensal: vi.fn(),
  resetearPasswordUsuario: vi.fn(),
  nombreEmpresa: () => '—',
}))
vi.mock('./api', () => api)

import type { Empresa } from '../empresas/api'
import { UsuariosEmpresa } from './UsuariosEmpresa'

const empresa: Empresa = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  precio_comida: 100,
  ciclo_facturacion: 'mensual',
  activo: true,
  created_at: '',
  updated_at: '',
  modo_consumo: 'reserva',
  dias_permitidos: [],
  limite_diario: null,
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
  api.asignarRolUnico.mockResolvedValue(undefined)
  api.establecerRolPortal.mockResolvedValue(undefined)
  api.establecerComidaComensal.mockResolvedValue(undefined)
  api.resetearPasswordUsuario.mockResolvedValue({
    email: 'juan@x.com',
    yaTeniaCuenta: false,
    tempPassword: 'Temp0ral-Fuerte!',
  })
  api.listarUsuariosEmpresa.mockResolvedValue([
    { id: 1, nombre: 'Adriana Ruiz', email: 'admin@x.com', activo: true, esAdmin: true, esColaborador: false, rol: 'admin', comeActivo: true },
    { id: 2, nombre: 'Juan Pérez', email: 'juan@x.com', activo: true, esAdmin: false, esColaborador: true, rol: 'colaborador', comeActivo: false },
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

  it('la tabla no muestra columna "Estado" y renombra "Come" a "Comensal"', async () => {
    renderizar()
    await screen.findByText('Adriana Ruiz')
    expect(
      screen.getByRole('columnheader', { name: 'Comensal' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Estado' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Come' })).not.toBeInTheDocument()
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

  it('editar rol: elegir Administrador llama a asignar_rol_unico con el rol elegido', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez') // Juan es colaborador
    await user.click(screen.getByRole('button', { name: 'Editar roles de Juan Pérez' }))
    expect(await screen.findByText('Rol de Juan Pérez')).toBeInTheDocument()

    // Selección única: elegir Administrador aplica directo (sin confirmación).
    await user.click(screen.getByRole('radio', { name: 'Administrador' }))
    await waitFor(() => expect(api.asignarRolUnico).toHaveBeenCalledWith(2, 'admin'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('editar rol: es selección única (elegir uno no deja ambos marcados)', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez') // preselecciona Colaborador
    await user.click(screen.getByRole('button', { name: 'Editar roles de Juan Pérez' }))
    await screen.findByText('Rol de Juan Pérez')

    const admin = screen.getByRole('radio', { name: 'Administrador' })
    const colaborador = screen.getByRole('radio', { name: 'Colaborador' })
    expect(colaborador).toBeChecked()
    expect(admin).not.toBeChecked()

    await user.click(admin)
    await waitFor(() => expect(admin).toBeChecked())
    expect(colaborador).not.toBeChecked()
    expect(api.asignarRolUnico).toHaveBeenCalledExactlyOnceWith(2, 'admin')
    expect(api.asignarRolUnico).not.toHaveBeenCalledWith(2, 'colaborador')
  })

  it('comida: activar (comensal inactivo) aplica directo vía el RPC', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez') // Juan tiene comeActivo=false

    await user.click(screen.getByRole('button', { name: 'Activar comida de Juan Pérez' }))
    await waitFor(() =>
      expect(api.establecerComidaComensal).toHaveBeenCalledWith(2, true)
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('restablecer contraseña: confirma, llama a la función y muestra la temporal', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Juan Pérez')

    await user.click(screen.getByRole('button', { name: 'Restablecer contraseña de Juan Pérez' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(api.resetearPasswordUsuario).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Restablecer' }))
    await waitFor(() => expect(api.resetearPasswordUsuario).toHaveBeenCalledWith(2))
    // La contraseña temporal se muestra una sola vez.
    expect(await screen.findByText('Temp0ral-Fuerte!')).toBeInTheDocument()
  })

  it('en modo lectura (finanzas) no ofrece restablecer contraseña', async () => {
    renderizar(false)
    await screen.findByText('Adriana Ruiz')
    expect(
      screen.queryByRole('button', { name: /restablecer contraseña/i })
    ).not.toBeInTheDocument()
  })

  it('comida: desactivar (comensal activo) confirma antes de llamar al RPC', async () => {
    const user = userEvent.setup()
    renderizar(true)
    await screen.findByText('Adriana Ruiz') // Adriana tiene comeActivo=true

    await user.click(screen.getByRole('button', { name: 'Desactivar comida de Adriana Ruiz' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(api.establecerComidaComensal).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    await waitFor(() =>
      expect(api.establecerComidaComensal).toHaveBeenCalledWith(1, false)
    )
  })
})
