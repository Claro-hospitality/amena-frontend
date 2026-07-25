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
  it('resume la semana y lista los consumos', async () => {
    api.misCuotasSemana.mockResolvedValue([
      { fecha: dias[0], origen: 'declaracion', activo: true },
      { fecha: dias[1], origen: 'declaracion', activo: true },
      { fecha: dias[2], origen: 'declaracion', activo: true },
    ])
    api.misConsumos.mockResolvedValue([{ fecha: dias[0], created_at: '2026-07-13T14:32:00Z' }])
    renderizar()
    // 3 asignadas, 1 usada → quedan 2
    expect(await screen.findByText(/te quedan 2 de 3 comidas/i)).toBeInTheDocument()
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument()
  })

  it('estado vacío cuando no hay consumos', async () => {
    api.misCuotasSemana.mockResolvedValue([])
    api.misConsumos.mockResolvedValue([])
    renderizar()
    expect(await screen.findByText(/aún no tienes comidas registradas/i)).toBeInTheDocument()
  })
})
