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

import { MenuSemanal } from './MenuSemanal'

const dia0 = diasHabiles(lunesDeSemana(new Date())).map(aISO)[0]

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MenuSemanal />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MenuSemanal', () => {
  it('muestra los platillos del menú', async () => {
    api.menuSemana.mockResolvedValue([
      { fecha: dia0, platillo: { nombre: 'Milanesa con puré', foto_url: null } },
    ])
    renderizar()
    expect(await screen.findByText('Milanesa con puré')).toBeInTheDocument()
  })

  it('estado vacío cuando la semana no tiene menú', async () => {
    api.menuSemana.mockResolvedValue([])
    renderizar()
    expect(await screen.findByText(/sin menú esta semana/i)).toBeInTheDocument()
  })
})
