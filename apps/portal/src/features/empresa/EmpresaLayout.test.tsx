import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'
import { EmpresaLayout } from './EmpresaLayout'

function renderizar(tipo: TipoUsuarioPortal, ruta = '/empresa') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route element={<Outlet context={{ tipo }} />}>
          <Route path="/empresa" element={<EmpresaLayout />}>
            <Route index element={<div>contenido general</div>} />
            <Route path="colaboradores" element={<div>contenido colaboradores</div>} />
          </Route>
          <Route path="/inicio" element={<div>inicio</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('EmpresaLayout', () => {
  it('muestra el tab "General" (→ /empresa) junto a las secciones hijas', () => {
    renderizar('admin_empresa')
    expect(screen.getByRole('link', { name: /general/i })).toHaveAttribute('href', '/empresa')
    expect(screen.getByRole('link', { name: /colaboradores/i })).toHaveAttribute(
      'href',
      '/empresa/colaboradores'
    )
    expect(screen.getByRole('link', { name: /cuotas/i })).toHaveAttribute('href', '/empresa/cuotas')
    expect(screen.getByRole('link', { name: /cortes/i })).toHaveAttribute('href', '/empresa/cortes')
    expect(screen.getByRole('link', { name: /facturas/i })).toHaveAttribute(
      'href',
      '/empresa/facturas'
    )
  })

  it('redirige a inicio a un colaborador', () => {
    renderizar('colaborador')
    expect(screen.getByText('inicio')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /general/i })).not.toBeInTheDocument()
  })
})
