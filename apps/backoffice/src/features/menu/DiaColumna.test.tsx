import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { Platillo } from '../platillos/api'
import type { MenuDiaConPlatillo } from './api'
import { DiaColumna } from './DiaColumna'

const platillo: Platillo = {
  id: 'p1',
  nombre: 'Milanesa con puré',
  descripcion: null,
  foto_url: null,
  activo: true,
  created_at: '',
  updated_at: '',
}
const asignado: MenuDiaConPlatillo = { id: 'm1', fecha: '', platillo }
const noop = vi.fn()

function renderizar(fecha: Date) {
  return render(
    <TooltipProvider>
      <DiaColumna
        fecha={fecha}
        asignados={[asignado]}
        activos={[platillo]}
        onAgregar={noop}
        onQuitar={noop}
      />
    </TooltipProvider>
  )
}

describe('DiaColumna', () => {
  it('día futuro: permite agregar (selector) y quitar', () => {
    renderizar(new Date(2999, 0, 4))
    expect(screen.getByPlaceholderText('Agregar platillo…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quitar milanesa con puré/i })).toBeInTheDocument()
  })

  it('día pasado: solo lectura (sin selector ni acción de quitar)', () => {
    renderizar(new Date(2020, 0, 6))
    expect(screen.queryByPlaceholderText('Agregar platillo…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /quitar/i })).not.toBeInTheDocument()
    expect(screen.getByText('Pasado')).toBeInTheDocument()
    // el platillo sigue visible, solo que no editable
    expect(screen.getByText('Milanesa con puré')).toBeInTheDocument()
  })
})
