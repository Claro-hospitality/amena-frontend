import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  useFacturaDeCorte: vi.fn(),
  useFacturarCorte: vi.fn(),
  useDatosFiscalesEmpresa: vi.fn(),
}))
vi.mock('./queries', () => ({
  useFacturaDeCorte: mocks.useFacturaDeCorte,
  useFacturarCorte: mocks.useFacturarCorte,
}))
vi.mock('../empresas/queries', () => ({ useDatosFiscalesEmpresa: mocks.useDatosFiscalesEmpresa }))

import type { CorteConEmpresa } from '../cortes/api'
import { SeccionFacturaCorte } from './SeccionFacturaCorte'

const corte = {
  id: 7,
  empresa_id: 1,
  semana_inicio: '2026-07-13',
  reservadas: 5,
  consumidas: 4,
  extras: 0,
  precio_unitario: 85,
  monto_total: 340,
  estado: 'cerrado',
  created_at: '',
  updated_at: '',
  empresa: { nombre: 'Empresa A' },
} as unknown as CorteConEmpresa

const dfCompleto = {
  id: 3,
  empresa_id: 1,
  razon_social: 'Empresa A',
  rfc: 'EMA120101AAA',
  codigo_postal_fiscal: '64000',
  regimen_fiscal: '601',
  uso_cfdi: 'G03',
  email_facturacion: 'a@a.com',
  activo: true,
  created_at: '',
  updated_at: '',
}

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SeccionFacturaCorte corte={corte} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.useFacturarCorte.mockReturnValue({ mutate: vi.fn(), isPending: false })
  mocks.useDatosFiscalesEmpresa.mockReturnValue({ data: dfCompleto })
  mocks.useFacturaDeCorte.mockReturnValue({ data: null, isLoading: false })
})

describe('SeccionFacturaCorte', () => {
  it('habilita Facturar cuando el corte está listo', () => {
    renderizar()
    expect(screen.getByRole('button', { name: /facturar/i })).toBeEnabled()
  })

  it('deshabilita Facturar y explica si faltan datos fiscales', () => {
    mocks.useDatosFiscalesEmpresa.mockReturnValue({
      data: { ...dfCompleto, codigo_postal_fiscal: '' },
    })
    renderizar()
    expect(screen.getByRole('button', { name: /facturar/i })).toBeDisabled()
    expect(screen.getByText(/datos fiscales completos/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /configurar datos fiscales/i })).toBeInTheDocument()
  })

  it('muestra folio, UUID y descargas cuando está emitida', () => {
    mocks.useFacturaDeCorte.mockReturnValue({
      data: {
        estado: 'emitida',
        serie: 'A',
        folio: '123',
        uuid_sat: 'UUID-1',
        pdf_url: '1/42.pdf',
        xml_url: '1/42.xml',
      },
      isLoading: false,
    })
    renderizar()
    expect(screen.getByText('A-123')).toBeInTheDocument()
    expect(screen.getByText('UUID-1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver factura/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^facturar$/i })).not.toBeInTheDocument()
  })

  it('muestra el mensaje del SAT y Reintentar cuando está en error', () => {
    mocks.useFacturaDeCorte.mockReturnValue({
      data: { estado: 'error', serie: 'A', folio: '1', mensaje_error: 'RFC inválido ante el SAT' },
      isLoading: false,
    })
    renderizar()
    expect(screen.getByText(/rfc inválido ante el sat/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
