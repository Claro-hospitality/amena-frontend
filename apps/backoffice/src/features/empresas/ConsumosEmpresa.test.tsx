import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { aISO, diasHabiles, lunesDeSemana } from '@amena/utils'
import type { ReservaSemana } from './api'
import type { ConsumoRow } from '../consumos/api'

// Días de la semana actual (el componente calcula la semana con new Date()).
const dias = diasHabiles(lunesDeSemana(new Date()))
const d0 = aISO(dias[0])
const d1 = aISO(dias[1])

const reservas: ReservaSemana[] = [
  { comensal_id: 33, nombre: 'Dina Juarez', fecha: d0, origen: 'reserva', consumido: true },
  { comensal_id: 35, nombre: 'Guadalupe Villalobos', fecha: d1, origen: 'reserva', consumido: false },
]

const consumos: ConsumoRow[] = [
  {
    id: 1,
    fecha: d0,
    created_at: `${d0}T18:00:00Z`,
    comensal_id: 33,
    comensal_nombre: 'Dina Juarez',
    es_invitado: false,
    empresa_id: 7,
    empresa_nombre: 'DHL',
    precio_comida: 195,
    registrado_por: 'u-1',
    mesero_nombre: 'Mesero Uno',
    origen: 'reserva',
    total_filtrado: 1,
  },
]

const mocks = vi.hoisted(() => ({
  useReservasSemanaEmpresa: vi.fn(),
  useConsumos: vi.fn(),
}))
vi.mock('./queries', () => ({ useReservasSemanaEmpresa: mocks.useReservasSemanaEmpresa }))
vi.mock('../consumos/queries', () => ({ useConsumos: mocks.useConsumos }))

import { ConsumosEmpresa } from './ConsumosEmpresa'

describe('ConsumosEmpresa', () => {
  it('muestra la grilla de reservas (consumió/reservado) y el historial de consumos', () => {
    mocks.useReservasSemanaEmpresa.mockReturnValue({ data: reservas, isLoading: false })
    mocks.useConsumos.mockReturnValue({ data: { rows: consumos, total: 1 }, isLoading: false })

    render(<ConsumosEmpresa empresaId={7} />)

    // Reservas: ambos comensales + estados.
    expect(screen.getByText('Reservas de la semana')).toBeInTheDocument()
    expect(screen.getAllByText('Dina Juarez').length).toBeGreaterThan(0)
    expect(screen.getByText('Guadalupe Villalobos')).toBeInTheDocument()
    expect(screen.getByText('Consumió')).toBeInTheDocument()
    expect(screen.getByText('Reservado')).toBeInTheDocument()
    expect(screen.getByText(/2 reservados · 1 consumido/i)).toBeInTheDocument()

    // Historial de consumos.
    expect(screen.getByText(/Historial de consumos/i)).toBeInTheDocument()
  })

  it('sin reservas muestra el vacío', () => {
    mocks.useReservasSemanaEmpresa.mockReturnValue({ data: [], isLoading: false })
    mocks.useConsumos.mockReturnValue({ data: { rows: [], total: 0 }, isLoading: false })

    render(<ConsumosEmpresa empresaId={7} />)
    expect(screen.getByText(/sin reservas esta semana/i)).toBeInTheDocument()
  })
})
