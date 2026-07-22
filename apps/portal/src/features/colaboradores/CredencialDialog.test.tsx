import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock de qrcode.react para capturar EXACTAMENTE lo que codifica el QR.
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-svg" data-value={value} />,
  QRCodeCanvas: ({ value }: { value: string }) => <canvas data-testid="qr-canvas" data-value={value} />,
}))

import type { Colaborador } from './api'
import { CredencialDialog } from './CredencialDialog'

const colaborador = {
  id: 1,
  usuario_id: 5,
  user_id: null,
  nombre: 'María López',
  email: null,
  telefono: null,
  activo: true,
  consumoLibre: false,
  qr_token: '10000000-0000-0000-0000-000000000001',
  empresa: { nombre: 'Constructora Norte' },
  politica: null,
} satisfies Colaborador

describe('CredencialDialog', () => {
  it('el QR codifica exactamente el qr_token del comensal', () => {
    render(<CredencialDialog colaborador={colaborador} onClose={() => {}} />)
    expect(screen.getByTestId('qr-svg')).toHaveAttribute('data-value', colaborador.qr_token)
  })

  it('muestra el nombre y la empresa en la credencial', () => {
    render(<CredencialDialog colaborador={colaborador} onClose={() => {}} />)
    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText('Constructora Norte')).toBeInTheDocument()
  })
})
