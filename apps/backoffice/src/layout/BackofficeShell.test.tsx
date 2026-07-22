import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ cerrarSesion: vi.fn() }) }))

import type { RolBackoffice } from '../auth/validarAccesoPortal'
import { BackofficeShell } from './BackofficeShell'

function renderShell(rol: RolBackoffice) {
  return render(
    <MemoryRouter>
      <BackofficeShell rol={rol}>
        <div>contenido</div>
      </BackofficeShell>
    </MemoryRouter>
  )
}

describe('BackofficeShell', () => {
  it('super_admin ve toda la navegación (incluidos Platillos y Menú)', () => {
    renderShell('super_admin')
    // "Inicio" aparece también en las migas de pan (ruta '/'), por eso puede haber más de un link.
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    for (const label of ['Empresas', 'Platillos', 'Menú', 'Cortes semanales', 'Facturas']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('finanzas solo ve sus secciones (sin Platillos, Menú ni Colaboradores)', () => {
    renderShell('finanzas')
    expect(screen.getByRole('link', { name: 'Empresas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cortes semanales' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Platillos' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Menú' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Colaboradores' })).not.toBeInTheDocument()
  })

  it('mesero solo ve el Escáner', () => {
    renderShell('mesero')
    expect(screen.getByRole('link', { name: 'Escáner' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Empresas' })).not.toBeInTheDocument()
  })

  it('renderiza el contenido y el trigger de menú', () => {
    renderShell('super_admin')
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /alternar menú/i })).toBeInTheDocument()
  })
})
