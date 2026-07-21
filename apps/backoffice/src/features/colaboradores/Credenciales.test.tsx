import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent } from '@amena/ui/components/ui/dialog'
import type { CredencialesAlta } from './api'
import { Credenciales } from './ColaboradorFormDialog'

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
