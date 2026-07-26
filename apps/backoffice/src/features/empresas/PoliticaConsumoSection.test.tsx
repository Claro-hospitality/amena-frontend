import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mutate = vi.hoisted(() => vi.fn())
vi.mock('./queries', () => ({
  useActualizarEmpresa: () => ({ mutate, isPending: false }),
}))

import type { Empresa } from './api'
import { PoliticaConsumoSection } from './PoliticaConsumoSection'

const empresaReserva: Empresa = {
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

const empresaLibre: Empresa = {
  ...empresaReserva,
  modo_consumo: 'libre',
  dias_permitidos: [1, 2, 3, 4, 5],
  limite_diario: 2,
}

beforeEach(() => vi.clearAllMocks())

describe('PoliticaConsumoSection', () => {
  it('lectura: muestra el resumen de la política vigente (modo libre)', () => {
    render(<PoliticaConsumoSection empresa={empresaLibre} puedeGestionar={false} />)
    expect(screen.getByText(/consumo libre autorizado/i)).toBeInTheDocument()
    expect(screen.getByText(/L-V, máx 2\/día/i)).toBeInTheDocument()
    // Sin permiso: no hay controles de edición.
    expect(screen.queryByRole('switch', { name: /modo libre/i })).not.toBeInTheDocument()
  })

  it('finanzas (sin permiso) no ve controles de edición', () => {
    render(<PoliticaConsumoSection empresa={empresaReserva} puedeGestionar={false} />)
    expect(screen.queryByRole('switch', { name: /modo libre/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar política/i })).not.toBeInTheDocument()
  })

  it('super_admin ve el switch de modo libre; los días/límite aparecen al activarlo', async () => {
    const user = userEvent.setup()
    render(<PoliticaConsumoSection empresa={empresaReserva} puedeGestionar />)
    const modo = screen.getByRole('switch', { name: /modo libre/i })
    expect(modo).toBeInTheDocument()
    // En modo reserva no se ven días.
    expect(screen.queryByLabelText(/días permitidos/i)).not.toBeInTheDocument()
    await user.click(modo)
    expect(screen.getByLabelText(/días permitidos/i)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /límite diario/i })).toBeInTheDocument()
  })

  it('arma dias_permitidos (ISO) y limite_diario y guarda tras confirmar', async () => {
    const user = userEvent.setup()
    render(<PoliticaConsumoSection empresa={empresaReserva} puedeGestionar />)
    await user.click(screen.getByRole('switch', { name: /modo libre/i }))

    // Selecciona lunes y miércoles (ISO 1 y 3) — verifica el mapeo día → ISO dow.
    await user.click(screen.getByRole('button', { name: 'lunes' }))
    await user.click(screen.getByRole('button', { name: 'miércoles' }))
    // Límite 2/día.
    await user.click(screen.getByRole('radio', { name: /2 comidas por día/i }))

    await user.click(screen.getByRole('button', { name: /guardar política/i }))
    // Confirmación con el efecto comercial.
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/sin reserva previa/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /guardar cambios/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toEqual({
      id: 1,
      datos: { modo_consumo: 'libre', dias_permitidos: [1, 3], limite_diario: 2 },
    })
  })

  it('preselecciona días/límite existentes y agrega otro día (ISO ordenado)', async () => {
    const user = userEvent.setup()
    // Empresa ya en libre con solo lunes (ISO 1) y límite 2.
    render(
      <PoliticaConsumoSection
        empresa={{ ...empresaLibre, dias_permitidos: [1], limite_diario: 2 }}
        puedeGestionar
      />
    )
    // Agrega viernes (ISO 5); lunes sigue seleccionado.
    await user.click(screen.getByRole('button', { name: 'viernes' }))
    await user.click(screen.getByRole('button', { name: /guardar política/i }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /guardar cambios/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toEqual({
      id: 1,
      datos: { modo_consumo: 'libre', dias_permitidos: [1, 5], limite_diario: 2 },
    })
  })
})
