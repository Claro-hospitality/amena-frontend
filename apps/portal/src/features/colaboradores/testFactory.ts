import type { Colaborador, PoliticaEmpresa } from './api'

/** Factory de colaborador para tests. Sobrescribe solo lo que interese. */
export function crearColaboradorFake(overrides: Partial<Colaborador> = {}): Colaborador {
  return {
    id: 1,
    usuario_id: 5,
    user_id: null,
    activo: true,
    accesoActivo: true,
    consumoLibre: false,
    nombre: 'María López',
    email: 'maria@empresa.com',
    telefono: null,
    qr_token: '10000000-0000-0000-0000-000000000001',
    empresa: { nombre: 'Constructora Norte' },
    politica: null,
    ...overrides,
  }
}

/** Política de empresa en modo libre (L-V, máx 2/día) para tests. */
export function politicaLibreFake(overrides: Partial<PoliticaEmpresa> = {}): PoliticaEmpresa {
  return { modo_consumo: 'libre', dias_permitidos: [1, 2, 3, 4, 5], limite_diario: 2, ...overrides }
}
