import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

// La cámara real usa zxing/getUserMedia; la sustituimos por un botón que simula una lectura.
vi.mock('./CamaraQR', () => ({
  CamaraQR: ({ activo, onDetectar }: { activo: boolean; onDetectar: (t: string) => void }) => (
    <div>
      <span>camara:{activo ? 'activa' : 'pausada'}</span>
      <button onClick={() => onDetectar('10000000-0000-0000-0000-000000000001')}>leer</button>
    </div>
  ),
}))
vi.mock('@amena/ui/hooks/use-wake-lock', () => ({ useWakeLock: () => {} }))
vi.mock('./queries', () => ({
  useRegistrarConsumo: () => ({
    mutate: (
      _vars: unknown,
      opts: { onSuccess: (r: unknown) => void }
    ) =>
      opts.onSuccess({
        comensalNombre: 'Ana',
        empresaNombre: null,
        consumosHoy: 1,
        modo: 'declaracion',
        consumo: { created_at: '2026-07-24T13:00:00Z' },
      }),
  }),
}))

import { EscanerDialog } from './EscanerDialog'

describe('EscanerDialog — escaneo continuo', () => {
  it('tras validar un QR muestra el resultado SIN cerrar la cámara', async () => {
    const user = userEvent.setup()
    render(<EscanerDialog open onOpenChange={vi.fn()} registradoPor="m1" />)

    // Cámara activa al inicio.
    expect(screen.getByText('camara:activa')).toBeInTheDocument()

    // Simular una lectura válida → aparece el resultado (nombre) del overlay.
    await user.click(screen.getByRole('button', { name: /leer/i }))
    expect(screen.getByText('Ana')).toBeInTheDocument()

    // La cámara sigue montada (no se cerró); solo se pausó mientras se muestra el resultado.
    expect(screen.getByText('camara:pausada')).toBeInTheDocument()
    // El botón para cerrar la cámara sigue disponible para cuando termine la fila.
    expect(screen.getByRole('button', { name: /cerrar cámara/i })).toBeInTheDocument()
  })
})
