import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// El dialog importa ./queries → ./api (cliente de Supabase, que falla sin env en CI).
// Se mockea ./api con factory para no cargar el módulo real.
const api = vi.hoisted(() => ({
  crearColaborador: vi.fn(),
  actualizarColaborador: vi.fn(),
  obtenerMiEmpresaId: vi.fn(),
  listarColaboradores: vi.fn(),
  cambiarEstadoColaborador: vi.fn(),
  establecerConsumoLibre: vi.fn(),
}))
vi.mock('./api', () => api)

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

import { ColaboradorFormDialog } from './ColaboradorFormDialog'

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <ColaboradorFormDialog onClose={() => {}} />
    </QueryClientProvider>
  )
}

async function crearColaboradorEnFormulario() {
  const user = userEvent.setup()
  // Espera a que resuelva la empresa del admin (necesaria para habilitar el alta).
  await waitFor(() => expect(api.obtenerMiEmpresaId).toHaveBeenCalled())
  await user.type(screen.getByLabelText('Nombre'), 'Juan Pérez')
  await user.type(screen.getByLabelText(/correo/i), 'juan@cn.com')
  await user.click(screen.getByRole('button', { name: /guardar/i }))
}

beforeEach(() => {
  vi.clearAllMocks()
  api.obtenerMiEmpresaId.mockResolvedValue(7)
})

describe('ColaboradorFormDialog (portal)', () => {
  it('al crear, muestra las credenciales de acceso (contraseña temporal) para entregar', async () => {
    api.crearColaborador.mockResolvedValue({
      email: 'juan@cn.com',
      yaTeniaCuenta: false,
      tempPassword: 'Tmp-123-Xyz',
    })
    renderizar()
    await crearColaboradorEnFormulario()

    expect(await screen.findByText('Acceso creado')).toBeInTheDocument()
    expect(screen.getByText('Tmp-123-Xyz')).toBeInTheDocument()
    expect(screen.getByText('Contraseña temporal')).toBeInTheDocument()
    // Se dio de alta en la empresa del admin (no el id de comensal).
    expect(api.crearColaborador).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Juan Pérez', empresa_id: 7 })
    )
  })

  it('email existente (yaTeniaCuenta): sin contraseña, avisa que use la actual', async () => {
    api.crearColaborador.mockResolvedValue({ email: 'ana@cn.com', yaTeniaCuenta: true })
    renderizar()
    await crearColaboradorEnFormulario()

    expect(await screen.findByText('Rol asignado')).toBeInTheDocument()
    expect(screen.queryByText(/contraseña temporal/i)).not.toBeInTheDocument()
  })

  it('error del backend (p. ej. 403): muestra su mensaje en toast y NO abre credenciales', async () => {
    api.crearColaborador.mockRejectedValue(new Error('No tienes permiso para esta operación.'))
    renderizar()
    await crearColaboradorEnFormulario()

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('No tienes permiso para esta operación.')
    )
    expect(screen.queryByText('Acceso creado')).not.toBeInTheDocument()
  })
})
