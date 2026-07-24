import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ConsumoRow, ResumenConsumos } from './api'

const rows: ConsumoRow[] = [
  {
    id: 1,
    fecha: '2026-07-24',
    created_at: '2026-07-24T12:00:00Z',
    comensal_id: 10,
    comensal_nombre: 'Juan Pérez',
    empresa_id: 1,
    empresa_nombre: 'Acme',
    precio_comida: 100,
    registrado_por: 'u-1',
    mesero_nombre: 'Mesero Uno',
    origen: 'declaracion',
    total_filtrado: 3,
  },
  {
    id: 2,
    fecha: '2026-07-24',
    created_at: '2026-07-24T13:00:00Z',
    comensal_id: 10,
    comensal_nombre: 'Juan Pérez',
    empresa_id: 1,
    empresa_nombre: 'Acme',
    precio_comida: 100,
    registrado_por: 'u-1',
    mesero_nombre: 'Mesero Uno',
    origen: 'libre',
    total_filtrado: 3,
  },
  {
    id: 3,
    fecha: '2026-07-24',
    created_at: '2026-07-24T14:00:00Z',
    comensal_id: 20,
    comensal_nombre: 'Ana Ruiz',
    empresa_id: 2,
    empresa_nombre: 'Beta',
    precio_comida: 80,
    registrado_por: 'u-2',
    mesero_nombre: 'Mesero Dos',
    origen: 'extra',
    total_filtrado: 3,
  },
]

const resumen: ResumenConsumos = {
  total: 3,
  comensales_unicos: 2,
  gasto: 280,
  por_mesero: [
    { registrado_por: 'u-1', nombre: 'Mesero Uno', comidas: 2 },
    { registrado_por: 'u-2', nombre: 'Mesero Dos', comidas: 1 },
  ],
  por_empresa: [
    { empresa_id: 1, nombre: 'Acme', comidas: 2 },
    { empresa_id: 2, nombre: 'Beta', comidas: 1 },
  ],
  top_comensales: [
    { comensal_id: 10, nombre: 'Juan Pérez', comidas: 2 },
    { comensal_id: 20, nombre: 'Ana Ruiz', comidas: 1 },
  ],
}

vi.mock('./queries', () => ({
  useConsumos: () => ({
    data: { rows, total: 3 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useResumenConsumos: () => ({ data: resumen, isLoading: false, isError: false, refetch: vi.fn() }),
  useEmpresas: () => ({ data: [{ id: 1, nombre: 'Acme' }, { id: 2, nombre: 'Beta' }] }),
}))
// La gráfica (recharts) no aporta al test y da problemas de layout en jsdom: se stubea.
vi.mock('recharts', () => ({
  Bar: () => null,
  BarChart: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
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
  it('muestra métricas, gasto total, mesero que registró y badge de origen', () => {
    renderizar('super_admin')
    expect(screen.getByText('Comidas')).toBeInTheDocument()
    expect(screen.getByText('Comensales')).toBeInTheDocument()
    expect(screen.getByText('Gasto total')).toBeInTheDocument()
    expect(screen.getByText('$280.00')).toBeInTheDocument()
    // detalle: comensales y quién los registró
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0)
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
    expect(screen.getAllByText('Mesero Uno').length).toBeGreaterThan(0)
    // badges de origen
    expect(screen.getByText('Declarada')).toBeInTheDocument()
    expect(screen.getByText('Libre')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    // desglose por mesero
    expect(screen.getByText('Por mesero')).toBeInTheDocument()
  })

  it('rol mesero no tiene acceso', () => {
    renderizar('mesero')
    expect(screen.getByText(/no tienes acceso/i)).toBeInTheDocument()
  })
})
