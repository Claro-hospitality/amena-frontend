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

import { ResumenSemana } from './ResumenSemana'

const dias = diasHabiles(lunesDeSemana(new Date())).map(aISO)

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <ResumenSemana />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Por defecto: sin comensal libre (camino de reserva). Los tests de libre lo sobreescriben.
  api.obtenerMiColaborador.mockResolvedValue(null)
})

describe('ResumenSemana', () => {
  it('resume la semana (te quedan X de Y)', async () => {
    api.misCuotasSemana.mockResolvedValue([
      { fecha: dias[0], origen: 'reserva', activo: true },
      { fecha: dias[1], origen: 'reserva', activo: true },
      { fecha: dias[2], origen: 'reserva', activo: true },
    ])
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar()
    // 3 asignadas, 1 usada → quedan 2
    expect(await screen.findByText(/te quedan 2 de 3 comidas/i)).toBeInTheDocument()
  })

  it('sin consumos muestra el aviso de la semana', async () => {
    api.misCuotasSemana.mockResolvedValue([])
    api.misConsumos.mockResolvedValue([])
    renderizar()
    expect(await screen.findByText(/aún no has consumido esta semana/i)).toBeInTheDocument()
  })

  it('en consumo libre muestra el avance contra la política (no "te quedan")', async () => {
    // Empresa en modo libre + comensal con consumo_libre: L-V, 1/día.
    api.obtenerMiColaborador.mockResolvedValue({
      consumoLibre: true,
      politica: { modo_consumo: 'libre', dias_permitidos: [1, 2, 3, 4, 5], limite_diario: 1 },
    })
    api.misCuotasSemana.mockResolvedValue([])
    // Un consumo el lunes de la semana en curso (siempre ≤ hoy dentro de la semana).
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: `${dias[0]}T13:00:00Z` }])
    renderizar()

    expect(await screen.findByText(/llevas 1 de 5 comidas/i)).toBeInTheDocument()
    expect(screen.getByText(/máx 1\/día/i)).toBeInTheDocument()
    expect(screen.queryByText(/te quedan/i)).not.toBeInTheDocument()
  })
})
