import { render, screen } from '@testing-library/react'
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

describe('PortalShell', () => {
  it('admin_empresa ve su navegación', () => {
    renderShell('admin_empresa')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Colaboradores' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cuotas' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Historial' })).not.toBeInTheDocument()
  })

  it('admin que también es comensal ve el acceso "Mi QR"', () => {
    renderShell('admin_empresa', true)
    expect(screen.getByRole('link', { name: 'Mi QR' })).toBeInTheDocument()
  })

  it('admin sin comensal NO ve "Mi QR"', () => {
    renderShell('admin_empresa', false)
    expect(screen.queryByRole('link', { name: 'Mi QR' })).not.toBeInTheDocument()
  })

  it('colaborador ve su navegación', () => {
    renderShell('colaborador')
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Menú' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Historial' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Colaboradores' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Cuotas' })).not.toBeInTheDocument()
  })

  it('ofrece cerrar sesión y el trigger del menú móvil', () => {
    renderShell('admin_empresa')
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument()
  })
})
