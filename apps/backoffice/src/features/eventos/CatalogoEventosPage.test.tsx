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
  listarEventosPagina: vi.fn(),
  contarEventosPorEstado: vi.fn(),
  obtenerEventoPorSlug: vi.fn(),
  guardarEvento: vi.fn(),
  obtenerResumen: vi.fn(),
  subirImagenEvento: vi.fn(),
  borrarImagenEvento: vi.fn(),
  slugify: (s: string) => s,
  CATEGORIAS: ['Cata', 'Taller', 'Cena'],
  TAMANO_PAGINA: 10,
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

/** Página con `n` eventos distintos, para poder pedir la siguiente. */
function pagina(n: number, total: number) {
  const filas = Array.from({ length: n }, (_, i) =>
    evento({ id: `id-${i}`, slug: `evento-${i}`, titulo: `Evento ${i}` })
  )
  return { filas, total }
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

/** Argumentos de la última consulta al servidor: [filtros, page, pageSize]. */
function ultimaConsulta() {
  const calls = api.listarEventosPagina.mock.calls
  return calls[calls.length - 1]
}

beforeEach(() => {
  vi.clearAllMocks()
  api.contarEventosPorEstado.mockResolvedValue({ publicados: 1, borradores: 1 })
})

describe('CatalogoEventosPage', () => {
  it('muestra los eventos al rol de eventos', async () => {
    api.listarEventosPagina.mockResolvedValue({
      filas: [
        evento(),
        evento({ id: 'id-2', slug: 'cena', titulo: 'Cena maridaje', estado: 'Borrador' }),
      ],
      total: 2,
    })
    renderizar('eventos')

    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Cata de vinos mexicanos')).toBeInTheDocument()
    expect(within(tabla).getByText('Cena maridaje')).toBeInTheDocument()
    // Los conteos del encabezado vienen de la base, no de las filas de la página.
    expect(await screen.findByText('1 publicados · 1 borrador')).toBeInTheDocument()
  })

  it('super_admin también entra', async () => {
    api.listarEventosPagina.mockResolvedValue({ filas: [evento()], total: 1 })
    renderizar('super_admin')
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('niega el acceso a un rol del negocio de comidas', () => {
    api.listarEventosPagina.mockResolvedValue({ filas: [evento()], total: 1 })
    renderizar('finanzas')
    expect(screen.getByText('No tienes acceso a esta sección.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('el filtro se resuelve en el servidor, no en el navegador', async () => {
    api.listarEventosPagina.mockResolvedValue({ filas: [evento()], total: 1 })
    renderizar('eventos')
    await screen.findByRole('table')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Borradores' }))

    await waitFor(() => expect(ultimaConsulta()[0]).toEqual({ filtro: 'Borradores', busqueda: '' }))
  })

  it('"Página siguiente" pide la página 2', async () => {
    api.listarEventosPagina.mockResolvedValue(pagina(10, 25))
    renderizar('eventos')
    await screen.findByRole('table')
    expect(ultimaConsulta()[1]).toBe(0)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Página siguiente' }))

    await waitFor(() => expect(ultimaConsulta()[1]).toBe(1))
  })

  it('cambiar de filtro regresa a la primera página', async () => {
    api.listarEventosPagina.mockResolvedValue(pagina(10, 25))
    const u = userEvent.setup()
    renderizar('eventos')
    await screen.findByRole('table')

    await u.click(screen.getByRole('button', { name: 'Página siguiente' }))
    await waitFor(() => expect(ultimaConsulta()[1]).toBe(1))

    // Sin el reset, la consulta seguiría pidiendo la página 2 de un resultado que quizá ya
    // no tiene tantas filas, y la tabla saldría vacía.
    await u.click(screen.getByRole('button', { name: 'Publicados' }))
    await waitFor(() => {
      const [filtros, page] = ultimaConsulta()
      expect(filtros).toEqual({ filtro: 'Publicados', busqueda: '' })
      expect(page).toBe(0)
    })
  })

  it('muestra el estado vacío cuando no hay eventos', async () => {
    api.listarEventosPagina.mockResolvedValue({ filas: [], total: 0 })
    renderizar('eventos')
    expect(await screen.findByText('Aún no hay eventos')).toBeInTheDocument()
  })

  it('con filtro activo y cero resultados se queda la tabla, no el estado vacío', async () => {
    // El estado vacío del catálogo reemplaza la tabla entera (y con ella los chips), así que
    // solo debe salir cuando de verdad no hay nada: sin filtro y sin búsqueda.
    api.listarEventosPagina.mockResolvedValue({ filas: [evento()], total: 1 })
    renderizar('eventos')
    await screen.findByRole('table')

    api.listarEventosPagina.mockResolvedValue({ filas: [], total: 0 })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Borradores' }))

    expect(await screen.findByText('Ningún evento coincide con el filtro.')).toBeInTheDocument()
    expect(screen.queryByText('Aún no hay eventos')).not.toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    api.listarEventosPagina.mockRejectedValue(new Error('sin red'))
    renderizar('eventos')

    expect(await screen.findByText('No se pudieron cargar los eventos')).toBeInTheDocument()
    api.listarEventosPagina.mockResolvedValue({ filas: [evento()], total: 1 })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument())
  })
})
