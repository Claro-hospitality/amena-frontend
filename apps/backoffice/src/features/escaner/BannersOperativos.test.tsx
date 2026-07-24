import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { EstadoOperativo } from './api'

let estado: EstadoOperativo | undefined

vi.mock('./queries', () => ({
  useEstadoOperativo: () => ({ data: estado }),
}))

import { BannersOperativos } from './BannersOperativos'

describe('BannersOperativos', () => {
  it('avisa cuando no hay menú cargado', () => {
    estado = { hay_menu: false, hay_cuotas: true }
    render(<BannersOperativos />)
    expect(screen.getByText(/no hay menú cargado/i)).toBeInTheDocument()
    expect(screen.queryByText(/no hay cuotas/i)).not.toBeInTheDocument()
  })

  it('avisa cuando no hay cuotas declaradas', () => {
    estado = { hay_menu: true, hay_cuotas: false }
    render(<BannersOperativos />)
    expect(screen.getByText(/no hay cuotas declaradas/i)).toBeInTheDocument()
    expect(screen.queryByText(/no hay menú/i)).not.toBeInTheDocument()
  })

  it('no muestra nada cuando todo está en orden', () => {
    estado = { hay_menu: true, hay_cuotas: true }
    const { container } = render(<BannersOperativos />)
    expect(container).toBeEmptyDOMElement()
  })
})
