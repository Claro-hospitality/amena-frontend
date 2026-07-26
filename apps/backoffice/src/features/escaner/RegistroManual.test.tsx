import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { BusquedaComensal } from './api'

const mutate = vi.fn()
const comensales: BusquedaComensal[] = [
  {
    comensal_id: 7,
    nombre: 'Ana Ruiz',
    empresa_nombre: 'Acme',
    es_libre: false,
    tiene_cuota: true,
    consumio_hoy: false,
    ultima_hora: null,
    consumos_hoy: 0,
    limite_diario: null,
  },
]

vi.mock('./queries', () => ({
  useBuscarComensales: () => ({ data: comensales, isFetching: false }),
  useRegistrarManual: () => ({ mutate }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { RegistroManual } from './RegistroManual'

describe('RegistroManual', () => {
  it('busca, muestra el estado, confirma nombrando a la persona y registra', async () => {
    const user = userEvent.setup()
    render(<RegistroManual registradoPor="yo-1" />)

    // Buscar (2+ caracteres) → aparece el comensal con su estado de hoy.
    await user.type(screen.getByLabelText(/buscar comensal/i), 'Ana')
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
    expect(screen.getByText(/Con cuota disponible/)).toBeInTheDocument()

    // Abrir confirmación → el título nombra a la persona.
    await user.click(screen.getByRole('button', { name: /registrar comida/i }))
    expect(screen.getByText(/¿Registrar la comida de Ana Ruiz\?/)).toBeInTheDocument()

    // Confirmar → dispara la mutación con el comensal y el mesero.
    await user.click(screen.getByRole('button', { name: /registrar manualmente/i }))
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ comensalId: 7, registradoPor: 'yo-1' }),
      expect.anything()
    )
  })
})
