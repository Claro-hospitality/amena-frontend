import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ cerrarSesion: vi.fn() }) }))

import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { PortalShell } from './PortalShell'

function renderShell(tipo: TipoUsuarioPortal, esComensal = false) {
  return render(
    <MemoryRouter>
      <PortalShell tipo={tipo} esComensal={esComensal}>
        <div>contenido</div>
      </PortalShell>
    </MemoryRouter>
  )
}

// La navegación se renderiza dos veces (nav superior en lg+ y píldora inferior en < lg),
// ambas en el DOM; por eso se consulta con getAllByRole.
describe('PortalShell', () => {
  it('admin_empresa ve su navegación', () => {
    renderShell('admin_empresa')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Colaboradores' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Cuotas' }).length).toBeGreaterThan(0)
    expect(screen.queryAllByRole('link', { name: 'Historial' }).length).toBe(0)
  })

  it('admin que también es comensal ve el acceso "Mi QR"', () => {
    renderShell('admin_empresa', true)
    expect(screen.getAllByRole('link', { name: 'Mi QR' }).length).toBeGreaterThan(0)
  })

  it('admin sin comensal NO ve "Mi QR"', () => {
    renderShell('admin_empresa', false)
    expect(screen.queryAllByRole('link', { name: 'Mi QR' }).length).toBe(0)
  })

  it('colaborador ve su navegación', () => {
    renderShell('colaborador')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Menú' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Historial' }).length).toBeGreaterThan(0)
    expect(screen.queryAllByRole('link', { name: 'Colaboradores' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Cuotas' }).length).toBe(0)
  })

  it('el menú de usuario ofrece "Mi cuenta" y "Cerrar sesión"', async () => {
    const user = userEvent.setup()
    renderShell('admin_empresa')
    expect(screen.getByText('contenido')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /menú de usuario/i }))
    expect(await screen.findByRole('menuitem', { name: /mi cuenta/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toBeInTheDocument()
  })
})
