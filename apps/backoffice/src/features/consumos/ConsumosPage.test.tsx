import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ConsumoRow } from './api'

const rows: ConsumoRow[] = [
  {
    id: 1,
    created_at: '2026-07-24T12:00:00Z',
    fecha: '2026-07-24',
    comensal: { id: 10, usuario: { nombre: 'Juan Pérez' } },
    empresa: { nombre: 'Acme', precio_comida: 100 },
  },
  {
    id: 2,
    created_at: '2026-07-24T13:00:00Z',
    fecha: '2026-07-24',
    comensal: { id: 10, usuario: { nombre: 'Juan Pérez' } },
    empresa: { nombre: 'Acme', precio_comida: 100 },
  },
  {
    id: 3,
    created_at: '2026-07-24T14:00:00Z',
    fecha: '2026-07-24',
    comensal: { id: 20, usuario: { nombre: 'Ana Ruiz' } },
    empresa: { nombre: 'Beta', precio_comida: 80 },
  },
]

vi.mock('./queries', () => ({
  useConsumos: () => ({ data: rows, isLoading: false, isError: false, refetch: vi.fn() }),
}))
// La gráfica (recharts) no aporta al test y da problemas de layout en jsdom: se stubea.
vi.mock('recharts', () => ({
  Bar: () => null,
  BarChart: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))
vi.mock('@amena/ui/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}))

import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { ConsumosPage } from './ConsumosPage'

function renderizar(rol: RolBackoffice) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Outlet context={{ rol }} />}>
          <Route index element={<ConsumosPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ConsumosPage', () => {
  it('muestra métricas, gasto total y el detalle de consumos', () => {
    renderizar('super_admin')
    expect(screen.getByText('Comidas')).toBeInTheDocument()
    expect(screen.getByText('Comensales')).toBeInTheDocument()
    expect(screen.getByText('Gasto total')).toBeInTheDocument()
    // gasto = 100 + 100 + 80 = 280
    expect(screen.getByText('$280.00')).toBeInTheDocument()
    // detalle: los comensales aparecen en la tabla
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0)
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
  })

  it('rol mesero no tiene acceso', () => {
    renderizar('mesero')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
