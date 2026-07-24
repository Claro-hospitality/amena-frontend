import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ConsumoHoy } from './api'

const consumos: ConsumoHoy[] = [
  {
    id: 1,
    created_at: '2026-07-24T12:00:00Z',
    comensal_nombre: 'Juan Pérez',
    empresa_nombre: 'Acme',
    registrado_por: 'yo-1',
    mesero_nombre: 'Mesero Uno',
    metodo: 'qr',
    origen: 'declaracion',
  },
  {
    id: 2,
    created_at: '2026-07-24T13:00:00Z',
    comensal_nombre: 'Ana Ruiz',
    empresa_nombre: 'Beta',
    registrado_por: 'otro-2',
    mesero_nombre: 'Mesero Dos',
    metodo: 'manual',
    origen: 'libre',
  },
]

vi.mock('./queries', () => ({
  useConsumosHoy: () => ({ data: consumos, isLoading: false, isError: false, refetch: vi.fn() }),
}))

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { ListaConsumosHoy } from './ListaConsumosHoy'

function renderizar(rol: RolBackoffice) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Outlet context={{ rol }} />}>
          <Route index element={<ListaConsumosHoy />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ListaConsumosHoy', () => {
  it('lista los consumos con quién registró y marca los manuales con un badge', () => {
    renderizar('mesero')
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Registró: Mesero Uno')).toBeInTheDocument()
    expect(screen.getByText('Registró: Mesero Dos')).toBeInTheDocument()
    // El consumo manual (Ana) muestra el badge; el de QR (Juan) no.
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })

  it('filtra por nombre de comensal', async () => {
    const user = userEvent.setup()
    renderizar('mesero')
    await user.type(screen.getByLabelText(/buscar consumo/i), 'Ana')
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
  })

  it('rol sin acceso al escáner no ve la lista', () => {
    renderizar('finanzas')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
