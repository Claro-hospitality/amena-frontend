import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { aISO, diasDeSemana, esFinDeSemana, etiquetaDia } from '@amena/utils'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { Platillo } from '../platillos/api'
import type { MenuDiaConPlatillo } from './api'
import { semanasDelMes } from './logica'
import { VistaMes } from './VistaMes'

const platillo = (id: number, nombre: string): Platillo => ({
  id,
  nombre,
  descripcion: null,
  foto_url: null,
  activo: true,
  created_at: '',
  updated_at: '',
})

// Mes lejano en el futuro → los días son editables (no pasados), de forma determinista.
const mes = new Date(2999, 0, 1)
const semanas = semanasDelMes(mes)
// Un día hábil dentro del mes al que le asignamos el menú de prueba.
const objetivo = semanas
  .flatMap(diasDeSemana)
  .filter((d) => d.getMonth() === mes.getMonth() && !esFinDeSemana(d))[2]
const fechaISO = aISO(objetivo)

const menu: MenuDiaConPlatillo[] = [
  { id: 1, fecha: fechaISO, platillo: platillo(1, 'Sopa de fideo') },
  { id: 2, fecha: fechaISO, platillo: platillo(2, 'Pollo asado') },
  { id: 3, fecha: fechaISO, platillo: platillo(3, 'Arroz rojo') },
]

function renderizar(onAgregar = vi.fn(), onQuitar = vi.fn()) {
  return render(
    <TooltipProvider>
      <VistaMes
        mes={mes}
        semanas={semanas}
        menu={menu}
        activos={[platillo(9, 'Ensalada')]}
        onAgregar={onAgregar}
        onQuitar={onQuitar}
      />
    </TooltipProvider>
  )
}

describe('VistaMes (calendario)', () => {
  it('colapsa los platillos que exceden y muestra "+N más"', () => {
    renderizar()
    // Solo 2 visibles en la celda; el tercero queda oculto tras "+1 más".
    expect(screen.getByText('Sopa de fideo')).toBeInTheDocument()
    expect(screen.getByText('Pollo asado')).toBeInTheDocument()
    expect(screen.getByText('+1 más')).toBeInTheDocument()
    expect(screen.queryByText('Arroz rojo')).not.toBeInTheDocument()
  })

  it('abre el diálogo del día con el menú completo y el selector para agregar', async () => {
    const user = userEvent.setup()
    renderizar()
    await user.click(
      screen.getByRole('button', { name: `Editar menú de ${etiquetaDia(objetivo)}` })
    )
    // En el diálogo aparecen los 3 platillos (incluido el que estaba colapsado) y el selector.
    expect(await screen.findByText('Arroz rojo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Agregar platillo…')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /quitar arroz rojo/i })
    ).toBeInTheDocument()
  })
})
