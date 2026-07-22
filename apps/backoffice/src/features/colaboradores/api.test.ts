import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del cliente: controlamos qué devuelve la consulta a usuarios_portal_empresarial.
// La cadena from().select().eq().order() se resuelve como una promesa con { data, error }.
const mocks = vi.hoisted(() => ({ order: vi.fn() }))
vi.mock('@amena/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: mocks.order,
        }),
      }),
    }),
  },
}))

import { listarUsuariosEmpresa } from './api'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listarUsuariosEmpresa', () => {
  it('deriva los roles SOLO del rol (no del comensal), expone el rol único y comeActivo', async () => {
    mocks.order.mockResolvedValue({
      data: [
        {
          id: 1,
          nombre: 'Adriana Ruiz',
          email: 'admin@x.com',
          activo: true,
          roles: [{ rol: 'admin', activo: true }],
          comensal: { id: 10, activo: true },
        },
        {
          // Tiene comensal pero NINGÚN rol de colaborador → esColaborador debe ser false.
          id: 2,
          nombre: 'Juan Pérez',
          email: 'juan@x.com',
          activo: true,
          roles: [],
          comensal: { id: 11, activo: false },
        },
        {
          // Rol colaborador inactivo no cuenta; sin comensal → comeActivo false.
          id: 3,
          nombre: 'Sin Comensal',
          email: null,
          activo: true,
          roles: [{ rol: 'colaborador', activo: false }],
          comensal: null,
        },
      ],
      error: null,
    })

    const usuarios = await listarUsuariosEmpresa(1)

    expect(usuarios).toEqual([
      {
        id: 1,
        nombre: 'Adriana Ruiz',
        email: 'admin@x.com',
        activo: true,
        esAdmin: true,
        esColaborador: false,
        rol: 'admin',
        comeActivo: true,
      },
      {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'juan@x.com',
        activo: true,
        esAdmin: false,
        esColaborador: false, // tener comensal ya NO implica colaborador
        rol: null,
        comeActivo: false,
      },
      {
        id: 3,
        nombre: 'Sin Comensal',
        email: null,
        activo: true,
        esAdmin: false,
        esColaborador: false, // rol colaborador inactivo no cuenta
        rol: null,
        comeActivo: false,
      },
    ])
  })

  it('lanza si la consulta devuelve error', async () => {
    mocks.order.mockResolvedValue({ data: null, error: new Error('boom') })
    await expect(listarUsuariosEmpresa(1)).rejects.toThrow('boom')
  })
})
