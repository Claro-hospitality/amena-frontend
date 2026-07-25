import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ConsumoHoy } from './api'

let consumos: ConsumoHoy[] = []

vi.mock('./queries', () => ({
  useConsumosHoy: () => ({ data: consumos }),
}))

import { ResumenTurno } from './ResumenTurno'

function fila(over: Partial<ConsumoHoy>): ConsumoHoy {
  return {
    id: Math.random(),
    created_at: '2026-07-24T12:00:00Z',
    comensal_nombre: 'X',
    empresa_nombre: 'Acme',
    registrado_por: 'otro',
    mesero_nombre: 'M',
    metodo: 'qr',
    origen: 'reserva',
    ...over,
  }
}

describe('ResumenTurno', () => {
  it('cuenta el total, mis escaneos y los consumos libres', () => {
    consumos = [
      fila({ registrado_por: 'yo-1', origen: 'reserva' }),
      fila({ registrado_por: 'otro', origen: 'libre' }),
      fila({ registrado_por: 'otro', origen: 'libre' }),
    ]
    render(<ResumenTurno miUid="yo-1" />)
    expect(screen.getByText('Servidas hoy')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // total
    expect(screen.getByText('Tus escaneos')).toBeInTheDocument()
    expect(screen.getByText('Consumos libres')).toBeInTheDocument()
  })

  it('oculta "Consumos libres" cuando no hay ninguno en modo libre', () => {
    consumos = [fila({ origen: 'reserva' })]
    render(<ResumenTurno miUid="yo-1" />)
    expect(screen.queryByText('Consumos libres')).not.toBeInTheDocument()
  })
})
