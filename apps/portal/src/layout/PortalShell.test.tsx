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
  it('colaborador ve solo los tabs de comensal (Inicio y Mi QR)', () => {
    renderShell('colaborador')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Mi QR' }).length).toBeGreaterThan(0)
    // No ve gestión ni las rutas viejas.
    expect(screen.queryAllByRole('link', { name: 'Empresa' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Menú' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Historial' }).length).toBe(0)
  })

  it('admin ve los tabs de comensal más "Empresa"', () => {
    renderShell('admin_empresa')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Mi QR' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Empresa' }).length).toBeGreaterThan(0)
    // La gestión (Colaboradores, Cuotas, Cierres) vive DENTRO de Empresa, no en el nav principal.
    expect(screen.queryAllByRole('link', { name: 'Colaboradores' }).length).toBe(0)
    expect(screen.queryAllByRole('link', { name: 'Cuotas' }).length).toBe(0)
  })

  it('los primeros dos tabs son idénticos entre ambos roles', () => {
    const { unmount } = renderShell('colaborador')
    const colaborador = screen.getAllByRole('link').map((l) => l.textContent)
    unmount()
    renderShell('admin_empresa')
    const admin = screen.getAllByRole('link').map((l) => l.textContent)
    // "Inicio" y "Mi QR" aparecen en ambos.
    for (const label of ['Inicio', 'Mi QR']) {
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
