import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResultadoOverlay } from './ResultadoOverlay'

afterEach(() => {
  vi.useRealTimers()
})

describe('ResultadoOverlay', () => {
  it('éxito muestra el nombre, empresa y hora', () => {
    render(
      <ResultadoOverlay
        resultado={{ tipo: 'exito', nombre: 'Juan Pérez', empresa: 'Constructora', hora: '13:05' }}
        onCerrar={() => {}}
      />
    )
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Constructora')).toBeInTheDocument()
    expect(screen.getByText('13:05')).toBeInTheDocument()
  })

  it('en modo libre muestra el ordinal "Nª comida de hoy"', () => {
    render(
      <ResultadoOverlay
        resultado={{
          tipo: 'exito',
          nombre: 'Juan Pérez',
          empresa: 'Constructora',
          hora: '13:05',
          modo: 'libre',
          consumosHoy: 2,
        }}
        onCerrar={() => {}}
      />
    )
    expect(screen.getByText('2ª comida de hoy')).toBeInTheDocument()
  })

  it('en modo reserva NO muestra el conteo del día', () => {
    render(
      <ResultadoOverlay
        resultado={{
          tipo: 'exito',
          nombre: 'Juan Pérez',
          empresa: 'Constructora',
          hora: '13:05',
          modo: 'reserva',
          consumosHoy: 2,
        }}
        onCerrar={() => {}}
      />
    )
    expect(screen.queryByText(/comida de hoy/i)).not.toBeInTheDocument()
  })

  it('rechazo muestra el motivo gigante', () => {
    render(
      <ResultadoOverlay
        resultado={{ tipo: 'rechazo', motivo: 'Ya consumió hoy', nombre: 'Juan Pérez' }}
        onCerrar={() => {}}
      />
    )
    expect(screen.getByText('Ya consumió hoy')).toBeInTheDocument()
  })

  it('se auto-descarta a los ~4s', () => {
    vi.useFakeTimers()
    const onCerrar = vi.fn()
    render(
      <ResultadoOverlay
        resultado={{ tipo: 'rechazo', motivo: 'QR no válido', nombre: null }}
        onCerrar={onCerrar}
      />
    )
    expect(onCerrar).not.toHaveBeenCalled()
    vi.advanceTimersByTime(4000)
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('se descarta por toque', async () => {
    const user = userEvent.setup()
    const onCerrar = vi.fn()
    render(
      <ResultadoOverlay
        resultado={{ tipo: 'exito', nombre: 'Ana', empresa: null, hora: '10:00' }}
        onCerrar={onCerrar}
      />
    )
    await user.click(screen.getByRole('button', { name: /descartar/i }))
    expect(onCerrar).toHaveBeenCalled()
  })
})
