import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventoFormPage } from './EventoFormPage'
import { IMAGEN_POR_OMISION } from './imagenEvento'

const api = vi.hoisted(() => ({
  listarEventos: vi.fn(),
  obtenerEventoPorSlug: vi.fn(),
  guardarEvento: vi.fn(),
  obtenerResumen: vi.fn(),
  subirImagenEvento: vi.fn(),
  borrarImagenEvento: vi.fn(),
  slugify: (s: string) => s,
  CATEGORIAS: ['Cata', 'Taller', 'Cena'],
}))
vi.mock('./api', () => api)

const URL_SUBIDA = 'http://localhost:54331/storage/v1/object/public/eventos/nueva.jpg'

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ rol: 'eventos' }} />}>
            <Route index element={<EventoFormPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

/** Llena lo mínimo que exige `eventoSchema` para que el submit llegue a la lógica de imagen. */
async function llenarCampos() {
  const u = userEvent.setup()
  await u.type(screen.getByLabelText('Nombre del evento'), 'Cata de vinos')
  await u.type(screen.getByLabelText(/Descripción corta/), 'Seis etiquetas')
  await u.type(screen.getByLabelText('Descripción completa'), 'Un párrafo.')
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-09-10' } })
  fireEvent.change(screen.getByLabelText('Hora de inicio'), { target: { value: '19:00' } })
  return u
}

/**
 * El formulario trae los mismos dos botones dos veces: la barra lateral de escritorio y la
 * barra fija de móvil. Cualquiera de las dos sirve para el submit.
 */
function boton(nombre: string) {
  return screen.getAllByRole('button', { name: nombre })[0]
}

function subirArchivo(nombre = 'foto.jpg', type = 'image/jpeg') {
  const input = screen.getByLabelText('Imagen destacada del evento')
  fireEvent.change(input, { target: { files: [new File(['bytes'], nombre, { type })] } })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.guardarEvento.mockResolvedValue({ id: 'id-1', slug: 'cata-de-vinos' })
  api.subirImagenEvento.mockResolvedValue(URL_SUBIDA)
  // jsdom no implementa createObjectURL, que es lo que usa el preview del uploader.
  window.URL.createObjectURL = vi.fn(() => 'blob:preview')
})

describe('EventoFormPage — imagen destacada', () => {
  it('no deja publicar sin imagen propia', async () => {
    renderizar()
    const u = await llenarCampos()

    await u.click(boton('Guardar y publicar'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sube una imagen para publicar el evento'
    )
    expect(api.guardarEvento).not.toHaveBeenCalled()
    expect(api.subirImagenEvento).not.toHaveBeenCalled()
  })

  it('sin imagen sí guarda como borrador, con la imagen por omisión', async () => {
    renderizar()
    const u = await llenarCampos()

    await u.click(boton('Guardar como borrador'))

    await waitFor(() => expect(api.guardarEvento).toHaveBeenCalled())
    const datos = api.guardarEvento.mock.calls[0][0]
    expect(datos.estado).toBe('Borrador')
    expect(datos.imagen_url).toBe(IMAGEN_POR_OMISION)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('con imagen sube el archivo y publica con la URL del bucket', async () => {
    renderizar()
    const u = await llenarCampos()
    subirArchivo()

    await u.click(boton('Guardar y publicar'))

    await waitFor(() => expect(api.guardarEvento).toHaveBeenCalled())
    expect(api.subirImagenEvento).toHaveBeenCalledTimes(1)
    const datos = api.guardarEvento.mock.calls[0][0]
    expect(datos.estado).toBe('Publicado')
    expect(datos.imagen_url).toBe(URL_SUBIDA)
  })

  it('rechaza un archivo que no es imagen sin llamar a Storage', async () => {
    renderizar()
    await llenarCampos()

    subirArchivo('contrato.pdf', 'application/pdf')

    expect(await screen.findByRole('alert')).toHaveTextContent('Formato no permitido')
    expect(api.subirImagenEvento).not.toHaveBeenCalled()
  })

  it('si Storage falla, el evento no se guarda a medias', async () => {
    api.subirImagenEvento.mockRejectedValue(new Error('sin permiso'))
    renderizar()
    const u = await llenarCampos()
    subirArchivo()

    await u.click(boton('Guardar y publicar'))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo subir la imagen')
    expect(api.guardarEvento).not.toHaveBeenCalled()
  })
})
