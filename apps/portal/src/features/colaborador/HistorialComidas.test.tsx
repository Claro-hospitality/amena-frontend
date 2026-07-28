import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aISO, diasHabiles, lunesDeSemana } from '@amena/utils'

const api = vi.hoisted(() => ({
  obtenerMiColaborador: vi.fn(),
  estadoDeHoy: vi.fn(),
  menuDelDia: vi.fn(),
  menuSemana: vi.fn(),
  misCuotasSemana: vi.fn(),
  misConsumos: vi.fn(),
  misConsumosDelMes: vi.fn(),
}))
vi.mock('./api', () => api)

import { HistorialComidas } from './HistorialComidas'

const dias = diasHabiles(lunesDeSemana(new Date())).map(aISO)

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <HistorialComidas />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HistorialComidas', () => {
  it('resume la semana y muestra el calendario de historial', async () => {
    api.misCuotasSemana.mockResolvedValue([
      { fecha: dias[0], origen: 'reserva', activo: true },
      { fecha: dias[1], origen: 'reserva', activo: true },
      { fecha: dias[2], origen: 'reserva', activo: true },
    ])
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    api.misConsumosDelMes.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar()
    // 3 asignadas, 1 usada → quedan 2
    expect(await screen.findByText(/te quedan 2 de 3 comidas/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /historial de comidas/i })).toBeInTheDocument()
  })

  it('muestra el calendario aunque no haya consumos', async () => {
    api.misCuotasSemana.mockResolvedValue([])
    api.misConsumos.mockResolvedValue([])
    api.misConsumosDelMes.mockResolvedValue([])
    renderizar()
    expect(await screen.findByRole('heading', { name: /historial de comidas/i })).toBeInTheDocument()
  })
})
