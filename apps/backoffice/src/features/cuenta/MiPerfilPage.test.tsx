import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./queries', () => ({
  useMiPerfil: () => ({ data: { nombre: 'Cristian Soria', rol: 'super_admin' }, isLoading: false }),
}))
vi.mock('../../auth/useAuth', () => ({
  useAuth: () => ({ session: { user: { email: 'cris@amena.social' } } }),
}))
// CambiarPasswordForm toca Supabase vía ./api; se mockea para aislar la pantalla.
vi.mock('./api', () => ({ cambiarMiPassword: vi.fn() }))

import { MiPerfilPage } from './MiPerfilPage'

describe('MiPerfilPage', () => {
  it('muestra la información del usuario y el formulario para restablecer la contraseña', () => {
    render(<MiPerfilPage />)
    expect(screen.getAllByText('Cristian Soria').length).toBeGreaterThan(0)
    expect(screen.getByText('cris@amena.social')).toBeInTheDocument()
    expect(screen.getAllByText('Super administrador').length).toBeGreaterThan(0)
    // Restablecer contraseña: exige la actual + botón.
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /actualizar contraseña/i })
    ).toBeInTheDocument()
  })
})
