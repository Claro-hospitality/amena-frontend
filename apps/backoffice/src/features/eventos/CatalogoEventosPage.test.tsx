import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import type { Evento } from './api'
import { CatalogoEventosPage } from './CatalogoEventosPage'

const api = vi.hoisted(() => ({
  listarEventos: vi.fn(),
  obtenerEventoPorSlug: vi.fn(),
  guardarEvento: vi.fn(),
  obtenerResumen: vi.fn(),
  slugify: (s: string) => s,
  CATEGORIAS: ['Cata', 'Taller', 'Cena'],
}))
vi.mock('./api', () => api)

function evento(over: Partial<Evento> = {}): Evento {
  return {
    id: 'id-1',
    slug: 'cata-de-vinos',
    categoria: 'Cata',
    titulo: 'Cata de vinos mexicanos',
    descripcion_corta: 'Seis etiquetas',
    descripcion_larga: null,
    incluye: null,
    fecha: '2026-08-15',
    hora_inicio: '19:00:00',
    hora_fin: '21:30:00',
    lugar: 'Amena',
    precio: 850,
    cupo_total: 24,
    cupo_disponible: 12,
    estado: 'Publicado',
    imagen_url: 'https://x/1.jpg',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...over,
  }
}

function renderizar(rol: RolBackoffice) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol }} />}>
            <Route index element={<CatalogoEventosPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CatalogoEventosPage', () => {
  it('muestra los eventos al rol de eventos', async () => {
    api.listarEventos.mockResolvedValue([
      evento(),
      evento({ id: 'id-2', slug: 'cena', titulo: 'Cena maridaje', estado: 'Borrador' }),
    ])
    renderizar('eventos')

    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Cata de vinos mexicanos')).toBeInTheDocument()
    expect(within(tabla).getByText('Cena maridaje')).toBeInTheDocument()
    expect(screen.getByText('1 publicados · 1 borrador')).toBeInTheDocument()
  })

  it('super_admin también entra', async () => {
    api.listarEventos.mockResolvedValue([evento()])
    renderizar('super_admin')
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('niega el acceso a un rol del negocio de comidas', () => {
    api.listarEventos.mockResolvedValue([evento()])
    renderizar('finanzas')
    expect(screen.getByText('No tienes acceso a esta sección.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('el filtro "Borradores" deja fuera a los publicados', async () => {
    api.listarEventos.mockResolvedValue([
      evento(),
      evento({ id: 'id-2', slug: 'cena', titulo: 'Cena maridaje', estado: 'Borrador' }),
    ])
    renderizar('eventos')
    await screen.findByRole('table')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Borradores' }))

    const tabla = screen.getByRole('table')
    expect(within(tabla).queryByText('Cata de vinos mexicanos')).not.toBeInTheDocument()
    expect(within(tabla).getByText('Cena maridaje')).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay eventos', async () => {
    api.listarEventos.mockResolvedValue([])
    renderizar('eventos')
    expect(await screen.findByText('Aún no hay eventos')).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    api.listarEventos.mockRejectedValue(new Error('sin red'))
    renderizar('eventos')

    expect(await screen.findByText('No se pudieron cargar los eventos')).toBeInTheDocument()
    api.listarEventos.mockResolvedValue([evento()])
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument())
  })
})
