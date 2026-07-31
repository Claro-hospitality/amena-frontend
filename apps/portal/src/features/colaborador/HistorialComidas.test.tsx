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
  it('muestra el calendario con los días de consumo del mes', async () => {
    api.misConsumosDelMes.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar()
    expect(await screen.findByRole('heading', { name: /historial de comidas/i })).toBeInTheDocument()
  })

  it('muestra el calendario aunque no haya consumos', async () => {
    api.misConsumosDelMes.mockResolvedValue([])
    renderizar()
    expect(await screen.findByRole('heading', { name: /historial de comidas/i })).toBeInTheDocument()
  })
})
