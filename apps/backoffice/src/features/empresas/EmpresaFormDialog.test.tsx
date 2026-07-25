import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mockeamos los hooks de datos: aquí probamos el comportamiento del formulario con tabs,
// no la red. `datosFiscalesEmpresa` controla el estado del tab fiscal (vacío vs con datos).
const crear = vi.hoisted(() => ({ mutateAsync: vi.fn() }))
const actualizar = vi.hoisted(() => ({ mutateAsync: vi.fn() }))
const guardarFiscal = vi.hoisted(() => ({ mutateAsync: vi.fn() }))
const datosFiscalesEmpresa = vi.hoisted(() => ({
  data: null as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}))

vi.mock('./queries', () => ({
  useCrearEmpresa: () => crear,
  useActualizarEmpresa: () => actualizar,
  useGuardarDatosFiscales: () => guardarFiscal,
  useDatosFiscalesEmpresa: () => datosFiscalesEmpresa,
}))

import type { Empresa } from './api'
import { EmpresaFormDialog } from './EmpresaFormDialog'

const empresa: Empresa = {
  id: 1,
  nombre_comercial: 'Constructora Norte',
  precio_comida: 100,
  ciclo_facturacion: 'mensual',
  activo: true,
  created_at: '',
  updated_at: '',
  modo_consumo: 'reserva',
  dias_permitidos: [],
  limite_diario: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  datosFiscalesEmpresa.data = null
  crear.mutateAsync.mockResolvedValue({ ...empresa })
  actualizar.mutateAsync.mockResolvedValue({ ...empresa })
  guardarFiscal.mutateAsync.mockResolvedValue({})
})

describe('EmpresaFormDialog', () => {
  it('creación: el tab de datos fiscales está deshabilitado', () => {
    render(<EmpresaFormDialog empresa={null} onClose={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /datos comerciales/i })).toBeInTheDocument()
    // Base UI marca los tabs deshabilitados con aria-disabled (no el atributo `disabled`).
    expect(screen.getByRole('tab', { name: /datos fiscales/i })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    // El tab comercial muestra sus campos.
    expect(screen.getByLabelText(/nombre comercial/i)).toBeInTheDocument()
  })

  it('edición: alterna entre tabs y el fiscal sin fila muestra su CTA', async () => {
    const user = userEvent.setup()
    render(<EmpresaFormDialog empresa={empresa} onClose={vi.fn()} />)

    await user.click(screen.getByRole('tab', { name: /datos fiscales/i }))
    // Estado vacío con CTA para revelar el formulario.
    const cta = await screen.findByRole('button', { name: /configurar datos fiscales para facturar/i })
    expect(cta).toBeInTheDocument()
    await user.click(cta)
    expect(screen.getByLabelText('Razón social')).toBeInTheDocument()
    expect(screen.getByLabelText('RFC')).toBeInTheDocument()
  })

  it('edición: con datos fiscales existentes, precarga el formulario', async () => {
    const user = userEvent.setup()
    datosFiscalesEmpresa.data = {
      id: 10,
      empresa_id: 1,
      razon_social: 'Constructora Norte S.A. de C.V.',
      rfc: 'XAXX010101000',
      codigo_postal_fiscal: '',
      regimen_fiscal: '',
      uso_cfdi: 'G03',
      email_facturacion: '',
      activo: true,
      created_at: '',
      updated_at: '',
    }
    render(<EmpresaFormDialog empresa={empresa} onClose={vi.fn()} />)
    await user.click(screen.getByRole('tab', { name: /datos fiscales/i }))
    expect(await screen.findByDisplayValue('Constructora Norte S.A. de C.V.')).toBeInTheDocument()
    expect(screen.getByDisplayValue('XAXX010101000')).toBeInTheDocument()
  })

  it('guardado fiscal independiente: valida y hace upsert sin tocar el comercial', async () => {
    const user = userEvent.setup()
    datosFiscalesEmpresa.data = {
      id: 10,
      empresa_id: 1,
      razon_social: 'Constructora Norte S.A. de C.V.',
      rfc: 'XAXX010101000',
      codigo_postal_fiscal: '06600',
      regimen_fiscal: '601',
      uso_cfdi: 'G03',
      email_facturacion: 'facturacion@empresa.com',
      activo: true,
      created_at: '',
      updated_at: '',
    }
    render(<EmpresaFormDialog empresa={empresa} onClose={vi.fn()} />)
    await user.click(screen.getByRole('tab', { name: /datos fiscales/i }))
    await user.click(await screen.findByRole('button', { name: /guardar datos fiscales/i }))

    await waitFor(() => expect(guardarFiscal.mutateAsync).toHaveBeenCalledTimes(1))
    expect(guardarFiscal.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ empresaId: 1 })
    )
    // No tocó el submit comercial.
    expect(actualizar.mutateAsync).not.toHaveBeenCalled()
  })

  it('guardado fiscal: RFC inválido muestra error y no hace upsert', async () => {
    const user = userEvent.setup()
    datosFiscalesEmpresa.data = {
      id: 10,
      empresa_id: 1,
      razon_social: 'Constructora Norte S.A. de C.V.',
      rfc: 'INVALIDO',
      codigo_postal_fiscal: '06600',
      regimen_fiscal: '601',
      uso_cfdi: 'G03',
      email_facturacion: 'facturacion@empresa.com',
      activo: true,
      created_at: '',
      updated_at: '',
    }
    render(<EmpresaFormDialog empresa={empresa} onClose={vi.fn()} />)
    await user.click(screen.getByRole('tab', { name: /datos fiscales/i }))
    await user.click(await screen.findByRole('button', { name: /guardar datos fiscales/i }))

    expect(await screen.findByText(/rfc inválido/i)).toBeInTheDocument()
    expect(guardarFiscal.mutateAsync).not.toHaveBeenCalled()
  })
})
