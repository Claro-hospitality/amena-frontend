import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

// jsdom no implementa canvas; se stubea qrcode.react (mismo patrón que CredencialDialog.test).
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value }: { value: string }) => <canvas data-testid="qr-canvas" data-value={value} />,
}))

import type { InvitadoSemana } from './api'
import { DiaResumen } from './DiaResumen'

const invitados: InvitadoSemana[] = [
  { id: 1, nombre: 'Gil', apellido: 'Silva', fecha: '2026-07-31', estado: 'usado', qr_token: 'tok-1' },
  { id: 2, nombre: 'Ana', apellido: null, fecha: '2026-07-31', estado: 'pendiente', qr_token: 'tok-2' },
]

function renderizar() {
  return render(
    <DiaResumen
      fecha={new Date('2026-07-31T12:00:00')}
      cuotas={[]}
      consumos={[]}
      invitados={invitados}
      empresaNombre="DHL"
    />
  )
}

describe('DiaResumen — invitados', () => {
  it('cada invitado tiene un botón para ver su pase; abrirlo muestra el diálogo del pase', async () => {
    const user = userEvent.setup()
    renderizar()
    expect(screen.getByText('Gil Silva')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver pase de Ana' }))
    expect(screen.getByText('Pase de invitado')).toBeInTheDocument()
  })

  it('el pase de un invitado ya consumido indica "Ya consumido"', async () => {
    const user = userEvent.setup()
    renderizar()
    await user.click(screen.getByRole('button', { name: 'Ver pase de Gil' }))
    expect(screen.getByText('Ya consumido')).toBeInTheDocument()
  })
})
