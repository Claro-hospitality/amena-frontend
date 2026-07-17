import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  obtenerMiColaborador: vi.fn(),
  estadoDeHoy: vi.fn(),
  menuDelDia: vi.fn(),
  menuSemana: vi.fn(),
  misCuotasSemana: vi.fn(),
  misConsumos: vi.fn(),
}))
vi.mock('./api', () => api)
vi.mock('qrcode.react', () => ({ QRCodeSVG: () => null, QRCodeCanvas: () => null }))

import { InicioColaboradorPage } from './InicioColaboradorPage'

const colaborador = {
  id: '10000000-0000-0000-0000-000000000001',
  empresa_id: 'e1',
  user_id: 'u1',
  nombre: 'Juan Pérez',
  email: null,
  activo: true,
  created_at: '',
  updated_at: '',
  empresa: null,
}

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <InicioColaboradorPage />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.obtenerMiColaborador.mockResolvedValue(colaborador)
  api.menuDelDia.mockResolvedValue([])
  api.estadoDeHoy.mockResolvedValue({ tieneCuota: false, consumo: null })
})

describe('InicioColaboradorPage', () => {
  it('muestra la credencial con el nombre y el botón de QR grande', async () => {
    renderizar()
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mostrar en grande/i })).toBeInTheDocument()
  })

  it('estado: ya comiste hoy con la hora', async () => {
    api.estadoDeHoy.mockResolvedValue({ tieneCuota: true, consumo: { created_at: '2026-07-17T14:32:00Z' } })
    renderizar()
    expect(await screen.findByText(/ya comiste hoy a las \d{2}:\d{2}/i)).toBeInTheDocument()
  })

  it('estado: tiene comida hoy', async () => {
    api.estadoDeHoy.mockResolvedValue({ tieneCuota: true, consumo: null })
    renderizar()
    expect(await screen.findByText(/tienes comida hoy/i)).toBeInTheDocument()
  })

  it('estado: sin comida asignada hoy', async () => {
    api.estadoDeHoy.mockResolvedValue({ tieneCuota: false, consumo: null })
    renderizar()
    expect(await screen.findByText(/sin comida asignada hoy/i)).toBeInTheDocument()
  })

  it('abre el QR a pantalla completa', async () => {
    const user = userEvent.setup()
    renderizar()
    await user.click(await screen.findByRole('button', { name: /mostrar en grande/i }))
    expect(screen.getByRole('dialog', { name: /código qr/i })).toBeInTheDocument()
  })
})
