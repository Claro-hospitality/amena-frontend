import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Dialog, DialogContent } from '@amena/ui/components/ui/dialog'
import type { CredencialesAlta } from './api'
import { Credenciales } from './ColaboradorFormDialog'

// ColaboradorFormDialog importa ./queries (que a su vez importa ./api → cliente de
// Supabase, el cual falla sin env, p. ej. en CI). Este test solo renderiza el
// subcomponente Credenciales, que no usa esos hooks: mock con factory para NO cargar
// el módulo real (ni su cadena a Supabase).
vi.mock('./queries', () => ({
  useColaboradores: vi.fn(),
  useAltaUsuario: vi.fn(),
}))

function renderizar(credenciales: CredencialesAlta) {
  return render(
    <Dialog open onOpenChange={() => {}}>
      <DialogContent>
        <Credenciales credenciales={credenciales} onClose={() => {}} />
      </DialogContent>
    </Dialog>
  )
}

describe('Credenciales', () => {
  it('cuenta nueva: muestra el correo y la contraseña temporal', () => {
    renderizar({ rol: 'colaborador', email: 'juan@cn.com', yaTeniaCuenta: false, tempPassword: 'Abc-123-Xyz' })
    expect(screen.getByText('Acceso creado')).toBeInTheDocument()
    expect(screen.getByText('juan@cn.com')).toBeInTheDocument()
    expect(screen.getByText('Abc-123-Xyz')).toBeInTheDocument()
    expect(screen.getByText('Contraseña temporal')).toBeInTheDocument() // label exacto del campo
  })

  it('cuenta existente (yaTeniaCuenta): sin contraseña, avisa que use la actual', () => {
    renderizar({ rol: 'admin', email: 'ana@cn.com', yaTeniaCuenta: true })
    expect(screen.getByText('Rol asignado')).toBeInTheDocument()
    expect(screen.getByText(/usa su contraseña actual/i)).toBeInTheDocument()
    expect(screen.getByText('ana@cn.com')).toBeInTheDocument()
    // No se muestra ningún campo de contraseña temporal.
    expect(screen.queryByText(/contraseña temporal/i)).not.toBeInTheDocument()
  })
})
