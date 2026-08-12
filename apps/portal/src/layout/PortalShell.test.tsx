import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ cerrarSesion: vi.fn() }) }))

import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { PortalShell } from './PortalShell'

function renderShell(tipo: TipoUsuarioPortal) {
  return render(
    <MemoryRouter>
      <PortalShell tipo={tipo}>
        <div>contenido</div>
      </PortalShell>
    </MemoryRouter>
  )
}

// La navegación se renderiza dos veces (nav superior en lg+ y píldora inferior en < lg),
// ambas en el DOM; por eso se consulta con getAllByRole.
describe('PortalShell', () => {
  it('colaborador ve los tabs de comensal (Inicio, Menú, Mi QR)', () => {
    renderShell('colaborador')
    for (const label of ['Inicio', 'Menú', 'Mi QR']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
    // No ve la gestión de empresa ni las rutas viejas.
    expect(screen.queryAllByRole('link', { name: 'Empresa' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Historial' }).length).toBe(0)
  })

  it('admin ve los tabs de comensal más "Empresa" (Inicio, Menú, Empresa, Mi QR)', () => {
    renderShell('admin_empresa')
    for (const label of ['Inicio', 'Menú', 'Empresa', 'Mi QR']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
    // La gestión (Colaboradores, Consumos, Cortes) vive DENTRO de Empresa, no en el nav principal.
    expect(screen.queryAllByRole('link', { name: 'Colaboradores' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Consumos' }).length).toBe(0)
  })

  it('los tabs de comensal (Inicio, Menú, Mi QR) son idénticos entre ambos roles', () => {
    const { unmount } = renderShell('colaborador')
    const colaborador = screen.getAllByRole('link').map((l) => l.textContent)
    unmount()
    renderShell('admin_empresa')
    const admin = screen.getAllByRole('link').map((l) => l.textContent)
    for (const label of ['Inicio', 'Menú', 'Mi QR']) {
      expect(colaborador).toContain(label)
      expect(admin).toContain(label)
    }
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
