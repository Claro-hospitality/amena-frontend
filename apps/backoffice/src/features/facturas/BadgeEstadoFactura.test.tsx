import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EstadoFactura } from './api'
import { BadgeEstadoFactura } from './BadgeEstadoFactura'

describe('BadgeEstadoFactura', () => {
  it('muestra la etiqueta de cada estado', () => {
    const casos: Array<[EstadoFactura, string]> = [
      ['borrador', 'Borrador'],
      ['emitida', 'Emitida'],
      ['error', 'Error'],
      ['pagada', 'Pagada'],
      ['cancelada', 'Cancelada'],
    ]
    for (const [estado, label] of casos) {
      const { unmount } = render(<BadgeEstadoFactura estado={estado} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })
})
