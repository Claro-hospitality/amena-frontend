import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AccionesColaborador } from './ColaboradorAcciones'
import { crearColaboradorFake } from './testFactory'

function renderAcciones(overrides = {}, handlers = {}) {
  const qc = new QueryClient()
  const props = {
    onEditar: vi.fn(),
    onCambiarEstado: vi.fn(),
    onResetear: vi.fn(),
    onToggleAcceso: vi.fn(),
    onEliminar: vi.fn(),
    ...handlers,
  }
  render(
    <QueryClientProvider client={qc}>
      <AccionesColaborador colaborador={crearColaboradorFake(overrides)} {...props} />
    </QueryClientProvider>
  )
  return props
}

async function abrirMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Acciones de/ }))
}

describe('AccionesColaborador — ciclo de vida', () => {
  it('ofrece "Desactivar acceso" cuando el acceso está activo (con cuenta)', async () => {
    const user = userEvent.setup()
    renderAcciones({ user_id: 'u1', accesoActivo: true })
    await abrirMenu(user)
    expect(await screen.findByText('Desactivar acceso')).toBeInTheDocument()
    // Eliminar NO aparece mientras el acceso siga activo.
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('muestra "Eliminar" solo cuando el acceso está desactivado', async () => {
    const user = userEvent.setup()
    renderAcciones({ user_id: 'u1', accesoActivo: false })
    await abrirMenu(user)
    expect(await screen.findByText('Activar acceso')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('no ofrece acceso ni eliminar si la persona aún no tiene cuenta', async () => {
    const user = userEvent.setup()
    renderAcciones({ user_id: null })
    await abrirMenu(user)
    // El menú abrió (aparece "Editar") pero sin las acciones de acceso.
    expect(await screen.findByText('Editar')).toBeInTheDocument()
    expect(screen.queryByText(/acceso$/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('dispara onEliminar con el colaborador', async () => {
    const user = userEvent.setup()
    const handlers = renderAcciones({ user_id: 'u1', accesoActivo: false })
    await abrirMenu(user)
    await user.click(await screen.findByText('Eliminar'))
    expect(handlers.onEliminar).toHaveBeenCalledOnce()
  })
})
