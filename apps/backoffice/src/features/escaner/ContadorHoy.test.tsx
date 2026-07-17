import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  contarConsumosHoy: vi.fn(),
  listarConsumosHoy: vi.fn(),
  registrarConsumo: vi.fn(),
}))
vi.mock('./api', () => api)

import { ContadorHoy } from './ContadorHoy'

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <ContadorHoy />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ContadorHoy', () => {
  it('muestra el total del día', async () => {
    api.contarConsumosHoy.mockResolvedValue(47)
    renderizar()
    expect(await screen.findByText('47')).toBeInTheDocument()
    expect(screen.getByText(/comidas/i)).toBeInTheDocument()
  })

  it('muestra un marcador mientras carga', () => {
    api.contarConsumosHoy.mockReturnValue(new Promise(() => {}))
    renderizar()
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
