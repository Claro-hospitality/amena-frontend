import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TarjetaPlatillo } from './TarjetaPlatillo'

const platillo = {
  nombre: 'Milanesa con puré',
  foto_url: 'https://ejemplo.test/milanesa.jpg',
  descripcion:
    'Milanesa de res empanizada, servida con puré de papa cremoso, ensalada fresca y una guarnición de arroz a la mexicana.',
}

describe('TarjetaPlatillo', () => {
  it('al presionar el platillo abre un diálogo con la imagen y la descripción completa', async () => {
    const user = userEvent.setup()
    render(<TarjetaPlatillo platillo={platillo} />)

    // Sin diálogo hasta que se presiona la tarjeta.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ver milanesa con puré/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /milanesa con puré/i })).toBeInTheDocument()
    expect(within(dialog).getByText(platillo.descripcion)).toBeInTheDocument()
    const img = within(dialog).getByRole('img', { name: /milanesa con puré/i })
    expect(img).toHaveAttribute('src', platillo.foto_url)
  })

  it('sin descripción muestra un texto por defecto en el diálogo', async () => {
    const user = userEvent.setup()
    render(<TarjetaPlatillo platillo={{ nombre: 'Sopa del día', foto_url: null, descripcion: null }} />)

    await user.click(screen.getByRole('button', { name: /ver sopa del día/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/sin descripción disponible/i)).toBeInTheDocument()
  })
})
